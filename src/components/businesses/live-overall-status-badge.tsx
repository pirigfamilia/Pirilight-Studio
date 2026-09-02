"use client";

import { useMemo } from "react";

import { useLiveBusinessScope } from "@/components/businesses/use-live-business-scope";
import { BusinessOverallStatusBadge } from "@/components/domain/business-overall-status-badge";
import { deriveBusinessOverallStatus } from "@/lib/data/business-overview";
import type { MaintenanceRequest, Project, Task } from "@/types";

interface LiveOverallStatusBadgeProps {
  businessId: string;
  /** Ids estruturais deste negócio — nunca mudam depois de criados, por isso são seguros para pré-calcular no servidor (Round 5.1). */
  projectIds: string[];
  dealIds: string[];
  /** Já scoped a este negócio — nunca mutado nesta fase. */
  maintenanceRequests: MaintenanceRequest[];
  /** Snapshots globais do servidor — só para semear as stores se ainda não estiverem inicializadas. */
  initialProjects: Project[];
  initialTasks: Task[];
  className?: string;
}

/**
 * O badge "Sem trabalho ativo"/"Bloqueado"/… (D5) recalculado ao vivo a
 * partir de `useProjectStore`/`useTaskStore` — usado no cabeçalho do Business
 * Detail e em cada linha de Clientes (D6), para uma mudança de estado feita
 * no Website/PiriCard Detail, ou uma Task concluída/criada em `/tasks`,
 * aparecer de imediato aqui também, sem recarregar a página.
 *
 * Round 5.1: já não recebe `taskIds` pré-calculados (essa lista "congelava"
 * no momento em que a página carregava e nunca via uma Task criada depois).
 * Em vez disso resolve `useLiveBusinessScope`, que testa cada Task da store
 * contra os ids **estruturais** do negócio (`taskBelongsToBusiness`) — uma
 * Task nova entra corretamente, sem depender de nenhum snapshot antigo.
 */
export function LiveOverallStatusBadge({
  businessId,
  projectIds,
  dealIds,
  maintenanceRequests,
  initialProjects,
  initialTasks,
  className,
}: LiveOverallStatusBadgeProps) {
  const maintenanceRequestIds = useMemo(() => maintenanceRequests.map((m) => m.id), [maintenanceRequests]);

  const { projects, tasks } = useLiveBusinessScope({
    businessId,
    projectIds,
    dealIds,
    maintenanceRequestIds,
    initialProjects,
    initialTasks,
  });

  const status = useMemo(
    () => deriveBusinessOverallStatus({ projects, tasks, maintenanceRequests }),
    [projects, tasks, maintenanceRequests],
  );

  return <BusinessOverallStatusBadge status={status} className={className} />;
}
