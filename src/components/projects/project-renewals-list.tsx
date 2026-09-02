import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { renewalStatusLabel, renewalTypeLabel } from "@/lib/constants/labels";
import { formatDateDisplay, formatEuros } from "@/lib/utils/format";
import type { Renewal, RenewalStatus } from "@/types";

const VARIANT_BY_RENEWAL_STATUS: Record<RenewalStatus, "info" | "success" | "outline"> = {
  pending: "info",
  renewed: "success",
  cancelled: "outline",
};

/**
 * Lista simples e só de leitura das renovações ligadas a este Project —
 * "Hosting / 29 de agosto / 50€" (secção 11 do Round 5). Sem mutações: a
 * lógica completa de Renovações fica para o Round 6 (`/renewals`).
 */
export function ProjectRenewalsList({ renewals }: { renewals: Renewal[] }) {
  if (renewals.length === 0) {
    return <EmptyState title="Sem renovações" description="Não há renovações associadas a este projeto." />;
  }

  const sorted = [...renewals].sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((renewal) => (
        <li
          key={renewal.id}
          className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm"
        >
          <div>
            <p className="font-medium text-foreground">{renewalTypeLabel(renewal.type)}</p>
            <p className="text-xs text-muted-foreground">{formatDateDisplay(renewal.dueDate)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{formatEuros(renewal.amount)}</span>
            <Badge variant={VARIANT_BY_RENEWAL_STATUS[renewal.status]}>
              {renewalStatusLabel(renewal.status)}
            </Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}
