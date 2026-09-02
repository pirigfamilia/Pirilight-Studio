import { Badge, type BadgeProps } from "@/components/ui/badge";
import { businessOverallStatusLabel } from "@/lib/constants/labels";
import type { BusinessOverallStatus } from "@/types";

/**
 * O estado mais importante a saber sobre um negócio agora — derivado dos seus
 * projetos (`deriveBusinessOverallStatus`, `lib/data/business-overview.ts`),
 * nunca guardado. Usada na lista de Clientes e no cabeçalho do Business
 * Detail Hub: é o mesmo resumo, visto dos dois sítios.
 */
const VARIANT_BY_STATUS: Record<BusinessOverallStatus, BadgeProps["variant"]> = {
  blocked: "destructive",
  waiting_on_client: "secondary",
  in_progress: "info",
  done: "success",
  none: "outline",
};

export function BusinessOverallStatusBadge({
  status,
  className,
}: {
  status: BusinessOverallStatus;
  className?: string;
}) {
  return (
    <Badge variant={VARIANT_BY_STATUS[status]} className={className}>
      {businessOverallStatusLabel(status)}
    </Badge>
  );
}
