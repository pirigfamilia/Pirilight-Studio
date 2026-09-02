import { isOpenDealStage } from "@/lib/validation/deal";
import { diffCalendarDays, todayIso } from "@/lib/utils/date";
import { summarizePayments } from "@/lib/utils/payment";
import type {
  Business,
  BusinessOverallStatus,
  BusinessOverview,
  BusinessSummary,
  CommercialDealCard,
  Deal,
  Project,
  ProjectWithDetail,
  Urgency,
} from "@/types";

import { ATTENTION_WINDOW_DAYS, STALLED_AFTER_DAYS, classifyUrgency } from "./attention-rules";
import { getBusinesses, getBusinessById, getContactsByBusinessId } from "./businesses";
import { getDeals, getDealsByBusinessId } from "./deals";
import { getPaymentsByBusinessId, getPaymentsByProjectId } from "./payments";
import {
  getPiriCardByProjectId,
  getProjectsByBusinessId,
  getWebsiteByProjectId,
} from "./projects";
import { getRenewalsByBusinessId } from "./renewals";
import { getTasksByBusinessId } from "./tasks";

/**
 * Leituras compostas — o que num backend real seria um `join`. Vivem aqui, e
 * não nas páginas, porque a derivação (estado geral, responsável, próxima
 * renovação) é a mesma seja qual for o ecrã que a usa, e é o tipo de lógica
 * que vale a pena testar isoladamente.
 */

/**
 * O estado mais importante a saber sobre um negócio agora, derivado dos seus
 * projetos — nunca guardado. Um bloqueio pesa mais do que "à espera", que
 * pesa mais do que "em progresso": é a mesma prioridade que rege o feed de
 * atenção, aplicada ao nível do negócio.
 */
export function deriveBusinessOverallStatus(projects: readonly Project[]): BusinessOverallStatus {
  if (projects.length === 0) return "none";
  if (projects.some((p) => p.status === "blocked")) return "blocked";
  if (projects.some((p) => p.status === "waiting_on_client")) return "waiting_on_client";
  if (projects.some((p) => p.status === "in_progress" || p.status === "todo")) return "in_progress";
  return "done";
}

/** O responsável mais recente: quem tratou por último de alguma oportunidade deste negócio. */
export function deriveResponsibleUserId(deals: readonly Deal[]): string | null {
  if (deals.length === 0) return null;
  const [mostRecent] = [...deals].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return mostRecent?.responsibleUserId ?? null;
}

/** O deal aberto mais relevante — o que ainda tem trabalho comercial por fazer. */
export function pickOpenDeal(deals: readonly Deal[]): Deal | null {
  const open = deals.filter((d) => isOpenDealStage(d.stage));
  if (open.length === 0) return null;
  const [mostRecent] = [...open].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return mostRecent ?? null;
}

/**
 * Urgência do follow-up de um deal — a mesma regra do feed de atenção
 * (`attention-rules.dealAttention`), mas devolvendo sempre o `daysDelta`
 * quando há uma data, mesmo fora da janela de 7 dias: o board Comercial
 * mostra "em 20 dias" a cinzento, não esconde a data.
 */
export function computeDealFollowUp(
  deal: Deal,
  todayIsoDate: string,
): { urgency: Urgency | null; daysDelta: number | null } {
  if (!isOpenDealStage(deal.stage)) return { urgency: null, daysDelta: null };

  if (deal.nextActionDate !== null) {
    return {
      urgency: classifyUrgency(deal.nextActionDate, todayIsoDate, ATTENTION_WINDOW_DAYS.deal),
      daysDelta: diffCalendarDays(deal.nextActionDate, todayIsoDate),
    };
  }

  const daysSinceContact = -diffCalendarDays(deal.lastInteractionDate, todayIsoDate);
  if (daysSinceContact >= STALLED_AFTER_DAYS) {
    return { urgency: "stalled", daysDelta: diffCalendarDays(deal.lastInteractionDate, todayIsoDate) };
  }

  return { urgency: null, daysDelta: null };
}

