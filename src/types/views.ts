import type { z } from "zod";

import type { businessSchema } from "@/lib/validation/business";
import type { contactSchema } from "@/lib/validation/contact";
import type { dealSchema } from "@/lib/validation/deal";
import type { maintenanceRequestSchema } from "@/lib/validation/maintenance-request";
import type { paymentSchema } from "@/lib/validation/payment";
import type { piriCardSchema, projectSchema, websiteSchema } from "@/lib/validation/project";
import type { renewalSchema } from "@/lib/validation/renewal";
import type { taskSchema } from "@/lib/validation/task";
import type { WaitingReason, WorkStatus } from "@/lib/validation/work-status";

// Importados diretamente dos schemas (não de "@/types") para não criar um
// ciclo com o barrel que reexporta este próprio ficheiro.
type Business = z.infer<typeof businessSchema>;
type Contact = z.infer<typeof contactSchema>;
type Deal = z.infer<typeof dealSchema>;
type Project = z.infer<typeof projectSchema>;
type Website = z.infer<typeof websiteSchema>;
type PiriCard = z.infer<typeof piriCardSchema>;
type Task = z.infer<typeof taskSchema>;
type Renewal = z.infer<typeof renewalSchema>;
type Payment = z.infer<typeof paymentSchema>;
type MaintenanceRequest = z.infer<typeof maintenanceRequestSchema>;

/**
 * Tipos de **vista** — escritos à mão de propósito.
 *
 * Ao contrário dos tipos de entidade (que são linhas de tabela e por isso são
 * inferidos dos schemas), estes nunca serão tabelas: são o resultado de
 * agregação e ordenação. Regra da casa: **zod = linhas, escrito à mão = vistas.**
 */

export const ATTENTION_KINDS = ["task", "deal", "payment", "renewal", "maintenance"] as const;
export type AttentionKind = (typeof ATTENTION_KINDS)[number];

export const URGENCIES = ["overdue", "due_today", "due_soon", "stalled"] as const;
export type Urgency = (typeof URGENCIES)[number];

/**
 * Uma coisa que exige a nossa atenção agora. É a peça central do produto —
 * alimenta "Precisa da tua atenção" e "Próximas ações" no Dashboard.
 *
 * Alguns campos são desnormalizados (`businessName`, `ownerId`) porque é
 * exatamente isso que um `join` do Supabase devolveria, e evita que a UI faça
 * N+1 leituras por linha. `daysDelta` é calculado onde o `now` é autoritário
 * (no servidor), para nenhum componente o recalcular com o relógio do browser.
 */
export interface AttentionItem {
  /** `${kind}:${sourceId}` — chave estável para React, dedupe e desempate de ordenação. */
  id: string;
  kind: AttentionKind;
  sourceId: string;
  title: string;
  /** Sempre um dia de calendário `YYYY-MM-DD`. */
  dueOrStalledDate: string;
  urgency: Urgency;
  /** Dias de calendário: negativo = atrasado, 0 = hoje, positivo = futuro. */
  daysDelta: number;
  href: string;
  /** `null` quando o item não está ligado a nenhum negócio (ex.: tarefa interna). */
  businessId: string | null;
  businessName: string | null;
  /** Quem é responsável, quando aplicável (Task → assignee, Deal → responsável). */
  ownerId: string | null;
}

/**
 * Algo parado à espera de terceiros. Vive num feed **separado** do de atenção,
 * de propósito: não é trabalho nosso atrasado, e não pode aparecer como tal.
 */
export interface WaitingOnClientItem {
  id: string;
  kind: "project" | "task" | "maintenance";
  sourceId: string;
  title: string;
  waitingReason: WaitingReason;
  /** Desde quando está neste estado (usa `updatedAt` do registo). */
  waitingSince: string;
  href: string;
  businessId: string;
  businessName: string;
}

/** Resumo financeiro agregado, usado pelo futuro `PaymentProgress`. */
export interface PaymentSummary {
  totalValue: number;
  amountReceived: number;
  remainingValue: number;
  hasOverdue: boolean;
}

/** Projeto bloqueado internamente — é nosso para desbloquear. */
export interface BlockedProjectItem {
  projectId: string;
  name: string;
  status: WorkStatus;
  businessId: string;
  businessName: string;
  href: string;
}

