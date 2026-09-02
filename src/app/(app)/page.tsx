import { AlertTriangle, Clock, ArrowRight, PauseCircle, Rocket, Handshake, RefreshCw, Target } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * Dashboard — versão placeholder (Round 1).
 *
 * Reproduz a estrutura real de secções do centro de comando (plano,
 * secção 8) com conteúdo estático escrito diretamente aqui. Sem
 * `getAttentionItems()`, sem dados, sem componentes de domínio — isso
 * entra a partir do passo 6+ do plano. O objetivo aqui é só visual: a app
 * já "parecer" o centro de comando final.
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Bom dia, Sny"
        description="Segunda-feira, 2 de setembro — aqui está o que precisa da tua atenção."
      />

      {/* 1. Precisa da tua atenção */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Tarefas atrasadas", value: 3, icon: AlertTriangle, tone: "text-primary" },
          { label: "Follow-ups atrasados", value: 2, icon: Handshake, tone: "text-primary" },
          { label: "Projetos bloqueados", value: 1, icon: PauseCircle, tone: "text-destructive" },
          { label: "Renovações próximas", value: 2, icon: RefreshCw, tone: "text-info" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className={`h-5 w-5 shrink-0 ${tone}`} />
              <div>
                <p className="text-2xl font-semibold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* 2. Hoje */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-info" /> Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border p-0">
              {[
                { title: "Fazer follow-up — Phone Stop", who: "Bino" },
                { title: "Rever texto do site — Boi na Brasa", who: "Sny" },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between gap-3 px-6 py-3">
                  <span className="text-sm">{item.title}</span>
                  <Badge variant="secondary">{item.who}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 3. Próximas ações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Próximas ações</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border p-0">
              {[
                { business: "Phone Stop", action: "Fazer follow-up", who: "Bino", when: "Hoje" },
                { business: "Boi na Brasa", action: "Atualizar ementa", who: "Sny", when: "Amanhã" },
                { business: "Beauty Connection", action: "Preparar PiriCard", who: "Bino", when: "Quinta" },
              ].map((item) => (
                <div
                  key={item.business}
                  className="flex flex-col gap-1 px-6 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{item.business}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{item.action}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.who}</Badge>
                    <span className="text-xs text-muted-foreground">{item.when}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 4. À espera do cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">À espera do cliente</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border p-0">
              {[
                { title: "Website — Boi na Brasa", reason: "Fotografias" },
                { title: "PiriCard — Beauty Connection", reason: "Aprovação" },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between gap-3 px-6 py-3">
                  <span className="text-sm">{item.title}</span>
                  <Badge variant="secondary">{item.reason}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {/* 5. Produção ativa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Rocket className="h-4 w-4 text-info" /> Produção ativa
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border p-0">
              {[
                { title: "Website — Phone Stop", status: "Em progresso" },
                { title: "PiriCard — Café Central", status: "Em progresso" },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between gap-3 px-6 py-3">
                  <span className="text-sm">{item.title}</span>
                  <Badge variant="info">{item.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 6. Comercial / Follow-ups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Handshake className="h-4 w-4 text-info" /> Comercial / Follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border p-0">
              {[
                { title: "Phone Stop", stage: "Contacto obtido" },
                { title: "Studio Vetorial", stage: "Proposta enviada" },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between gap-3 px-6 py-3">
                  <span className="text-sm">{item.title}</span>
                  <Badge variant="muted">{item.stage}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 7. Renovações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <RefreshCw className="h-4 w-4 text-info" /> Renovações
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border p-0">
              {[
                { title: "Domínio — Boi na Brasa", when: "Amanhã" },
                { title: "Hosting — Phone Stop", when: "Em 12 dias" },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between gap-3 px-6 py-3">
                  <span className="text-sm">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.when}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 8. Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-info" /> Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>5 novos clientes este trimestre</span>
                  <span className="text-muted-foreground">3/5</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-3/5 rounded-full bg-primary" />
                </div>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">Detalhe em Goals (Phase 1B)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