/** O board Comercial: um card por Deal (inclui Ganho/Perdido — é o histórico do funil). */
export async function getCommercialPipeline(now: Date = new Date()): Promise<CommercialDealCard[]> {
  const [deals, businesses] = await Promise.all([getDeals(now), getBusinesses(now)]);
  const businessById = new Map(businesses.map((b) => [b.id, b]));
  const today = todayIso(now);

  const cards: CommercialDealCard[] = [];
  for (const deal of deals) {
    const business = businessById.get(deal.businessId);
    if (business === undefined) continue; // integridade referencial garante que isto não acontece

    cards.push({ deal, business, ...computeDealFollowUp(deal, today) });
  }
  return cards;
}

async function buildProjectsWithDetail(
  projects: readonly Project[],
  now: Date,
): Promise<ProjectWithDetail[]> {
  return Promise.all(
    projects.map(async (project) => {
      const [website, piriCard, payments] = await Promise.all([
        project.type === "website" ? getWebsiteByProjectId(project.id, now) : Promise.resolve(null),
        project.type === "piricard" ? getPiriCardByProjectId(project.id, now) : Promise.resolve(null),
        getPaymentsByProjectId(project.id, now),
      ]);

      return {
        project,
        website,
        piriCard,
        paymentSummary: summarizePayments(payments, todayIso(now)),
      };
    }),
  );
}

/** Resumo de um negócio para a lista de Clientes. */
export async function getBusinessSummary(
  business: Business,
  now: Date = new Date(),
): Promise<BusinessSummary> {
  const [projects, payments, renewals, tasks, deals] = await Promise.all([
    getProjectsByBusinessId(business.id, now),
    getPaymentsByBusinessId(business.id, now),
    getRenewalsByBusinessId(business.id, now),
    getTasksByBusinessId(business.id, now),
    getDealsByBusinessId(business.id, now),
  ]);

  const pendingRenewals = renewals
    .filter((r) => r.status === "pending")
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));

  return {
    business,
    activeProjectsCount: projects.filter((p) => p.status !== "done").length,
    hasWebsite: projects.some((p) => p.type === "website"),
    hasPiriCard: projects.some((p) => p.type === "piricard"),
    overallStatus: deriveBusinessOverallStatus(projects),
    paymentSummary: summarizePayments(payments, todayIso(now)),
    nextRenewal: pendingRenewals[0] ?? null,
    openTasksCount: tasks.filter((t) => t.status !== "done" && t.status !== "waiting_on_client")
      .length,
    responsibleUserId: deriveResponsibleUserId(deals),
  };
}

/** Um resumo por negócio — usado pela lista de Clientes. */
export async function getBusinessSummaries(
  businesses: readonly Business[],
  now: Date = new Date(),
): Promise<BusinessSummary[]> {
  return Promise.all(businesses.map((business) => getBusinessSummary(business, now)));
}

/** Tudo o que o Business Detail Hub precisa, numa só leitura composta. */
export async function getBusinessOverview(
  businessId: string,
  now: Date = new Date(),
): Promise<BusinessOverview | null> {
  const business = await getBusinessById(businessId, now);
  if (business === null) return null;

  const [contacts, deals, projects, renewals, tasks, payments] = await Promise.all([
    getContactsByBusinessId(businessId, now),
    getDealsByBusinessId(businessId, now),
    getProjectsByBusinessId(businessId, now),
    getRenewalsByBusinessId(businessId, now),
    getTasksByBusinessId(businessId, now),
    getPaymentsByBusinessId(businessId, now),
  ]);

  const projectsWithDetail = await buildProjectsWithDetail(projects, now);
  const primaryContact = contacts.find((c) => c.id === business.primaryContactId) ?? null;

  return {
    business,
    primaryContact,
    contacts,
    deals,
    openDeal: pickOpenDeal(deals),
    projects: projectsWithDetail,
    renewals,
    tasks,
    payments,
    paymentSummary: summarizePayments(payments, todayIso(now)),
    responsibleUserId: deriveResponsibleUserId(deals),
    overallStatus: deriveBusinessOverallStatus(projects),
  };
}
