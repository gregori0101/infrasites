

## Melhorias Profissionais na Auditoria de OS

Conjunto de funcionalidades que elevam o modulo a um nivel profissional de gestao, sem alterar o banco de dados.

---

### 1. Mini Dashboard no topo da visao do Gestor

**Arquivo: `src/components/auditoria/AuditoriaGestorView.tsx`**

Adicionar uma faixa de 4 mini cards no topo da listagem com:
- Total de OS (no periodo)
- Pendentes
- Vencidas (deadline passado e status != concluido) com destaque vermelho
- Taxa de aprovacao (%) com barra de progresso

Calculados a partir dos dados ja carregados (orders + auditResults). Permite ao gestor ter visao rapida sem precisar abrir o dashboard separado.

---

### 2. Filtro por Resultado (Aprovado / Reprovado)

**Arquivo: `src/components/auditoria/AuditoriaGestorView.tsx`**

Adicionar um novo MultiSelectFilter para "Resultado" com opcoes: Aprovado, Reprovado, Sem resultado. Integrado ao filteredOrders existente, filtrando pela mesma logica de auditResults ja calculada.

---

### 3. Ordenacao da lista de OS

**Arquivo: `src/components/auditoria/AuditoriaGestorView.tsx`**

Adicionar seletor de ordenacao ao lado dos filtros com opcoes:
- Mais recente (padrao)
- Mais antiga
- Prazo mais proximo
- Site (A-Z)

Implementado via useMemo que ordena o filteredOrders conforme a opcao selecionada.

---

### 4. Selecao em lote e exclusao em massa

**Arquivo: `src/components/auditoria/AuditoriaGestorView.tsx`**

- Checkbox em cada card de OS para selecao multipla
- Barra de acoes flutuante quando ha itens selecionados: "X selecionados | Excluir selecionados"
- Dialog de confirmacao antes de excluir em massa
- Botao "Selecionar todos" / "Limpar selecao"

---

### 5. Duplicar OS

**Arquivo: `src/lib/auditoriaDatabase.ts`** - nova funcao `duplicateAuditOrder`
**Arquivo: `src/components/auditoria/AuditoriaGestorView.tsx`** - botao de duplicar no card

Funcionalidade: copia todos os dados da OS (exceto id, status e datas) e todos os itens, criando uma nova OS com status "pendente". Util para criar auditorias recorrentes no mesmo site.

Novo botao com icone `Copy` ao lado dos botoes existentes em cada card.

---

### 6. Exportar lista de OS para Excel

**Arquivo: `src/lib/generateAuditExcel.ts`** (novo arquivo)
**Arquivo: `src/components/auditoria/AuditoriaGestorView.tsx`** - botao no header

Gera planilha Excel (xlsx) com todas as OS filtradas, incluindo:
- Numero OS, Site, Motivo, Tecnico, Status, Resultado, Prazo, Criacao, Conclusao

Botao "Exportar" no header do painel, ao lado do botao "Nova OS". Usa a biblioteca xlsx ja instalada.

---

### 7. Melhorias na visao do Tecnico

**Arquivo: `src/components/auditoria/AuditoriaTechnicianView.tsx`**

- Indicador de prazo com cor: verde (> 7 dias), amarelo (< 7 dias), vermelho (vencida)
- Barra de progresso mostrando itens auditados vs total (requer fetch dos items count)
- Separar OS por status: "Pendentes" e "Concluidas" em secoes colapsaveis
- Contador de OS no header ("3 pendentes, 2 concluidas")

---

### 8. Barra de progresso na Execucao

**Arquivo: `src/components/auditoria/AuditoriaExecucao.tsx`**

- Adicionar barra de progresso visual no topo mostrando (auditados / total)
- Indicador de prazo restante (ex: "3 dias restantes" ou "Vencida!")
- Auto-scroll para o proximo item pendente apos salvar
- Botao "Expandir/Recolher todos"

---

### Resumo tecnico

| Arquivo | Tipo |
|---|---|
| `src/components/auditoria/AuditoriaGestorView.tsx` | Modificar |
| `src/components/auditoria/AuditoriaTechnicianView.tsx` | Modificar |
| `src/components/auditoria/AuditoriaExecucao.tsx` | Modificar |
| `src/lib/auditoriaDatabase.ts` | Modificar (add duplicateAuditOrder) |
| `src/lib/generateAuditExcel.ts` | Criar |

Nenhuma alteracao no banco de dados. Tudo calculado client-side.

