import type { WaitingReason, WorkStatus } from "@/lib/validation/work-status";

/**
 * Tipos de **vista** — escritos à mão de propósito.
 *
 * Ao contrário dos tipos de entidade (que são linhas de tabela e por isso são
 * inferidos dos schemas), estes nunca serão tabelas: são o resultado de
 * agregação e ordenação. Regra da casa: **zod = linhas, escrito à mão = vistas.**
 */

export const ATTENTION_KINDS = ["task", "deal", "payment", "renewal", "maintenance"] as const;
export type AttentionKind = (typeof ATTENTION_KINDS)[number];

export const URGENCIES = ["overdue", "due_today", "due_soon", "stalled"] as const;
export type Urgency = (typeof URGENCIES)[number];

/**
 * Uma coisa que exige a nossa atenção agora. É a peça central do produto —
 * alimenta "Precisa da tua atenção" e "Próximas ações" no Dashboard.
 *
 * Alguns campos são desnormalizados (`businessName`, `ownerId`) porque é
 * exatamente isso que um `join` do Supabase devolveria, e evita que a UI faça
 * N+1 leituras por linha. `daysDelta` é calculado onde o `now` é autoritário
 * (no servidor), para nenhum componente o recalcular com o relógio do browser.
 */
export interface AttentionItem {
  /** `${kind}:${sourceId}` — chave estável para React, dedupe e desempate de ordenação. */
  id: string;
  kind: AttentionKind;
  sourceId: string;
  title: string;
  /** Sempre um dia de calendário `YYYY-MM-DD`. */
  dueOrStalledDate: string;
  urgency: Urgency;
  /** Dias de calendário: negativo = atrasado, 0 = hoje, positivo = futuro. */
  daysDelta: number;
  href: string;
  /** `null` quando o item não está ligado a nenhum negócio (ex.: tarefa interna). */
  businessId: string | null;
  businessName: string | null;
  /** Quem é responsável, quando aplicável (Task → assignee, Deal → responsável). */
  ownerId: string | null;
}

/**
 * Algo parado à espera de terceiros. Vive num feed **separado** do de atenção,
 * de propósito: não é trabalho nosso atrasado, e não pode aparecer como tal.
 */
export interface WaitingOnClientItem {
  id: string;
  kind: "project" | "task" | "maintenance";
  sourceId: string;
  title: string;
  waitingReason: WaitingReason;
  /** Desde quando está neste estado (usa `updatedAt` do registo). */
  waitingSince: string;
  href: string;
  businessId: string;
  businessName: string;
}

/** Resumo financeiro agregado, usado pelo futuro `PaymentProgress`. */
export interface PaymentSummary {
  totalValue: number;
  amountReceived: number;
  remainingValue: number;
  hasOverdue: boolean;
}

/** Projeto bloqueado internamente — é nosso para desbloquear. */
export interface BlockedProjectItem {
  projectId: string;
  name: string;
  status: WorkStatus;
  businessId: string;
  businessName: string;
  href: string;
}
