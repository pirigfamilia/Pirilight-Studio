import type { Payment, PaymentStatus, PaymentSummary } from "@/types";

import { isBeforeIso } from "./date";

/**
 * O valor em falta é **sempre calculado**, nunca guardado — é a única forma de
 * garantir que não mente quando o recebido é atualizado.
 *
 * Não é limitado a zero de propósito: um valor negativo significa que
 * recebemos mais do que o total, ou seja, um erro nos dados. Escondê-lo com um
 * `Math.max(0, …)` só atrasaria a descoberta. (O schema já impede o caso, com
 * `amountReceived <= totalValue`.)
 */
export function getRemainingValue(payment: Pick<Payment, "totalValue" | "amountReceived">): number {
  return roundEuros(payment.totalValue - payment.amountReceived);
}

/** Arredonda a cêntimos, evitando o lixo típico da vírgula flutuante. */
export function roundEuros(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Estado apresentado ao utilizador = estado guardado + `overdue` derivado.
 *
 * `overdue` nunca é guardado (ver `validation/payment.ts`): depende da data de
 * hoje, por isso é calculado no momento da leitura.
 */
export function derivePaymentStatus(payment: Payment, todayIso: string): PaymentStatus {
  if (payment.paymentStatus === "paid") return "paid";
  if (getRemainingValue(payment) > 0 && isBeforeIso(payment.expectedDate, todayIso)) {
    return "overdue";
  }
  return payment.paymentStatus;
}

/** Agrega vários pagamentos (de um negócio ou de um projeto) numa vista única. */
export function summarizePayments(payments: readonly Payment[], todayIso: string): PaymentSummary {
  const totalValue = roundEuros(payments.reduce((sum, p) => sum + p.totalValue, 0));
  const amountReceived = roundEuros(payments.reduce((sum, p) => sum + p.amountReceived, 0));

  return {
    totalValue,
    amountReceived,
    remainingValue: roundEuros(totalValue - amountReceived),
    hasOverdue: payments.some((p) => derivePaymentStatus(p, todayIso) === "overdue"),
  };
}
