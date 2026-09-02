import { Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clientes"
        description="Os negócios que já compraram um serviço — a mesma fonte de dados do Comercial, só filtrada."
      />
      <EmptyState
        icon={Users}
        title="A estrutura está pronta"
        description="A lista de clientes chega no próximo passo do plano, junto com o ecrã de detalhe partilhado com o Comercial."
      />
    </div>
  );
}
