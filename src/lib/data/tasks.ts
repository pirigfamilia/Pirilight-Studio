import type { Task, TaskRelatedEntityType } from "@/types";

import { getMockData, read } from "./internal";

export async function getTasks(now: Date = new Date()): Promise<Task[]> {
  return read(getMockData(now).tasks);
}

export async function getTaskById(id: string, now: Date = new Date()): Promise<Task | null> {
  return read(getMockData(now).tasks.find((t) => t.id === id) ?? null);
}

export async function getTasksByAssignee(
  assigneeId: string,
  now: Date = new Date(),
): Promise<Task[]> {
  return read(getMockData(now).tasks.filter((t) => t.assigneeId === assigneeId));
}

/** Resolve o par polimórfico (`relatedEntityType` + `relatedEntityId`). */
export async function getTasksForEntity(
  type: TaskRelatedEntityType,
  entityId: string,
  now: Date = new Date(),
): Promise<Task[]> {
  return read(
    getMockData(now).tasks.filter(
      (t) => t.relatedEntityType === type && t.relatedEntityId === entityId,
    ),
  );
}

/** Tarefas ainda nossas: nem concluídas, nem à espera do cliente. */
export async function getOpenTasks(now: Date = new Date()): Promise<Task[]> {
  return read(
    getMockData(now).tasks.filter((t) => t.status !== "done" && t.status !== "waiting_on_client"),
  );
}
