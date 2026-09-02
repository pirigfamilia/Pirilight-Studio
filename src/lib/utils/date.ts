/**
 * Aritmética de datas de calendário, sem dependências.
 *
 * Todas as datas de negócio da app são strings `YYYY-MM-DD`. Comparar dias de
 * calendário sobre estas strings — ancorando-as a meia-noite **UTC** — é exato
 * e imune a:
 *
 * - fuso do processo (o servidor corre em UTC, o Sny e o Bino estão em Lisboa);
 * - horário de verão (UTC não tem DST, por isso `+n dias` nunca cai no dia errado);
 * - `new Date("2026-09-03")` (UTC) vs `parseISO("2026-09-03")` (local), o erro
 *   clássico de misturar as duas.
 *
 * A **única** linha sensível a fuso horário em toda a aplicação é `todayIso()`,
 * que converte um instante no dia de calendário como o Sny e o Bino o veem.
 */

/** Fuso do negócio. É aqui — e só aqui — que "hoje" é decidido. */
export const BUSINESS_TIME_ZONE = "Europe/Lisbon";

const MS_PER_DAY = 86_400_000;

/** Instante → dia de calendário em Lisboa ("2026-09-02"). `en-CA` dá YYYY-MM-DD. */
export function todayIso(now: Date): string {
  return now.toLocaleDateString("en-CA", { timeZone: BUSINESS_TIME_ZONE });
}

function toUtcMillis(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00Z`);
}

/**
 * Diferença em dias de calendário: `target - reference`.
 * Negativo = passado (atrasado), 0 = hoje, positivo = futuro.
 */
export function diffCalendarDays(targetIso: string, referenceIso: string): number {
  return Math.round((toUtcMillis(targetIso) - toUtcMillis(referenceIso)) / MS_PER_DAY);
}

/** Soma (ou subtrai) dias de calendário a uma data ISO, devolvendo ISO. */
export function addDaysIso(isoDate: string, days: number): string {
  return new Date(toUtcMillis(isoDate) + days * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Timestamp ISO completo a partir de um dia de calendário (meia-noite UTC). */
export function isoDateToTimestamp(isoDate: string): string {
  return new Date(toUtcMillis(isoDate)).toISOString();
}

/** `true` se `a` for anterior a `b` (dias de calendário). */
export function isBeforeIso(a: string, b: string): boolean {
  return toUtcMillis(a) < toUtcMillis(b);
}
