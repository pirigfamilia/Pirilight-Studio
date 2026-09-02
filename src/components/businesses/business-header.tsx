import type { ReactNode } from "react";

import { BusinessOverallStatusBadge } from "@/components/domain/business-overall-status-badge";
import { FollowUpStatus } from "@/components/domain/follow-up-status";
import { LifecycleStatusBadge } from "@/components/domain/lifecycle-status-badge";
import type { BusinessOverview, User } from "@/types";

function HeaderStat({ label, value, extra }: { label: string; value: string; extra?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
      {extra}
    </div>
  );
}

/**
 * Cabeçalho do Business Detail Hub — a primeira coisa que o Sny ou o Bino
 * veem ao abrir um negócio: quem é, em que estado está, e o que fazer a
 * seguir. Tudo o resto (as abas) é detalhe de apoio a isto.
 */
export function BusinessHeader({
  overview,
  responsible,
}: {
  overview: BusinessOverview;
  responsible: User | undefined;
}) {
  const { business, primaryContact, nextAction } = overview;
  // "future" é um ranking interno de deriveNextAction, sem cor de urgência
  // própria — FollowUpStatus já sabe mostrar uma data distante a cinzento
  // quando recebe urgency: null com daysDelta preenchido.
  const followUpUrgency = nextAction.urgency === "future" ? null : nextAction.urgency;

  return (
    <div className="flex flex-col gap-5 border-b border-border pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{business.name}</h1>
            <LifecycleStatusBadge status={business.lifecycleStatus} />
          </div>
          <p className="text-sm text-muted-foreground">
            {business.industry} · {business.location}
          </p>
        </div>
        <BusinessOverallStatusBadge status={overview.overallStatus} className="text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <HeaderStat
          label="Contacto principal"
          value={primaryContact ? `${primaryContact.name} · ${primaryContact.role}` : "—"}
        />
        <HeaderStat label="Responsável" value={responsible?.name ?? "—"} />
        <HeaderStat
          label="Próxima ação"
          value={nextAction.title}
          extra={
            nextAction.source !== "none" && (
              <FollowUpStatus urgency={followUpUrgency} daysDelta={nextAction.daysDelta} />
            )
          }
        />
      </div>
    </div>
  );
}
