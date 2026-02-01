
# Plano: Pré-preenchimento do Formulário com Dados Anteriores

## Objetivo
Permitir que, ao iniciar uma vistoria para um site que já foi inspecionado anteriormente, o usuário possa ter o formulário pré-preenchido com as informações da última vistoria. O usuário poderá modificar e acrescentar informações conforme necessário.

## Como Vai Funcionar

### Para o Usuário
1. Ao selecionar um site para vistoria (seja pela caixa de entrada ou manualmente digitando a sigla)
2. O sistema verifica se existe uma vistoria anterior para aquele site
3. Se existir, aparece uma opção perguntando: "Este site foi vistoriado anteriormente. Deseja carregar os dados da última vistoria?"
4. O usuário pode escolher:
   - **Sim**: Carrega todos os dados anteriores (exceto fotos e assinatura) no formulário
   - **Não**: Inicia um formulário em branco

### Comportamento do Pré-preenchimento
- Carrega: tipo de gabinete, tecnologias, dados FCC, configuração de baterias, climatização, dados de energia, etc.
- **NÃO carrega**: fotos (precisam ser tiradas novamente), assinatura, data/hora, nome do técnico
- O usuário pode modificar qualquer campo normalmente
- É uma nova vistoria - será salva como um novo relatório

---

## Detalhes Tecnicos

### 1. Nova Funcao para Buscar Ultimo Relatorio do Site
**Arquivo**: `src/lib/reportDatabase.ts`

Criar funcao `fetchLatestReportBySiteCode(siteCode: string)`:
- Busca o relatorio mais recente para um dado site_code
- Retorna os dados do relatorio ou null se nao existir
- Filtra por operadora do usuario para garantir que TEL so veja dados de TEL

### 2. Funcao para Converter Relatorio em ChecklistData sem Fotos
**Arquivo**: `src/lib/reportToChecklist.ts`

Modificar ou criar funcao `reportToChecklistWithoutPhotos()`:
- Utiliza a funcao existente `reportToChecklist()`
- Remove todas as fotos e assinatura
- Gera novo ID para o checklist
- Atualiza timestamps

### 3. Hook para Verificar Dados Anteriores
**Arquivo**: `src/hooks/use-previous-report.ts` (novo)

Criar hook `usePreviousReport(siteCode: string)`:
- Busca ultimo relatorio quando siteCode tem 5 caracteres
- Retorna estado de loading, dados anteriores se existirem
- Memoiza resultado para evitar buscas desnecessarias

### 4. Dialogo de Confirmacao
**Arquivo**: `src/components/ui/prefill-dialog.tsx` (novo)

Criar componente de dialogo:
- Mostra quando existe relatorio anterior
- Exibe data da ultima vistoria
- Botoes "Usar dados anteriores" e "Iniciar novo"

### 5. Integracao no Fluxo de Entrada
**Arquivo**: `src/components/steps/Step1DadosSite.tsx`

Modificar para:
- Usar o hook `usePreviousReport`
- Mostrar indicador visual quando dados anteriores existem
- Mostrar dialogo quando usuario seleciona site com historico

### 6. Integracao na Caixa de Entrada do Tecnico
**Arquivo**: `src/components/technician/TechnicianInbox.tsx`

Modificar `handleStartChecklist`:
- Antes de iniciar, verificar se existe relatorio anterior
- Mostrar opcao de pre-preencher

### 7. Funcao no Contexto para Carregar Dados
**Arquivo**: `src/contexts/ChecklistContext.tsx`

Adicionar funcao `loadFromPreviousReport(checklistData: ChecklistData)`:
- Carrega dados de relatorio anterior no estado
- Mantem ID novo e timestamps atualizados
- Limpa fotos e assinatura

---

## Arquivos a Serem Modificados/Criados

| Arquivo | Acao |
|---------|------|
| `src/lib/reportDatabase.ts` | Adicionar funcao de busca |
| `src/lib/reportToChecklist.ts` | Adicionar versao sem fotos |
| `src/hooks/use-previous-report.ts` | Criar novo hook |
| `src/components/ui/prefill-dialog.tsx` | Criar dialogo |
| `src/components/steps/Step1DadosSite.tsx` | Integrar verificacao |
| `src/components/technician/TechnicianInbox.tsx` | Integrar opcao |
| `src/contexts/ChecklistContext.tsx` | Adicionar funcao de carga |
| `src/pages/Index.tsx` | Coordenar fluxo |

---

## Fluxo de Dados

```text
Usuario digita sigla do site (5 caracteres)
           |
           v
Hook busca ultimo relatorio no banco
           |
           v
     Existe relatorio?
      /          \
    SIM          NAO
     |            |
     v            v
Mostra dialogo   Continua normal
     |
     v
Usuario escolhe
     |
  /     \
Sim      Nao
 |        |
 v        v
Carrega   Continua
dados     em branco
```

---

## Consideracoes de Seguranca

- A busca respeita RLS (usuarios TEL so veem dados TEL)
- Validacao de operadora no backend
- Fotos nao sao copiadas (devem ser tiradas novamente)
- Assinatura nao e copiada (nova assinatura necessaria)

## Experiencia do Usuario

- Indicador visual sutil mostrando que o site tem historico
- Dialogo nao intrusivo com opcao clara
- Pre-preenchimento instantaneo sem delays perceptiveis
- Campos pre-preenchidos podem ser editados normalmente
