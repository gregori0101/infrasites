
# Plano: Modal de Detalhes de Bateria com Foto

## Resumo
Implementar um modal popup que exibe todas as informacoes de uma bateria individual quando o usuario clicar em uma linha da tabela de baterias no DrillDownModal do painel de Baterias.

---

## Analise Tecnica

### Estrutura de Dados Atual
O sistema armazena informacoes de baterias no banco de dados com a seguinte estrutura:
- Cada gabinete pode ter ate 6 bancos de bateria
- Campos por bateria: tipo, fabricante, capacidade, data_fabricacao, estado, colada, com_gradil
- Foto: existe apenas uma foto por gabinete (`gab{n}_bat_foto`), nao por bateria individual

### Interface BatteryInfo Atual
```text
BatteryInfo {
  siteCode, uf, gabinete, banco, fabricante, tipo, tipoClassificado,
  capacidade, dataFabricacao, estado, idade, obsolescencia,
  obsolescenciaTipo, autonomyRisk, needsReplacement
}
```

### Fluxo Atual
1. BateriaPanel exibe cards com metricas de baterias
2. Ao clicar em um card, abre DrillDownModal com lista de baterias
3. Lista exibe informacoes basicas em uma tabela
4. Nao ha acao ao clicar em uma bateria individual

---

## Solucao Proposta

### 1. Criar Novo Componente BatteryDetailModal
Criar modal dedicado em `src/components/dashboard/BatteryDetailModal.tsx`

**Recursos do modal:**
- Header com codigo do site e identificacao do gabinete/banco
- Secoes organizadas para exibir todas as informacoes
- Foto do banco de baterias (quando disponivel)
- Badges coloridos para status (estado, obsolescencia, autonomia)
- Botao para fechar

**Layout proposto:**
```text
+------------------------------------------+
| [X] Bateria - SITE123 - G1 Banco 1       |
+------------------------------------------+
| [FOTO DO BANCO DE BATERIAS]              |
|                                          |
| IDENTIFICACAO                            |
| Site: SITE123    UF: PA                  |
| Gabinete: G1     Banco: 1                |
|                                          |
| ESPECIFICACOES TECNICAS                  |
| Tipo: Litio     Fabricante: HUAWEI       |
| Capacidade: 200Ah                        |
| Data Fabricacao: 01/2024                 |
| Idade: 2 anos                            |
|                                          |
| STATUS                                   |
| Estado: [OK]                             |
| Colada: [NAO]   Gradil: [SIM]            |
| Obsolescencia: [Medio Risco]             |
| Autonomia: [OK]                          |
| Requer Troca: [Nao]                      |
+------------------------------------------+
```

### 2. Atualizar Interface BatteryInfo
Adicionar campos para suportar informacoes adicionais:

```text
+ colada: string
+ comGradil: string
+ fotoUrl: string | null (foto do gabinete)
+ reportId: string (para buscar foto se necessario)
```

### 3. Atualizar useDashboardStats
Modificar a funcao para extrair e incluir os novos campos:
- colada, com_gradil para cada bateria
- Armazenar referencia ao report.id para buscar foto posteriormente

### 4. Atualizar DrillDownModal
Adicionar:
- Estado para controlar abertura do BatteryDetailModal
- Estado para armazenar bateria selecionada
- Handler de clique nas linhas da tabela de baterias
- Estilo de cursor pointer nas linhas

### 5. Buscar Foto da Bateria
Como a foto e por gabinete (nao por bateria individual):
- Opcao A: Incluir fotoUrl diretamente no BatteryInfo durante processamento (requer fetch adicional)
- Opcao B: Buscar foto sob demanda quando modal abrir (melhor performance)

**Recomendacao:** Opcao B - buscar sob demanda usando reportId e gabinete

---

## Arquivos a Modificar/Criar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/components/dashboard/types.ts` | Modificar | Adicionar campos colada, comGradil, reportId ao BatteryInfo |
| `src/components/dashboard/useDashboardStats.ts` | Modificar | Extrair campos adicionais e incluir reportId |
| `src/components/dashboard/BatteryDetailModal.tsx` | Criar | Novo componente de modal de detalhes |
| `src/components/dashboard/DrillDownModal.tsx` | Modificar | Adicionar estado e handler para abrir modal de detalhes |
| `src/lib/reportDatabase.ts` | Modificar | Adicionar funcao para buscar foto da bateria por reportId e gabinete |

---

## Detalhes de Implementacao

### BatteryDetailModal
```text
Props:
- open: boolean
- onClose: () => void
- battery: BatteryInfo | null

Funcionalidades:
- Fetch da foto ao abrir (usando reportId e gabinete)
- Loading state para foto
- Fallback se foto nao disponivel
- Lightbox ao clicar na foto
```

### Busca de Foto
Criar funcao `fetchBatteryPhoto(reportId, gabinete)`:
- Busca campo `gab{n}_bat_foto` do report
- Retorna URL da foto ou null

### Integracao no DrillDownModal
```text
+ const [batteryDetailOpen, setBatteryDetailOpen] = useState(false)
+ const [selectedBattery, setSelectedBattery] = useState<BatteryInfo | null>(null)

Na TableRow de baterias:
+ onClick={() => { setSelectedBattery(b); setBatteryDetailOpen(true); }}
+ className="cursor-pointer hover:bg-muted/50"
```

---

## Estimativa de Esforco
- Criar BatteryDetailModal: componente principal
- Atualizar types.ts: 3 campos novos
- Atualizar useDashboardStats: extrair campos adicionais
- Atualizar DrillDownModal: estado e handler
- Funcao de busca de foto: 1 funcao nova
- Testes e ajustes de UI

---

## Resultado Esperado
Usuario clica em qualquer linha de bateria na tabela do DrillDownModal e visualiza um popup elegante com:
- Todas as informacoes da bateria
- Foto do banco de baterias (se disponivel)
- Status visuais com badges coloridos
- Possibilidade de ampliar a foto via lightbox
