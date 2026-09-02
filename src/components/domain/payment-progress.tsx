import { formatEuros } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { PaymentSummary } from "@/types";

/**
 * Barra de progresso simples (recebido vs. total) — substitui qualquer
 * necessidade de gráfico para acompanhar pagamentos (decisão do plano,
 * secção 1). Usada no Business Detail Hub e na lista de Clientes.
 */
export function PaymentProgress({
  summary,
  compact = false,
}: {
  summary: PaymentSummary;
  compact?: boolean;
}) {
  const { totalValue, amountReceived, remainingValue, hasOverdue } = summary;

  if (totalValue === 0) {
    return <p className="text-xs text-muted-foreground">Sem pagamentos associados</p>;
  }

  const percent = Math.max(0, Math.min(100, Math.round((amountReceived / totalValue) * 100)));
  const isPaid = remainingValue <= 0;
  const barColor = isPaid ? "bg-success" : hasOverdue ? "bg-destructive" : "bg-info";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", barColor)} style={{ width: `${percent}%` }} />
      </div>
      <div
        className={cn(
          "flex items-baseline justify-between text-xs",
          compact ? "text-muted-foreground" : "",
        )}
      >
        <span className={compact ? "" : "text-foreground"}>
          {formatEuros(amountReceived)} de {formatEuros(totalValue)}
        </span>
        {!isPaid && (
          <span className={hasOverdue ? "font-medium text-destructive" : "text-muted-foreground"}>
            Em falta {formatEuros(remainingValue)}
          </span>
        )}
        {isPaid && <span className="font-medium text-success">Pago</span>}
      </div>
    </div>
  );
}
