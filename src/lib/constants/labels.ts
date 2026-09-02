import type {
  DealStage,
  LifecycleStatus,
  PaymentStatus,
  Priority,
  ProjectType,
  RenewalType,
  Urgency,
  WaitingReason,
  WorkStatus,
} from "@/types";

/**
 * Traduções PT-PT de todos os valores internos.
 *
 * O código fica em inglês (alinhado com a futura base de dados); a interface
 * fala português. Este é o único sítio onde essa fronteira existe — nenhum
 * componente escreve o seu próprio texto de estado.
 *
 * `satisfies Record<T, string>` faz o TypeScript exigir exaustividade: acrescentar
 * um estado novo parte o build aqui, em vez de aparecer um enum cru na UI.
 *
 * (Criados neste round, ainda não consumidos pela UI — a interface do Round 1
 * mantém-se exatamente como está.)
 */

export const WORK_STATUS_LABELS = {
  todo: "Por fazer",
  in_progress: "Em progresso",
  waiting_on_client: "À espera do cliente",
  blocked: "Bloqueado",
  done: "Concluído",
} satisfies Record<WorkStatus, string>;

export const WAITING_REASON_LABELS = {
  content: "Conteúdo",
  photos: "Fotografias",
  approval: "Aprovação",
  payment: "Pagamento",
  access_login: "Acesso/Login",
  response: "Resposta",
  other: "Outro",
} satisfies Record<WaitingReason, string>;

export const LIFECYCLE_STATUS_LABELS = {
  prospect: "Prospect",
  lead: "Lead",
  interested: "Interessado",
  client: "Cliente",
  inactive: "Inativo",
} satisfies Record<LifecycleStatus, string>;

export const DEAL_STAGE_LABELS = {
  new: "Novo",
  contacted: "Contacto obtido",
  proposal_sent: "Proposta enviada",
  negotiating: "Em negociação",
  won: "Ganho",
  lost: "Perdido",
} satisfies Record<DealStage, string>;

export const PROJECT_TYPE_LABELS = {
  website: "Website",
  piricard: "PiriCard",
} satisfies Record<ProjectType, string>;

export const RENEWAL_TYPE_LABELS = {
  domain: "Domínio",
  hosting: "Hosting",
  card_subscription: "Subscrição PiriCard",
  maintenance_plan: "Plano de manutenção",
} satisfies Record<RenewalType, string>;

export const PAYMENT_STATUS_LABELS = {
  not_started: "Por receber",
  partial: "Parcial",
  paid: "Pago",
  overdue: "Em atraso",
} satisfies Record<PaymentStatus, string>;

export const PRIORITY_LABELS = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
} satisfies Record<Priority, string>;

export const URGENCY_LABELS = {
  overdue: "Atrasado",
  due_today: "Hoje",
  due_soon: "Em breve",
  stalled: "Parado",
} satisfies Record<Urgency, string>;

export function workStatusLabel(status: WorkStatus): string {
  return WORK_STATUS_LABELS[status];
}

export function waitingReasonLabel(reason: WaitingReason): string {
  return WAITING_REASON_LABELS[reason];
}

export function lifecycleStatusLabel(status: LifecycleStatus): string {
  return LIFECYCLE_STATUS_LABELS[status];
}

export function dealStageLabel(stage: DealStage): string {
  return DEAL_STAGE_LABELS[stage];
}

export function renewalTypeLabel(type: RenewalType): string {
  return RENEWAL_TYPE_LABELS[type];
}

export function urgencyLabel(urgency: Urgency): string {
  return URGENCY_LABELS[urgency];
}
