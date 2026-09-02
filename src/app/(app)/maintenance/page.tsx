import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default function MaintenancePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Maintenance / Pedidos"
        description="Pedidos de manutenção e alteração sobre projetos já entregues."
        action={<Badge variant="muted">Em breve</Badge>}
      />
      <EmptyState title="Em breve" description="Phase 1B — sem prioridade nesta ronda." />
    </div>
  );
}
