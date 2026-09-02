import { AlertTriangle, CalendarClock, Clock, type LucideIcon } from "lucide-react";

import { describeDueDate, type DueDateTone } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

/**
 * Tradução visual de `describeDueDate` — o único sítio onde a data de uma
 * Task vira texto. `overdue`/`today` usam o laranja de marca (`primary`,
 * mesma convenção do Round 3.1), `soon` um azul informativo, `future`/`none`
 * ficam neutros.
 */
const ICON_BY_TONE: Record<DueDateTone, LucideIcon> = {
  overdue: AlertTriangle,
  today: Clock,
  soon: CalendarClock,
  future: CalendarClock,
  none: CalendarClock,
};

const TONE_CLASS: Record<DueDateTone, string> = {
  overdue: "text-primary",
  today: "text-primary",
  soon: "text-info",
  future: "text-muted-foreground",
  none: "text-muted-foreground italic",
};

export function TaskDueLabel({
  dueDate,
  today,
  className,
}: {
  dueDate: string | null;
  today: string;
  className?: string;
}) {
  const { label, tone } = describeDueDate(dueDate, today);
  const Icon = ICON_BY_TONE[tone];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs font-medium", TONE_CLASS[tone], className)}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </span>
  );
}
