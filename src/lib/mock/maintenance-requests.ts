import type { MaintenanceRequest } from "@/types";

import { BUSINESS_IDS } from "./businesses";
import { PROJECT_IDS } from "./projects";
import type { SeedDates } from "./seed-dates";

export const MAINTENANCE_IDS = {
  clinicaHorarios: "mnt-clinica-horarios",
  ginasioPrecos: "mnt-ginasio-precos",
  cafeCentralFechado: "mnt-cafe-central-rodape",
} as const;

/**
 * Pedidos de manutenção/alteração (Phase 1B como ecrã, mas o tipo e os dados
 * existem já porque alimentam o feed de atenção).
 *
 * Cobertura: um pedido com data (entra pela data), um pedido **sem data**
 * aberto há muito tempo (entra como `stalled`), e um pedido concluído (nunca
 * entra, por muito antigo que seja).
 */
export function buildMaintenanceRequests(d: SeedDates): MaintenanceRequest[] {
  return [
    {
      id: MAINTENANCE_IDS.clinicaHorarios,
      projectId: PROJECT_IDS.clinicaWeb,
      businessId: BUSINESS_IDS.clinicaSorriso,
      title: "Atualizar horários de atendimento",
      description: "Novos horários de verão para a página de contactos.",
      status: "todo",
      waitingReason: null,
      priority: "normal",
      requestedAt: d.day(-11),
      dueDate: d.day(4),
      createdAt: d.stamp(-11),
      updatedAt: d.stamp(-11),
    },
    {
      // Sem data e aberto há 20 dias → stalled.
      id: MAINTENANCE_IDS.ginasioPrecos,
      projectId: PROJECT_IDS.ginasioWeb,
      businessId: BUSINESS_IDS.ginasioImpulso,
      title: "Rever tabela de preços das aulas",
      description: "Pedido por email, sem prazo acordado.",
      status: "todo",
      waitingReason: null,
      priority: "low",
      requestedAt: d.day(-20),
      dueDate: null,
      createdAt: d.stamp(-20),
      updatedAt: d.stamp(-20),
    },
    {
      // Concluído e antigo: nunca gera atenção.
      id: MAINTENANCE_IDS.cafeCentralFechado,
      projectId: PROJECT_IDS.cafeCentralCard,
      businessId: BUSINESS_IDS.cafeCentral,
      title: "Corrigir rodapé com morada antiga",
      description: "Morada desatualizada no verso dos cartões.",
      status: "done",
      waitingReason: null,
      priority: "normal",
      requestedAt: d.day(-70),
      dueDate: d.day(-65),
      createdAt: d.stamp(-70),
      updatedAt: d.stamp(-64),
    },
  ];
}
