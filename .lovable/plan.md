
## Remover limite de altura na tabela "Detalhamento por UF"

### O que muda para o usuario

A tabela "Detalhamento por UF" no painel de Produtividade deixa de ter uma area de rolagem fixa (250px) e passa a exibir todos os registros de UF diretamente na tela, sem necessidade de scroll interno.

### Detalhes tecnicos

**Arquivo a editar:** `src/components/dashboard/panels/ProdutividadePanel.tsx`

**Alteracao:** Remover o wrapper `<ScrollArea className="h-[250px]">` e o `<ScrollBar>` que limitam a altura da tabela (linhas 334-388). A `<Table>` ficara diretamente dentro do `<CardContent>`, permitindo que todas as linhas sejam renderizadas sem restricao de altura.
