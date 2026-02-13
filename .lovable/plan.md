
# Detalhes Completos dos Gabinetes no Drill-Down

## Objetivo
Enriquecer a tabela de detalhes dos gabinetes no modal de drill-down com todas as informacoes disponiveis no formulario de vistoria.

## Mudancas

### 1. Expandir a interface `GabineteInfo` em `types.ts`
Adicionar os campos que faltam:
- `tecnologiasAcesso`: string (2G, 3G, 4G, 5G)
- `tecnologiasTransporte`: string (DWDM, GPON, etc.)
- `fccFabricante`: string
- `fccTensao`: string (24V/48V)
- `fccGerenciado`: string
- `fccGerenciavel`: string
- `fccConsumo`: string
- `fccQtdUr`: string (URs suportadas)
- `fccQtdUrInstaladas`: string (URs instaladas)
- `climatizacaoTipo`: string
- `ventiladoresStatus`: string
- `plcStatus`: string
- `alarmeStatus`: string
- `bancosInterligados`: string

### 2. Preencher os novos campos em `useDashboardStats.ts`
Na secao onde o `GabineteInfo` eh criado (por volta da linha 692), ler os campos adicionais do report usando o prefixo `gab{g}_`:
- `${prefix}_tecnologias_acesso`
- `${prefix}_tecnologias_transporte`
- `${prefix}_fcc_fabricante`
- `${prefix}_fcc_tensao`
- `${prefix}_fcc_gerenciado`
- `${prefix}_fcc_gerenciavel`
- `${prefix}_fcc_consumo`
- `${prefix}_fcc_qtd_ur`
- `${prefix}_fcc_qtd_ur_instaladas`
- `${prefix}_climatizacao_tipo`
- `${prefix}_ventiladores_status`
- `${prefix}_plc_status`
- `${prefix}_alarme_status`
- `${prefix}_bancos_interligados`

### 3. Atualizar a tabela de gabinetes no `DrillDownModal.tsx`
Adicionar colunas na tabela (linhas 454-505):
- **Tipo** (tipo do gabinete)
- **Protecao** (SIM/NAO)
- **Ativo** (Ativo/Desativado)
- **Tecnologias Acesso** (ex: 2G, 4G, 5G)
- **Tecnologias Transporte** (ex: DWDM, GPON)
- **FCC** (fabricante + tensao)
- **URs** (instaladas/suportadas)
- **Climatizacao** (tipo + status ventiladores)
- **PLC** (status)
- Manter as colunas existentes: Autonomia, Horas, Obsolescencia, GMG, Baterias

A tabela ficara mais larga, mas ja possui scroll horizontal habilitado.

### 4. Atualizar o export Excel em `generateDrillDownExcel.ts`
Adicionar as novas colunas na funcao `generateGabinetesExcel` para que o Excel exportado tambem contenha todos os dados.

### Secao Tecnica

**Arquivos modificados:**
1. `src/components/dashboard/types.ts` - Expandir GabineteInfo
2. `src/components/dashboard/useDashboardStats.ts` - Popular novos campos
3. `src/components/dashboard/DrillDownModal.tsx` - Adicionar colunas na tabela
4. `src/lib/generateDrillDownExcel.ts` - Atualizar export com novas colunas
