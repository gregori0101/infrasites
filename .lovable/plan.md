
# Correcao de Conteudo das Colunas no Excel

## Problema Raiz

A funcao `reportToChecklist()` usa **valores padrao falsos** quando um campo do banco de dados e `null`. Isso causa colunas preenchidas com dados incorretos no Excel. Por exemplo:
- Gabinete tipo sempre mostra "CONTAINER" quando o valor e null
- FCC fabricante sempre mostra "HUAWEI" quando o valor e null
- FCC tensao sempre mostra "48V" quando o valor e null  
- Alarmistica sempre mostra "SGINFRA U2020" quando o valor e null

Alem disso, a coluna `operadora` **nao e buscada** na funcao `fetchReportsForExcel`, fazendo com que todos os relatorios mostrem "VIVO" independente do valor real.

## Correcoes Necessarias

### 1. Arquivo: `src/lib/reportDatabase.ts`

**Adicionar `operadora` ao `buildDashboardColumns`** para que seja buscado em todas as queries:
- Adicionar `'operadora'` na lista de colunas base

**Adicionar fotos de energia faltantes ao `buildPhotoColumns`:**
- `energia_foto_placa`
- `energia_foto_cabos`

### 2. Arquivo: `src/lib/reportToChecklist.ts`

**Remover defaults falsos** que mascaram dados nulos. Substituir por valores vazios/null:

| Campo | Antes (default incorreto) | Depois (correto) |
|---|---|---|
| `gab.tipo` | `report[...] \|\| 'CONTAINER'` | `report[...] \|\| ''` |
| `fcc.fabricante` | `report[...] \|\| 'HUAWEI'` | `report[...] \|\| ''` |
| `fcc.tensaoDC` | `report[...] \|\| '48V'` | `report[...] \|\| ''` |
| `fcc.alarmistica` | `report[...] \|\| 'SGINFRA U2020'` | `report[...] \|\| ''` |

### 3. Arquivo: `src/lib/generateExcel.ts`

**Adicionar colunas de fotos de energia faltantes:**
- `Energia_Foto_Placa`
- `Energia_Foto_Cabos`

### Resumo de Arquivos Editados

1. `src/lib/reportDatabase.ts` - Adicionar `operadora` nas colunas do dashboard e fotos de energia no `buildPhotoColumns`
2. `src/lib/reportToChecklist.ts` - Remover defaults falsos (CONTAINER, HUAWEI, 48V, SGINFRA U2020)
3. `src/lib/generateExcel.ts` - Adicionar colunas `Energia_Foto_Placa` e `Energia_Foto_Cabos`
