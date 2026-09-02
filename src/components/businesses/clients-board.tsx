"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CreditCard, Globe, Search } from "lucide-react";

import { BusinessCard } from "@/components/businesses/business-card";
import {
  CLIENT_FILTERS,
  matchesFilter,
  type ClientFilter,
  type ClientListRow,
} from "@/components/businesses/client-list-row";
import { BusinessOverallStatusBadge } from "@/components/domain/business-overall-status-badge";
import { EntityListTable } from "@/components/domain/entity-list-table";
import { PaymentProgress } from "@/components/domain/payment-progress";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { renewalTypeLabel } from "@/lib/constants/labels";
import { formatDateDisplay } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

function matchesQuery(row: ClientListRow, query: string): boolean {
  if (query.trim().length === 0) return true;
  const haystack = `${row.summary.business.name} ${row.summary.business.industry}`.toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

export function ClientsBoard({ rows }: { rows: ClientListRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ClientFilter>("all");

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesQuery(row, query) && matchesFilter(row, filter)),
    [rows, query, filter],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar por nome ou indústria…"
            className="pl-8"
            aria-label="Pesquisar clientes"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0">
          {CLIENT_FILTERS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={filter === option.value ? "secondary" : "outline"}
              onClick={() => setFilter(option.value)}
              className="shrink-0"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <EntityListTable
        rows={filteredRows}
        rowKey={(row) => row.summary.business.id}
        renderMobileCard={(row) => <BusinessCard row={row} />}
        emptyState={
          <EmptyState
            title="Nenhum cliente encontrado"
            description="Experimenta ajustar a pesquisa ou os filtros."
          />
        }
        columns={[
          {
            header: "Negócio",
            cell: (row) => (
              <Link
                href={`/businesses/${row.summary.business.id}`}
                className="block hover:text-info hover:underline"
              >
                <p className="font-medium text-foreground">{row.summary.business.name}</p>
                <p className="text-xs text-muted-foreground">{row.summary.business.industry}</p>
              </Link>
            ),
          },
          {
            header: "Estado",
            cell: (row) => <BusinessOverallStatusBadge status={row.summary.overallStatus} />,
          },
          {
            header: "Projetos",
            cell: (row) => (
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <span className={cn("flex items-center gap-1", row.summary.hasWebsite && "text-info")}>
                  <Globe className="h-3.5 w-3.5" />
                </span>
                <span className={cn("flex items-center gap-1", row.summary.hasPiriCard && "text-info")}>
                  <CreditCard className="h-3.5 w-3.5" />
                </span>
                <span>{row.summary.activeProjectsCount} ativos</span>
              </div>
            ),
          },
          {
            header: "Pagamentos",
            className: "min-w-[180px]",
            cell: (row) => <PaymentProgress summary={row.summary.paymentSummary} compact />,
          },
          {
            header: "Próxima renovação",
            cell: (row) =>
              row.summary.nextRenewal ? (
                <span className="text-muted-foreground">
                  {renewalTypeLabel(row.summary.nextRenewal.type)} ·{" "}
                  {formatDateDisplay(row.summary.nextRenewal.dueDate)}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          {
            header: "Tarefas",
            cell: (row) => <span className="text-muted-foreground">{row.summary.openTasksCount}</span>,
          },
          {
            header: "Responsável",
            cell: (row) => (
              <span className="text-muted-foreground">{row.responsibleName ?? "—"}</span>
            ),
          },
        ]}
      />
    </div>
  );
}
