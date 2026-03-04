

## Aumentar limite de baterias por gabinete de 6 para 12

O limite atual de 6 bancos de bateria por gabinete e imposto tanto pelo banco de dados (colunas fixas) quanto pelo codigo front-end. Para permitir mais de 7 bancos, proponho aumentar para **12 bancos por gabinete**.

---

### 1. Migracao de banco de dados

Para cada gabinete (1-7), adicionar colunas para bancos 7-12:
- `gabX_bat7_tipo`, `gabX_bat7_fabricante`, `gabX_bat7_capacidade`, `gabX_bat7_data_fabricacao`, `gabX_bat7_estado`, `gabX_bat7_colada`, `gabX_bat7_com_gradil`
- Repetido para bat8, bat9, bat10, bat11, bat12
- Total: 7 gabinetes x 6 novos bancos x 7 colunas = **294 novas colunas** (todas text, nullable)

### 2. Front-end - Formulario

**`src/components/steps/Step4Baterias.tsx`**
- Alterar limite de 6 para 12 em `addBanco`, `disabled`, e contador visual

### 3. Persistencia

**`src/lib/reportDatabase.ts`**
- Loop `for (let j = 0; j < 6` → `j < 12`
- Adicionar colunas bat7-bat12 ao `buildDashboardColumns()`

**`src/lib/reportToChecklist.ts`**
- Loop `for (let j = 0; j < 6` → `j < 12`

**`src/lib/generateExcel.ts`**
- Loop `for (let j = 0; j < 6` → `j < 12`

### 4. Dashboard

**`src/components/dashboard/useDashboardStats.ts`**
- Ambos os loops `b <= 6` → `b <= 12`

**`src/components/dashboard/SiteDetailModal.tsx`**
- Loop `b <= 6` → `b <= 12`
- `Array.from({ length: 6 }` → `{ length: 12 }`

**`src/components/dashboard/BatteryDetailModal.tsx`**
- Verificar e ajustar loops se existirem

### Resumo

| Arquivo | Acao |
|---|---|
| Migracao SQL | 294 colunas novas (bat7-bat12 x 7 gabs) |
| `Step4Baterias.tsx` | Limite 6→12 |
| `reportDatabase.ts` | Loop 6→12 + colunas dashboard |
| `reportToChecklist.ts` | Loop 6→12 |
| `generateExcel.ts` | Loop 6→12 |
| `useDashboardStats.ts` | Loops 6→12 |
| `SiteDetailModal.tsx` | Loops 6→12 |
| `BatteryDetailModal.tsx` | Verificar/ajustar |

