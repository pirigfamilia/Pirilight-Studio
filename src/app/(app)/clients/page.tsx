import type { ClientListRow } from "@/components/businesses/client-list-row";
import { ClientsBoard } from "@/components/businesses/clients-board";
import { PageHeader } from "@/components/layout/page-header";
import {
  RENEWALS_PANEL_WINDOW_DAYS,
  getBusinessSummaries,
  getClientBusinesses,
  getUsers,
} from "@/lib/data";
import { diffCalendarDays, todayIso } from "@/lib/utils/date";

// Renovações e pagamentos dependem do dia de hoje — sem prerender estático.
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const now = new Date();
  const businesses = await getClientBusinesses(now);
  const [summaries, users] = await Promise.all([
    getBusinessSummaries(businesses, now),
    getUsers(now),
  ]);

  const nameByUserId = new Map(users.map((user) => [user.id, user.name]));
  const today = todayIso(now);

  const rows: ClientListRow[] = summaries.map((summary) => ({
    summary,
    responsibleName: summary.responsibleUserId
      ? (nameByUserId.get(summary.responsibleUserId) ?? null)
      : null,
    hasPendingPayment: summary.paymentSummary.remainingValue > 0,
    hasUpcomingRenewal:
      summary.nextRenewal !== null &&
      diffCalendarDays(summary.nextRenewal.dueDate, today) <= RENEWALS_PANEL_WINDOW_DAYS,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clientes"
        description="Clientes, projetos, pagamentos e renovações num só lugar."
      />
      <ClientsBoard rows={rows} />
    </div>
  );
}
