

## Melhorias no Dashboard de Auditoria de OS

Objetivo: tornar o painel mais completo e informativo, mantendo o visual limpo e simples que ja existe.

### Novos indicadores e seções

**1. Taxa de Conclusao e Aprovacao (KPI cards extras)**
- Adicionar card "Taxa Conclusao" mostrando percentual (concluidos/total) com barra de progresso visual
- Adicionar card "Taxa Aprovacao" mostrando percentual (aprovados/concluidos) 
- Usar as props `subtitle` e `trend` do StatCard existente para enriquecer os cards atuais

**2. Filtro de periodo**
- Adicionar seletor simples de periodo no header: "Todos", "Ultimos 7 dias", "Ultimos 30 dias", "Ultimos 90 dias"
- Filtrar todos os dados/graficos conforme o periodo selecionado
- Chips simples usando botoes com variant outline/default

**3. Card de Motivos mais frequentes**
- Novo card com mini lista dos top 5 motivos de auditoria
- Barra horizontal simples mostrando a proporcao de cada motivo
- Extraido do campo `motivo` das ordens

**4. Card de OS Vencidas / Proximas do Prazo**
- Contar ordens com `deadline` passado e status != concluido (vencidas)
- Contar ordens com deadline nos proximos 7 dias (proximas do prazo)
- Exibir como StatCard com destaque visual (badge destructive/warning)

**5. Timeline de atividade recente**
- Pequena lista das ultimas 5 OS concluidas, mostrando site_code, data de conclusao e resultado (aprovado/reprovado)
- Card simples com lista vertical

**6. Melhoria no grafico de tecnicos**
- Incluir taxa de aprovacao por tecnico (aprovados/concluidos) no tooltip
- Adicionar coluna de aprovados no grafico stacked

### Mudancas tecnicas

**Arquivo: `src/pages/AuditoriaOSDashboard.tsx`**

- Adicionar estado `periodFilter` com opcoes de periodo
- Criar `filteredOrders` via useMemo que filtra por periodo
- Substituir `orders` por `filteredOrders` em todos os calculos de KPI e graficos
- Adicionar novos useMemo para:
  - `taxaConclusao` e `taxaAprovacao` (percentuais)
  - `motivoData` (top 5 motivos com contagem)
  - `deadlineStats` (vencidas e proximas do prazo)
  - `recentActivity` (ultimas 5 concluidas)
- Reorganizar layout dos KPI cards para incluir os novos (grid 2x4 em desktop)
- Adicionar nova row de cards: Motivos + Atividade Recente (grid 2 colunas)
- Enriquecer techData com dados de aprovacao

Nenhuma mudanca no banco de dados. Tudo calculado client-side a partir dos dados ja carregados.
