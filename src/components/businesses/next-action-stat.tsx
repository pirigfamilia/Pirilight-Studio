"use client";

import { useEffect, useMemo } from "react";

import { FollowUpStatus } from "@/components/domain/follow-up-status";
import { deriveNextAction } from "@/lib/data/business-overview";
import { buildTasksWithDetail } from "@/lib/data/task-board";
import { useTaskStore } from "@/store/use-task-store";
import type { Business, Deal, LifecycleStatus, MaintenanceRequest, Project, Task } from "@/types";

interface NextActionStatProps {
  business: Business;
  projects: Project[];
  deals: Deal[];
  maintenanceRequests: MaintenanceRequest[];
  openDeal: Deal | null;
  lifecycleStatus: LifecycleStatus;
  /** Snapshot global do servidor — só para semear a `useTaskStore` se ainda não estiver inicializada. */
  initialTasks: Task[];
  today: string;
}

/**
 * O stat "Próxima ação" do cabeçalho do Business Detail — a única parte do
 * cabeçalho que precisa de ser cliente, porque é a única que depende de
 * Tasks, e Tasks agora vivem (também) na `useTaskStore`. Reaproveita
 * `deriveNextAction` tal e qual (Round 3.1) — só troca a fonte das Tasks do
 * snapshot do servidor para a store, para refletir de imediato uma edição
 * feita em `/tasks` ou na tab Tarefas deste mesmo negócio.
 */
export function NextActionStat({
  business,
  projects,
  deals,
  maintenanceRequests,
  openDeal,
  lifecycleStatus,
  initialTasks,
  today,
}: NextActionStatProps) {
  const initialize = useTaskStore((state) => state.initialize);
  const allTasks = useTaskStore((state) => state.tasks);

  useEffect(() => {
    initialize(initialTasks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const businessTasks = useMemo(() => {
    const withDetail = buildTasksWithDetail(allTasks, {
      businesses: [business],
      projects,
      deals,
      maintenanceRequests,
    });
    return withDetail.filter((item) => item.businessId === business.id).map((item) => item.task);
  }, [allTasks, business, projects, deals, maintenanceRequests]);

  const nextAction = useMemo(
    () => deriveNextAction({ tasks: businessTasks, maintenanceRequests, openDeal, lifecycleStatus }, today),
    [businessTasks, maintenanceRequests, openDeal, lifecycleStatus, today],
  );

  // "future" é um ranking interno de deriveNextAction, sem cor de urgência
  // própria — FollowUpStatus já sabe mostrar uma data distante a cinzento
  // quando recebe urgency: null com daysDelta preenchido.
  const followUpUrgency = nextAction.urgency === "future" ? null : nextAction.urgency;

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Próxima ação</p>
      <p className="text-sm font-medium text-foreground">{nextAction.title}</p>
      {nextAction.source !== "none" && (
        <FollowUpStatus urgency={followUpUrgency} daysDelta={nextAction.daysDelta} />
      )}
    </div>
  );
}
