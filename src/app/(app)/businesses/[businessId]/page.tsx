import { notFound } from "next/navigation";

import type { BusinessDetailTabDef } from "@/components/businesses/business-detail-tabs";
import { BusinessDetailTabs } from "@/components/businesses/business-detail-tabs";
import { BusinessHeader } from "@/components/businesses/business-header";
import { DealHistoryRow } from "@/components/businesses/deal-history-row";
import { ProjectSummaryCard } from "@/components/businesses/project-summary-card";
import { FollowUpStatus } from "@/components/domain/follow-up-status";
import { PaymentProgress } from "@/components/domain/payment-progress";
import { WaitingReasonTag } from "@/components/domain/waiting-reason-tag";
import { WorkStatusBadge } from "@/components/domain/work-status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants/labels";
import {
  RENEWALS_PANEL_WINDOW_DAYS,
  classifyUrgency,
  getBusinessOverview,
  getUsers,
} from "@/lib/data";
import { derivePaymentStatus } from "@/lib/utils/payment";
import { diffCalendarDays, todayIso } from "@/lib/utils/date";
import { formatDateDisplay, formatEuros } from "@/lib/utils/format";
import type { BusinessOverview, PaymentStatus, User } from "@/types";

// A urgência de follow-ups, renovações e pagamentos depende do dia de hoje —
// sem prerender estático.
export const dynamic = "force-dynamic";

