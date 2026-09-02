import Link from "next/link";
import { CreditCard, Globe } from "lucide-react";

import type { ClientListRow } from "@/components/businesses/client-list-row";
import { LiveOverallStatusBadge } from "@/components/businesses/live-overall-status-badge";
import { PaymentProgress } from "@/components/domain/payment-progress";
import { Card } from "@/components/ui/card";
import { formatDateDisplay } from "@/lib/utils/format";
import { renewalTypeLabel } from "@/lib/constants/labels";
import { cn } from "@/lib/utils";
import type { Project, Task } from "@/types";

interface BusinessCardProps {
  row: ClientListRow;
  /** Snapshots globais do servidor — repassados ao `LiveOverallStatusBadge` (D7). */
  initialProjects: Project[];
  initialTasks: Task[];
}

/** Cartão de negócio — a vista mobile da lista de Clientes (a tabela vira isto abaixo de `md`). */
export function BusinessCard({ row, initialProjects, initialTasks }: BusinessCardProps) {
  const { summary, responsibleName } = row;
  const { business, nextRenewal } = summary;

  return (
    <Card className="p-4">
      <Link href={`/businesses/${business.id}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground hover:text-info hover:underline">
              {business.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">{business.industry}</p>
          </div>
          <LiveOverallStatusBadge
            projectIds={row.projectIds}
            taskIds={row.taskIds}
            maintenanceRequests={row.maintenanceRequests}
            initialProjects={initialProjects}
            initialTasks={initialTasks}
          />
        </div>
      </Link>

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className={cn("flex items-center gap-1", summary.hasWebsite && "text-info")}>
          <Globe className="h-3.5 w-3.5" /> {summary.hasWebsite ? "Website" : "—"}
        </span>
        <span className={cn("flex items-center gap-1", summary.hasPiriCard && "text-info")}>
          <CreditCard className="h-3.5 w-3.5" /> {summary.hasPiriCard ? "PiriCard" : "—"}
        </span>
        <span>
          {summary.activeProjectsCount} projeto{summary.activeProjectsCount === 1 ? "" : "s"} ativo
          {summary.activeProjectsCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-3">
        <PaymentProgress summary={summary.paymentSummary} compact />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {nextRenewal
            ? `${renewalTypeLabel(nextRenewal.type)} — ${formatDateDisplay(nextRenewal.dueDate)}`
            : "Sem renovações agendadas"}
        </span>
        <span>
          {summary.openTasksCount} tarefa{summary.openTasksCount === 1 ? "" : "s"}
        </span>
      </div>

      {responsibleName && (
        <p className="mt-2 text-xs text-muted-foreground">Responsável: {responsibleName}</p>
      )}
    </Card>
  );
}