/**
 * Um projeto com a sua linha de detalhe já junta — é isto que um `join` do
 * Supabase devolveria de uma vez, em vez de a UI ter de pedir Website ou
 * PiriCard à parte para cada projeto.
 */
export interface ProjectWithDetail {
  project: Project;
  website: Website | null;
  piriCard: PiriCard | null;
  paymentSummary: PaymentSummary;
}

/**
 * Resumo de um negócio para a lista de Clientes — uma linha por Business, com
 * o suficiente para decidir se vale a pena abrir o detalhe.
 *
 * `overallStatus` é derivado dos projetos do negócio (nunca guardado): mostra
 * a coisa mais importante a saber sobre ele agora, não um enum genérico.
 */
export type BusinessOverallStatus =
  | "blocked"
  | "waiting_on_client"
  | "in_progress"
  | "done"
  | "none";

export interface BusinessSummary {
  business: Business;
  activeProjectsCount: number;
  hasWebsite: boolean;
  hasPiriCard: boolean;
  overallStatus: BusinessOverallStatus;
  paymentSummary: PaymentSummary;
  nextRenewal: Renewal | null;
  openTasksCount: number;
  responsibleUserId: string | null;
}

/**
 * Urgência de ranking usada só por `deriveNextAction` — **não** é o `Urgency`
 * global de `attention-rules.ts`/`getAttentionItems()`, que continua com os
 * seus 4 valores e a sua janela. Aqui há um quinto valor, `future`, e
 * `due_soon` fica limitado a 7 dias — para um Deal genuinamente parado
 * (`stalled`) nunca ficar escondido atrás de uma Task só porque a Task tem
 * uma data, ainda que a 30 dias.
 */
export const RANKED_URGENCIES = ["overdue", "due_today", "due_soon", "stalled", "future"] as const;
export type RankedUrgency = (typeof RANKED_URGENCIES)[number];

/**
 * A próxima ação REAL de um negócio — não só `Deal.nextAction`. Junta Tasks e
 * MaintenanceRequests nossos em aberto com o follow-up do Deal aberto, e
 * escolhe o mais urgente de todos, sem dar vantagem a nenhum por ser de um
 * tipo em particular.
 */
export interface NextAction {
  source: "task" | "maintenance" | "deal" | "none";
  title: string;
  date: string | null;
  urgency: RankedUrgency | null;
  daysDelta: number | null;
}

/**
 * Tudo o que o Business Detail Hub precisa, junto numa só leitura — como
 * seria um `select` com vários `join`s no Supabase.
 */
export interface BusinessOverview {
  business: Business;
  primaryContact: Contact | null;
  contacts: Contact[];
  deals: Deal[];
  /** O deal aberto mais relevante — uma das fontes possíveis de `nextAction`. */
  openDeal: Deal | null;
  projects: ProjectWithDetail[];
  renewals: Renewal[];
  tasks: Task[];
  maintenanceRequests: MaintenanceRequest[];
  payments: Payment[];
  paymentSummary: PaymentSummary;
  responsibleUserId: string | null;
  overallStatus: BusinessOverallStatus;
  /** A próxima ação real deste negócio — ver `deriveNextAction`. */
  nextAction: NextAction;
}

/** Um Deal com o seu Business já junto, para o board Comercial. */
export interface CommercialDealCard {
  deal: Deal;
  business: Business;
  /** `null` quando o deal não tem `nextActionDate` nem está claramente parado. */
  urgency: Urgency | null;
  daysDelta: number | null;
}

/**
 * Uma Task com o Business/Project a que pertence já resolvidos (o par
 * polimórfico `relatedEntityType`/`relatedEntityId` percorrido até ao fim) —
 * usada em `/tasks` e na tab Tarefas do Business Detail. `null` em ambos
 * quando a Task não está ligada a nada, ou está ligada a uma entidade que
 * ainda não resolve num negócio conhecido (`goal`, nesta fase).
 */
export interface TaskWithDetail {
  task: Task;
  businessId: string | null;
  businessName: string | null;
  projectId: string | null;
  projectName: string | null;
}
