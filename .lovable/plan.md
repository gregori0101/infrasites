
# Revisao Completa do Drill-Down e Detalhes do Site

## Objetivo
Corrigir e completar todas as informacoes do formulario no modal de detalhes do site (`SiteDetailModal`), e adicionar botao de edicao do relatorio completo (alem da edicao do cadastro de site que ja existe).

## Problemas Identificados

### 1. Campos de Energia com nomes errados no SiteDetailModal
O modal usa campos inexistentes como `report.energia_tipo`, `report.energia_potencia`, `report.energia_tensao`, `report.energia_tipo_disjuntor`, `report.energia_corrente_disjuntor`. Os campos corretos no banco sao:
- `energia_tipo_quadro` (QDCA/QGBT/SUBQUADRO)
- `energia_fabricante` + `energia_fabricante_outra`
- `energia_potencia_kva`
- `energia_tensao_entrada` (127V/220V/380V/440V)
- `energia_disjuntor_entrada`
- `energia_disjuntor_qdca`

### 2. Campos de Energia ausentes
- `energia_unidade_consumidora` (numero da UC)
- `energia_potencia_transformador`
- `energia_transformador_ok`
- `energia_protegido_gradil`
- `energia_protegido_cadeado`
- `energia_foto_relogio` (foto do medidor)

### 3. Campos de GMG ausentes
- `gmg_status` (OK/NOK)
- `gmg_alarme_ativo`
- `gmg_foto_alarme`

### 4. Campos de Torre/Infraestrutura ausentes
- `torre_ninhos` (presenca de ninhos)
- `torre_foto_ninhos`
- `torre_foto_fibras_protegidas`
- `torre_foto_aterramento`
- `torre_foto_zeladoria`

### 5. Campos de Gabinete ausentes
- `gab{g}_ativo` (ativo/desativado)
- `gab{g}_bat{b}_colada` (bateria colada)
- `gab{g}_bat{b}_com_gradil` (com gradil)
- `gab{g}_fcc_qtd_ur_instaladas` (URs instaladas)
- Fotos extras (`fotos_extras` JSONB)

### 6. Campos Gerais ausentes
- `operadora` (VIVO/TEL)
- `geo_latitude`, `geo_longitude`, `geo_endereco` (geolocalizacao)

### 7. Botao de Edicao do Relatorio
Atualmente, so existe edicao do cadastro do site (tabela `sites`). Falta um botao para editar o relatorio completo (dados da vistoria), que deve usar o fluxo existente `loadReportForEditing` para carregar os dados no wizard do checklist.

---

## Mudancas Planejadas

### Arquivo 1: `src/components/dashboard/SiteDetailModal.tsx`

**Tab Geral:**
- Adicionar campo `Operadora` (VIVO/TEL)
- Adicionar bloco de Geolocalizacao (latitude, longitude, endereco)
- Adicionar botao "Editar Relatorio" no header (visivel para admin/gestor/tecnico dono)

**Tabs Gabinetes (Gab 1-7):**
- Adicionar campo "Ativo" (status do gabinete)
- Na secao de Baterias: adicionar campos "Colada" e "Com Gradil" por banco
- Na secao FCC: adicionar campo "URs Instaladas" (alem do existente "Qtd UR" que sao as suportadas)

**Tab Energia:**
- Corrigir todos os nomes de campos para os corretos do banco
- Adicionar: Tipo Quadro, Fabricante, Potencia kVA, Tensao Entrada, Disjuntor Entrada, Disjuntor QDCA
- Adicionar: Unidade Consumidora, Potencia Transformador, Transformador OK
- Adicionar: Protegido Gradil, Protegido Cadeado
- Adicionar: Foto Relogio (medidor)

**Tab GMG/Torre:**
- GMG: Adicionar Status (OK/NOK), Alarme Ativo, Foto do Alarme
- Torre: Adicionar Ninhos (SIM/NAO), Foto Ninhos, Foto Fibras Protegidas, Foto Aterramento, Foto Zeladoria

### Arquivo 2: `src/components/dashboard/DrillDownModal.tsx`

- Adicionar botao "Editar Relatorio" nas linhas de gabinetes (alem do botao existente "Editar Site")
- O botao usara `loadReportForEditing` via `ChecklistContext` para abrir o wizard com os dados do relatorio carregados
- Necessario importar `useChecklist`, `useNavigate`, `fetchFullReportById` e `reportToChecklist`

---

## Secao Tecnica

### Dependencias de imports adicionais no SiteDetailModal:
- `useAuth` de `@/contexts/AuthContext`
- `useChecklist` de `@/contexts/ChecklistContext`
- `useNavigate` de `react-router-dom`
- `Pencil` de `lucide-react`

### Dependencias de imports adicionais no DrillDownModal:
- `useChecklist` de `@/contexts/ChecklistContext`
- `useNavigate` de `react-router-dom`
- `fetchFullReportById` e `reportToChecklist`
- `FileEdit` de `lucide-react`

### Logica do botao "Editar Relatorio":
```text
1. Buscar relatorio completo via fetchFullReportById(reportId)
2. Converter para ChecklistData via reportToChecklist(report)
3. Chamar loadReportForEditing(checklistData, reportId)
4. Navegar para '/' (pagina do wizard)
5. Fechar o modal
```

### Permissoes de edicao do relatorio:
- Admin: pode editar qualquer relatorio
- Gestor: pode editar relatorios da sua operadora
- Tecnico: pode editar apenas seus proprios relatorios
- Seguir a mesma logica ja implementada em `ReportsHistory.tsx`

### Arquivos modificados:
1. `src/components/dashboard/SiteDetailModal.tsx` - Completar campos e adicionar botao de edicao
2. `src/components/dashboard/DrillDownModal.tsx` - Adicionar botao de edicao de relatorio
