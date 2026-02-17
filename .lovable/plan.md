

## Edição inline no modal de detalhes do site

Adicionar botoes de edição ao lado de cada campo na seção "Informações do Site" do modal de detalhes, permitindo alterar valores diretamente sem precisar abrir o formulário completo.

### O que muda para o usuário

- Cada campo editável (Site, UF, Técnico, Gabinetes, Operadora, Observações) terá um pequeno icone de lápis ao lado
- Ao clicar, o campo se transforma em um input editável inline
- Botões de confirmar e cancelar aparecem ao lado do campo
- Ao confirmar, o valor é salvo diretamente no banco de dados
- Campos não editáveis (Data) permanecem somente leitura
- Somente usuários com permissão (Admin, Gestor, ou autor do relatório) verão os botões de edição

### Detalhes técnicos

1. **Nova função `updateReportField` em `src/lib/reportDatabase.ts`**
   - Atualiza um campo individual diretamente na tabela `reports`
   - Recebe `reportId`, `fieldName` e `value`
   - Faz um `.update({ [fieldName]: value }).eq('id', reportId)`

2. **Novo componente `EditableInfoRow` no `SiteDetailModal.tsx`**
   - Substitui o `InfoRow` nos campos editáveis
   - Estado local para modo edição (toggle entre visualização e input)
   - Input com o valor atual pré-preenchido
   - Botões de Check (salvar) e X (cancelar)
   - Chama `updateReportField` ao confirmar e atualiza o estado local do report

3. **Campos editáveis:**
   - Site (`site_code`)
   - UF (`state_uf`)
   - Técnico (`technician_name`)
   - Gabinetes (`total_cabinets` - input numérico)
   - Operadora (`operadora`)
   - Observações (`observacoes`)

4. **Campos NÃO editáveis** (mantêm InfoRow normal):
   - Data (preservada como registro original)

5. **Controle de permissão**: Os botões de edição só aparecem quando `canEditReport` é `true` (mesmo controle já usado para o botão "Editar" do header)

