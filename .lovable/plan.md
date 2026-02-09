

# Revisao Completa da Planilha Excel de Relatorios

## Problema Identificado

Ao comparar a funcao `generateExcel.ts` (que gera a planilha Excel dos relatorios) com as colunas do banco de dados, foram encontrados **diversos campos armazenados no banco que NAO estao sendo exportados na planilha**. Isso significa que dados preenchidos pelos tecnicos sao salvos mas nao aparecem quando a planilha e gerada.

## Campos Faltantes na Planilha

### 1. Gabinetes - Campos Ausentes (por gabinete, 1-7)
| Campo no banco | Descricao | Registros com dados |
|---|---|---|
| `gab*_ativo` | Se o gabinete esta ativo ou nao | 106 registros |
| `gab*_foto_panoramica` | Foto panoramica do gabinete | 326 registros |

### 2. Torre - Campos Ausentes
| Campo no banco | Descricao | Registros com dados |
|---|---|---|
| `torre_ninhos` | Presenca de ninhos na torre | 338 registros |
| `torre_foto_ninhos` | Foto dos ninhos | 4 registros |

### 3. Fibra Optica - Fotos Ausentes
| Campo no banco | Descricao | Registros com dados |
|---|---|---|
| `fibra_abord*_foto` (1-4) | Fotos das abordagens de fibra | 268 registros |
| `fibra_foto_caixas_passagem` | Fotos das caixas de passagem | 185 registros |
| `fibra_foto_caixas_subterraneas` | Fotos das caixas subterraneas | 76 registros |
| `fibra_foto_subidas_laterais` | Fotos das subidas laterais | 170 registros |
| `fibra_dgo*_foto` (1-4) | Fotos dos DGOs | 245 registros |
| `fibra_dgo*_cordoes_foto` (1-4) | Fotos detalhadas dos cordoes | 74 registros |

### 4. Energia - Fotos Ausentes
| Campo no banco | Descricao | Registros com dados |
|---|---|---|
| `energia_foto_placa` | Foto da placa de energia | 21 registros |
| `energia_foto_cabos` | Foto dos cabos de energia | 12 registros |

### 5. Outros Campos Ausentes
| Campo no banco | Descricao | Registros com dados |
|---|---|---|
| `assinatura_digital` | Assinatura do tecnico | 4 registros |
| `email_sent` / `email_sent_at` | Status do envio de e-mail | Informacao administrativa |
| `operadora` | Operadora (VIVO/TEL) | Ja exportado parcialmente |

## Plano de Implementacao

### Arquivo: `src/lib/generateExcel.ts`

Adicionar os seguintes campos na funcao `buildRowFromChecklist`:

**Passo 1 - Gabinetes (dentro do loop for de gabinetes):**
- Adicionar `Gab*_Ativo` com valor SIM/NAO
- Adicionar `Gab*_Foto_Panoramica_Gabinete` com link da foto

**Passo 2 - Torre (dentro do bloco GMG/Torre):**
- Adicionar `Torre_Ninhos` com valor SIM/NAO
- Adicionar `Torre_Foto_Ninhos` com link da foto

**Passo 3 - Fibra Optica (dentro do bloco de fibra):**
- Adicionar fotos de cada abordagem: `Fibra_Abord*_Foto`
- Adicionar fotos de caixas de passagem: `Fibra_Fotos_Caixas_Passagem`
- Adicionar fotos de caixas subterraneas: `Fibra_Fotos_Caixas_Subterraneas`
- Adicionar fotos de subidas laterais: `Fibra_Fotos_Subidas_Laterais`
- Adicionar foto e foto detalhada de cada DGO: `Fibra_DGO*_Foto` e `Fibra_DGO*_Cordoes_Foto`

**Passo 4 - Energia:**
- Adicionar `Energia_Foto_Placa` e `Energia_Foto_Cabos` (campos existentes no banco, usados em alguns relatorios)

**Passo 5 - Outros:**
- Confirmar que `Assinatura_Digital` ja esta sendo exportada (sim, esta na linha 254)
- Confirmar que `Operadora` ja esta sendo exportada (sim, esta na linha 32)

### Detalhes Tecnicos

As alteracoes serao feitas exclusivamente no arquivo `src/lib/generateExcel.ts`, na funcao `buildRowFromChecklist`. Nenhuma tabela do banco precisa ser modificada. Os campos ja existem no banco e no tipo `ChecklistData` -- apenas falta inclui-los na geracao da planilha.

Campos de fotos usarao a funcao `getPhotoValue()` ja existente para retornar links ou marcacao `[FOTO INCORPORADA]`. Campos de fotos armazenados como JSON arrays (como `fotosCaixasPassagem`) usarao a funcao `getPhotosValue()` ja existente.