interface BusinessDetailPageProps {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const PAYMENT_STATUS_VARIANT: Record<PaymentStatus, "muted" | "info" | "success" | "destructive"> = {
  not_started: "muted",
  partial: "info",
  paid: "success",
  overdue: "destructive",
};

export default async function BusinessDetailPage({ params, searchParams }: BusinessDetailPageProps) {
  const [{ businessId }, { tab }] = await Promise.all([params, searchParams]);
  const now = new Date();
  const overview = await getBusinessOverview(businessId, now);
  if (overview === null) notFound();

  const users = await getUsers(now);
  const userById = new Map(users.map((user) => [user.id, user]));
  const today = todayIso(now);
  const responsible = overview.responsibleUserId ? userById.get(overview.responsibleUserId) : undefined;

  const tabs: BusinessDetailTabDef[] = [
    { value: "overview", label: "Visão geral", content: <OverviewTab overview={overview} today={today} /> },
    { value: "contacts", label: "Contactos", content: <ContactsTab overview={overview} /> },
    {
      value: "commercial",
      label: "Comercial",
      content: <CommercialTab overview={overview} userById={userById} today={today} />,
    },
    { value: "projects", label: "Projetos", content: <ProjectsTab overview={overview} /> },
    { value: "renewals", label: "Renovações", content: <RenewalsTab overview={overview} today={today} /> },
    {
      value: "tasks",
      label: "Tarefas",
      content: <TasksTab overview={overview} userById={userById} />,
    },
    { value: "payments", label: "Pagamentos", content: <PaymentsTab overview={overview} today={today} /> },
  ];

  const defaultTab = tabs.some((t) => t.value === tab) ? tab! : "overview";

  return (
    <div className="flex flex-col gap-6">
      <BusinessHeader overview={overview} responsible={responsible} today={today} />
      <BusinessDetailTabs tabs={tabs} defaultValue={defaultTab} />
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="mb-3 text-sm font-semibold text-foreground">{children}</h2>;
}

function OverviewTab({ overview, today }: { overview: BusinessOverview; today: string }) {
  const activity = buildRecentActivity(overview).slice(0, 5);
  const activeProjects = overview.projects.filter((p) => p.project.status !== "done");
  const attentionProjects = overview.projects.filter(
    (p) => p.project.status === "blocked" || p.project.status === "waiting_on_client",
  );
  const upcoming = buildUpcomingEvents(overview, today).slice(0, 4);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardContent className="p-4">
          <SectionTitle>Próximos eventos</SectionTitle>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nada agendado nos próximos tempos.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {upcoming.map((event) => (
                <li key={event.text} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-foreground">{event.text}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDateDisplay(event.date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <SectionTitle>Bloqueios / à espera do cliente</SectionTitle>
          {attentionProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum projeto bloqueado ou à espera.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {attentionProjects.map((p) => (
                <li key={p.project.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-foreground">{p.project.name}</span>
                  <div className="flex items-center gap-2">
                    {p.project.waitingReason && <WaitingReasonTag reason={p.project.waitingReason} />}
                    <WorkStatusBadge status={p.project.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <SectionTitle>Projetos ativos</SectionTitle>
          {activeProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem projetos ativos neste momento.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {activeProjects.map((p) => (
                <li key={p.project.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-foreground">{p.project.name}</span>
                  <WorkStatusBadge status={p.project.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <SectionTitle>Pagamentos</SectionTitle>
          <PaymentProgress summary={overview.paymentSummary} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardContent className="p-4">
          <SectionTitle>Atividade recente</SectionTitle>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem atividade registada.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {activity.map((item) => (
                <li key={item.text} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-foreground">{item.text}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDateDisplay(item.date.slice(0, 10))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ContactsTab({ overview }: { overview: BusinessOverview }) {
  if (overview.contacts.length === 0) {
    return <EmptyState title="Sem contactos" description="Ainda não há contactos associados a este negócio." />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {overview.contacts.map((contact) => (
        <Card key={contact.id}>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{contact.name}</p>
              {contact.id === overview.business.primaryContactId && (
                <Badge variant="secondary">Principal</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{contact.role}</p>
            <p className="text-xs text-muted-foreground">{contact.email}</p>
            <p className="text-xs text-muted-foreground">{contact.phone}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CommercialTab({
  overview,
  userById,
  today,
}: {
  overview: BusinessOverview;
  userById: Map<string, User>;
  today: string;
}) {
  if (overview.deals.length === 0) {
    return <EmptyState title="Sem histórico comercial" description="Este negócio ainda não teve nenhuma oportunidade registada." />;
  }

  const sorted = [...overview.deals].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((deal) => (
        <DealHistoryRow
          key={deal.id}
          deal={deal}
          responsible={userById.get(deal.responsibleUserId)}
          today={today}
        />
      ))}
    </div>
  );
}

function ProjectsTab({ overview }: { overview: BusinessOverview }) {
  if (overview.projects.length === 0) {
    return <EmptyState title="Sem projetos" description="Ainda não há Websites ou PiriCards associados a este negócio." />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {overview.projects.map((item) => (
        <ProjectSummaryCard key={item.project.id} item={item} />
      ))}
    </div>
  );
}

function RenewalsTab({ overview, today }: { overview: BusinessOverview; today: string }) {
  if (overview.renewals.length === 0) {
    return <EmptyState title="Sem renovações" description="Nenhum dos projetos deste negócio tem renovações registadas." />;
  }

  const sorted = [...overview.renewals].sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((renewal) => {
        const isPending = renewal.status === "pending";
        const urgency = isPending
          ? classifyUrgency(renewal.dueDate, today, RENEWALS_PANEL_WINDOW_DAYS)
          : null;
        const daysDelta = isPending ? diffCalendarDays(renewal.dueDate, today) : null;

        return (
          <Card key={renewal.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {renewal.type === "domain"
                    ? "Domínio"
                    : renewal.type === "hosting"
                      ? "Hosting"
                      : renewal.type === "card_subscription"
                        ? "Subscrição PiriCard"
                        : "Plano de manutenção"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateDisplay(renewal.dueDate)} · {formatEuros(renewal.amount)}
                </p>
              </div>
              {isPending ? (
                <FollowUpStatus urgency={urgency} daysDelta={daysDelta} />
              ) : (
                <Badge variant={renewal.status === "renewed" ? "success" : "muted"}>
                  {renewal.status === "renewed" ? "Renovada" : "Cancelada"}
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function TasksTab({ overview, userById }: { overview: BusinessOverview; userById: Map<string, User> }) {
  if (overview.tasks.length === 0) {
    return <EmptyState title="Sem tarefas" description="Nenhuma tarefa ligada a este negócio ou aos seus projetos." />;
  }

  const sorted = [...overview.tasks].sort((a, b) => {
    if (a.dueDate === null) return 1;
    if (b.dueDate === null) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  });

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((task) => (
        <Card key={task.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">{task.title}</p>
              <p className="text-xs text-muted-foreground">
                {userById.get(task.assigneeId)?.name ?? "—"} ·{" "}
                {task.dueDate ? formatDateDisplay(task.dueDate) : "Sem data"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {task.waitingReason && <WaitingReasonTag reason={task.waitingReason} />}
              <WorkStatusBadge status={task.status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PaymentsTab({ overview, today }: { overview: BusinessOverview; today: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-4">
          <SectionTitle>Resumo</SectionTitle>
          <PaymentProgress summary={overview.paymentSummary} />
        </CardContent>
      </Card>

      {overview.payments.length === 0 ? (
        <EmptyState title="Sem pagamentos" description="Ainda não há pagamentos registados para este negócio." />
      ) : (
        <div className="flex flex-col gap-3">
          {overview.payments.map((payment) => {
            const status = derivePaymentStatus(payment, today);
            return (
              <Card key={payment.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatEuros(payment.amountReceived)} de {formatEuros(payment.totalValue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Previsto para {formatDateDisplay(payment.expectedDate)}
                    </p>
                  </div>
                  <Badge variant={PAYMENT_STATUS_VARIANT[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function buildRecentActivity(overview: BusinessOverview): { date: string; text: string }[] {
  const items = [
    ...overview.tasks.map((t) => ({ date: t.updatedAt, text: `Tarefa atualizada — ${t.title}` })),
    ...overview.deals.map((d) => ({ date: d.updatedAt, text: `Comercial atualizado — ${d.title}` })),
    ...overview.projects.map((p) => ({
      date: p.project.updatedAt,
      text: `Projeto atualizado — ${p.project.name}`,
    })),
  ];
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function buildUpcomingEvents(
  overview: BusinessOverview,
  today: string,
): { date: string; text: string }[] {
  const events: { date: string; text: string }[] = [];

  if (overview.openDeal?.nextActionDate) {
    events.push({ date: overview.openDeal.nextActionDate, text: overview.openDeal.nextAction ?? "Follow-up" });
  }
  for (const renewal of overview.renewals) {
    if (renewal.status !== "pending") continue;
    events.push({ date: renewal.dueDate, text: `Renovação — ${renewal.type}` });
  }
  for (const task of overview.tasks) {
    if (task.dueDate === null || task.status === "done" || task.status === "waiting_on_client") continue;
    events.push({ date: task.dueDate, text: task.title });
  }

  return events
    .filter((event) => diffCalendarDays(event.date, today) >= 0)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}
