import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default function GoalsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Goals"
        description="Progresso dos objetivos atuais da PiriLight Studio e da PiriCard."
        action={<Badge variant="muted">Em breve</Badge>}
      />
      <EmptyState title="Em breve" description="Phase 1B — sem prioridade nesta ronda." />
    </div>
  );
}
