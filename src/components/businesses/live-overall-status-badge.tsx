"use client";

import { useEffect, useMemo } from "react";

import { BusinessOverallStatusBadge } from "@/components/domain/business-overall-status-badge";
import { deriveBusinessOverallStatus } from "@/lib/data/business-overview";
import { useProjectStore } from "@/store/use-project-store";
import { useTaskStore } from "@/store/use-task-store";
import type { MaintenanceRequest, Project, Task } from "@/types";

interface LiveOverallStatusBadgeProps {
  /** Ids dos Projects/Tasks deste negócio — pré-resolvidos no servidor (D7), nunca dados globais no cliente. */
  projectIds: string[];
  taskIds: string[];
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
 * no Website/PiriCard Detail, ou uma Task concluída em `/tasks`, aparecer de
 * imediato aqui também, sem recarregar a página.
 */
export function LiveOverallStatusBadge({
  projectIds,
  taskIds,
  maintenanceRequests,
  initialProjects,
  initialTasks,
  className,
}: LiveOverallStatusBadgeProps) {
  const initializeProjects = useProjectStore((state) => state.initialize);
  const projects = useProjectStore((state) => state.projects);
  const initializeTasks = useTaskStore((state) => state.initialize);
  const tasks = useTaskStore((state) => state.tasks);

  useEffect(() => {
    initializeProjects(initialProjects);
    initializeTasks(initialTasks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = useMemo(() => {
    const scopedProjects = projects.filter((p) => projectIds.includes(p.id));
    const scopedTasks = tasks.filter((t) => taskIds.includes(t.id));
    return deriveBusinessOverallStatus({ projects: scopedProjects, tasks: scopedTasks, maintenanceRequests });
  }, [projects, tasks, projectIds, taskIds, maintenanceRequests]);

  return <BusinessOverallStatusBadge status={status} className={className} />;
}
