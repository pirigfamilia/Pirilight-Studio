import { Globe } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function WebsitesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Websites"
        description="Os projetos de website da PiriLight Studio, do início à entrega."
      />
      <EmptyState
        icon={Globe}
        title="A estrutura está pronta"
        description="A lista de websites, com o estado de cada projeto e o ponto de pagamento, chega no próximo passo do plano."
      />
    </div>
  );
}
