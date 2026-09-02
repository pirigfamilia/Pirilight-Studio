# PiriLight Studio — Command Center

Aplicação interna e privada de gestão do negócio da **PiriLight Studio** e da **PiriCard**, usada pelo Sny e pelo Bino.

O plano de implementação completo está em [`/root/.claude/plans/i-want-to-build-stateless-wolf.md`](../../root/.claude/plans/i-want-to-build-stateless-wolf.md) (secções 0–15: arquitetura, modelo de dados, navegação, ordem de implementação, etc.).

## Estado atual — Round 1 (fundação visual)

Esta ronda entrega apenas a fundação visual, sem dados nem lógica de negócio:

- Next.js 16 (App Router) + TypeScript (`strict` + `noUncheckedIndexedAccess`) + Tailwind CSS v3.4
- Identidade visual real da PiriLight (dark-first), com light mode via `next-themes`
- shadcn/ui — primitivos essenciais (Button, Card, Badge, Tabs, Sheet, Skeleton, Tooltip, DropdownMenu, ScrollArea, Avatar, EmptyState)
- `AppShell` (Sidebar + Topbar, "chrome" sempre escuro, brand-first) + navegação mobile (Sheet)
- As 11 rotas estruturais (Dashboard, Tarefas, Comercial, Clientes, Websites, PiriCards, Renovações, Goals, Maintenance, Finance, Materials), com o Dashboard a reproduzir visualmente a estrutura final e as restantes como placeholders
- Interface em Português de Portugal, responsivo (desktop + mobile)

Ainda **sem**: dados de Business, Tasks, Deals/CRM funcional, Websites/PiriCards funcionais, Renewals, Zustand stores de domínio, Supabase, backend, pagamentos ou automações — ver o plano, secção "Âmbito Autorizado para a Primeira Execução (Round 1)".

## Desenvolvimento

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # build de produção
pnpm lint     # eslint
```
