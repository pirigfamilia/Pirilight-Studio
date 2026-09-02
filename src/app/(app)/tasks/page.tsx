import { ListChecks } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tarefas"
        description="Tudo o que o Sny e o Bino têm para fazer, num só sítio."
      />
      <EmptyState
        icon={ListChecks}
        title="A estrutura está pronta"
        description="A lista de tarefas — com os estados Em progresso, À espera do cliente, Bloqueado e Concluído — chega no próximo passo do plano."
      />
    </div>
  );
}
