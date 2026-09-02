import { CreditCard } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function PiriCardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="PiriCards"
        description="Os projetos PiriCard, do design à entrega."
      />
      <EmptyState
        icon={CreditCard}
        title="A estrutura está pronta"
        description="A lista de PiriCards, com o estado de produção e o ponto de pagamento, chega no próximo passo do plano."
      />
    </div>
  );
}
