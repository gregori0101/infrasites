

# Plano: Permitir que Administradores Editem Relatorios

## Resumo

Adicionar a funcionalidade de edicao de relatorios para administradores. Quando um administrador visualizar os detalhes de um relatorio no Historico, tera um botao "Editar" que carregara os dados do relatorio no formulario de checklist (wizard) para edicao. Ao finalizar, o relatorio sera atualizado no banco de dados em vez de criar um novo registro.

## Abordagem

A estrategia sera reutilizar o wizard de checklist ja existente, carregando os dados do relatorio selecionado para edicao. O sistema distinguira entre "novo relatorio" e "edicao de relatorio existente" atraves de um flag no contexto.

---

## Etapas de Implementacao

### 1. Criar funcao de atualizacao no banco de dados

Adicionar uma funcao `updateReportInDatabase` em `src/lib/reportDatabase.ts` que:
- Recebe o ID do relatorio e os dados atualizados (ChecklistData)
- Converte os dados usando `buildReportRow()` (ja existente)
- Executa um UPDATE no banco em vez de INSERT
- A politica RLS ja permite que administradores e gestores facam UPDATE nos relatorios

### 2. Adicionar modo de edicao ao ChecklistContext

Atualizar `src/contexts/ChecklistContext.tsx` para:
- Adicionar estado `editingReportId: string | null` - indica que estamos editando um relatorio existente
- Adicionar funcao `loadReportForEditing(checklistData: ChecklistData, reportId: string)` - carrega dados para edicao mantendo o ID original
- Adicionar funcao `clearEditingMode()` - limpa o modo de edicao
- Expor esses valores no contexto

### 3. Adicionar botao "Editar" no modal de detalhes do relatorio

Atualizar `src/pages/ReportsHistory.tsx` para:
- Adicionar botao "Editar" visivel apenas para administradores (ao lado do botao "Excluir")
- Ao clicar, converter o relatorio para ChecklistData usando `reportToChecklist` (ja existente)
- Carregar os dados no contexto em modo de edicao
- Redirecionar para a pagina principal (`/`) com o wizard aberto

### 4. Adaptar o Step10 (Finalizacao) para modo de edicao

Atualizar `src/components/steps/Step10Finalizacao.tsx` para:
- Verificar se esta em modo de edicao (`editingReportId`)
- Se estiver editando: chamar `updateReportInDatabase` em vez de `saveReportToDatabase`
- Alterar o texto do botao de "Enviar Relatorio" para "Salvar Alteracoes"
- Mostrar indicacao visual de que esta editando um relatorio existente

### 5. Adicionar indicacao visual no wizard

Atualizar `src/components/ChecklistWizard.tsx` para:
- Mostrar um banner/badge quando estiver em modo de edicao (ex: "Editando relatorio do site XXXXX")
- Impedir que o botao "Novo Checklist" limpe uma edicao sem confirmacao

---

## Detalhes Tecnicos

### Funcao updateReportInDatabase (reportDatabase.ts)

```text
export async function updateReportInDatabase(
  reportId: string,
  data: ChecklistData
): Promise<{ success: boolean; error?: string }>
```

- Usa `buildReportRow(data)` para converter os dados
- Executa `supabase.from('reports').update(row).eq('id', reportId)`
- A RLS ja permite UPDATE para admins/gestores (politica existente)

### Novo estado no ChecklistContext

```text
editingReportId: string | null   // null = novo, string = editando
loadReportForEditing(data, id)   // carrega dados + seta editingReportId
clearEditingMode()               // limpa editingReportId
```

### Fluxo do Usuario

```text
1. Admin abre Historico de Relatorios
2. Clica em um relatorio para ver detalhes
3. Clica no botao "Editar"
4. E redirecionado para o wizard com todos os dados preenchidos
5. Navega pelas etapas e faz as alteracoes necessarias
6. No Step 10 (Finalizacao), clica em "Salvar Alteracoes"
7. O sistema atualiza o registro existente no banco
8. Recebe confirmacao e volta ao historico
```

### Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| `src/lib/reportDatabase.ts` | Adicionar `updateReportInDatabase()` |
| `src/contexts/ChecklistContext.tsx` | Adicionar modo de edicao (estado + funcoes) |
| `src/pages/ReportsHistory.tsx` | Adicionar botao "Editar" no modal de detalhes |
| `src/components/steps/Step10Finalizacao.tsx` | Adaptar submissao para modo edicao |
| `src/components/ChecklistWizard.tsx` | Banner visual de modo edicao |

### Seguranca

- A RLS existente ja permite UPDATE para administradores e gestores
- A verificacao `isAdmin` no frontend garante que apenas admins veem o botao
- O backend (RLS) valida independentemente as permissoes de UPDATE

