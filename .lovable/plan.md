

## Paginacao e Excel completo na Auditoria de OS

### 1. Paginacao da lista de OS

**Arquivo: `src/components/auditoria/AuditoriaGestorView.tsx`**

- Adicionar estado `currentPage` (default 1), resetado para 1 quando filtros mudam
- Usar o hook `usePagination` ja existente em `src/components/ui/pagination-controls.tsx` para calcular paginas
- Renderizar apenas os itens da pagina atual (`getPageItems(currentPage)`) no lugar de `filteredOrders.map`
- Adicionar o componente `PaginationControls` abaixo da lista de cards
- 15 itens por pagina

### 2. Excel com dados completos (incluindo itens)

**Arquivo: `src/lib/generateAuditExcel.ts`**

Criar nova funcao `generateFullAuditExcel` que:
- Recebe todas as orders (sem filtro)
- Para cada order, faz fetch dos items via `fetchAuditOrderItems`
- Gera planilha com 2 abas:
  - **Aba "Auditorias"**: dados das OS (numero, site, motivo, tecnico, status, resultado, prazo, notas, criacao, conclusao)
  - **Aba "Itens"**: todos os itens de todas as OS (numero OS, descricao, unidade, quantidade, quantidade auditada, status, observacao, data auditoria)
- Auto-width nas colunas

**Arquivo: `src/components/auditoria/AuditoriaGestorView.tsx`**

- Adicionar botao "Excel Completo" ao lado do botao "Excel" existente
- O botao existente continua exportando apenas as OS filtradas (resumo)
- O novo botao exporta TODAS as OS com todos os itens detalhados
- Indicador de loading durante a geracao (pode demorar por causa dos fetches dos itens)

### Mudancas tecnicas

| Arquivo | Tipo |
|---|---|
| `src/components/auditoria/AuditoriaGestorView.tsx` | Modificar (paginacao + botao excel completo) |
| `src/lib/generateAuditExcel.ts` | Modificar (nova funcao generateFullAuditExcel) |

Nenhuma alteracao no banco de dados.

