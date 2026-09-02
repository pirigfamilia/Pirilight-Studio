import { RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function RenewalsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Renovações"
        description="Domínios, hosting e subscrições — o que vence e quando, junto de todos os projetos."
      />
      <EmptyState
        icon={RefreshCw}
        title="A estrutura está pronta"
        description="A lista/timeline de renovações chega no próximo passo do plano."
      />
    </div>
  );
}
