import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Tabela genérica para listas de entidades (hoje Clientes; amanhã Websites,
 * PiriCards, …) — colunas configuráveis, sem `onClick` (a navegação vive
 * dentro de uma célula, normalmente um `<Link>`, para o componente continuar
 * a poder ser um Server Component).
 *
 * Em ecrãs pequenos a tabela desaparece e dá lugar a `renderMobileCard` — a
 * mesma lista, noutra forma, nunca as duas ao mesmo tempo.
 */
export interface EntityListColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface EntityListTableProps<T> {
  columns: EntityListColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  renderMobileCard: (row: T) => ReactNode;
  emptyState?: ReactNode;
}

export function EntityListTable<T>({
  columns,
  rows,
  rowKey,
  renderMobileCard,
  emptyState,
}: EntityListTableProps<T>) {
  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {columns.map((column) => (
                <th key={column.header} className={cn("px-4 py-3 font-medium", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="transition-colors hover:bg-accent/40">
                {columns.map((column) => (
                  <td key={column.header} className={cn("px-4 py-3 align-middle", column.className)}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <div key={rowKey(row)}>{renderMobileCard(row)}</div>
        ))}
      </div>
    </>
  );
}
