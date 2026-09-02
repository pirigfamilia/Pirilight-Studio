import type { BusinessSummary } from "@/types";

/**
 * Uma linha da lista de Clientes — o `BusinessSummary` já com os campos
 * derivados que a pesquisa/filtros e o cartão mobile precisam, calculados uma
 * vez no servidor (onde "hoje" é autoritário) em vez de em cada componente.
 */
export interface ClientListRow {
  summary: BusinessSummary;
  responsibleName: string | null;
  hasPendingPayment: boolean;
  hasUpcomingRenewal: boolean;
}

export type ClientFilter = "all" | "website" | "piricard" | "pendingPayment" | "upcomingRenewal";

export const CLIENT_FILTERS: { value: ClientFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "website", label: "Com website" },
  { value: "piricard", label: "Com PiriCard" },
  { value: "pendingPayment", label: "Com pagamentos pendentes" },
  { value: "upcomingRenewal", label: "Com renovação próxima" },
];

export function matchesFilter(row: ClientListRow, filter: ClientFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "website":
      return row.summary.hasWebsite;
    case "piricard":
      return row.summary.hasPiriCard;
    case "pendingPayment":
      return row.hasPendingPayment;
    case "upcomingRenewal":
      return row.hasUpcomingRenewal;
  }
}
