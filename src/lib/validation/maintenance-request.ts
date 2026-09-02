import { z } from "zod";

import { auditFields, entityId, isoDate } from "./common";
import { prioritySchema } from "./task";
import {
  WAITING_REASON_INVARIANT_MESSAGE,
  hasValidWaitingReason,
  waitingReasonSchema,
  workStatusSchema,
} from "./work-status";

/**
 * Pedido de manutenção/alteração sobre um projeto já entregue. Usa o mesmo
 * `WorkStatus` das Tasks e dos Projects — uma só linguagem de estado em toda a
 * aplicação.
 */
export const maintenanceRequestSchema = z
  .strictObject({
    id: entityId,
    projectId: entityId,
    businessId: entityId,
    title: z.string().min(1),
    description: z.string().min(1),
    status: workStatusSchema,
    waitingReason: waitingReasonSchema.nullable(),
    priority: prioritySchema,
    requestedAt: isoDate,
    /** Quando existe, é a data pela qual o pedido é ordenado no feed de atenção. */
    dueDate: isoDate.nullable(),
    ...auditFields,
  })
  .refine(hasValidWaitingReason, { message: WAITING_REASON_INVARIANT_MESSAGE });

export type MaintenanceRequest = z.infer<typeof maintenanceRequestSchema>;
