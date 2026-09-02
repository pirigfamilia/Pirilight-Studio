import { Handshake } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function CommercialPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Comercial"
        description="Prospects, leads e negócios interessados — com a próxima ação sempre à vista."
      />
      <EmptyState
        icon={Handshake}
        title="A estrutura está pronta"
        description="O funil comercial, com follow-ups e próxima ação por negócio, chega no próximo passo do plano."
      />
    </div>
  );
}
