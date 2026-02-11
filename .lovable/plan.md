

# Adicionar botao de recusar cadastro na lista de pendentes

## Problema

Na secao "Aguardando Aprovacao", cada usuario pendente possui apenas o botao de aprovar (icone de check verde). Nao existe um botao para recusar o cadastro diretamente nessa lista.

## Solucao

Adicionar um botao vermelho com icone "X" ao lado do botao de aprovar, na lista de usuarios pendentes. Ao clicar, abre o mesmo dialogo de confirmacao ja existente, mas com a acao de "recusar". A funcao `handleReject` ja existe no codigo e sera reutilizada -- ela remove a aprovacao do usuario, impedindo o acesso ao sistema.

## Alteracoes

### Arquivo: `src/pages/UserManagement.tsx`

Na secao de usuarios pendentes (linhas 371-390), adicionar um segundo botao dentro do `div` de acoes:

- Botao vermelho com icone `X` (mesmo estilo usado na lista de aprovados)
- Ao clicar, abre o `confirmDialog` com `action: 'reject'`
- Texto do dialogo de confirmacao: "Recusar Cadastro" / "Este usuario nao tera acesso ao sistema. Deseja recusar o cadastro?"
- Atualizar o titulo e descricao do `AlertDialog` para cobrir o caso de recusa de pendente (diferente de revogar acesso de usuario ja aprovado)

### Detalhes do AlertDialog

Atualizar os textos do dialogo de confirmacao para diferenciar entre:
- **Aprovar**: "Aprovar Usuario" / "Este usuario podera acessar o sistema..."
- **Rejeitar pendente**: "Recusar Cadastro" / "Este usuario nao tera acesso ao sistema. Deseja recusar?"
- **Revogar aprovado**: "Revogar Acesso" / "Este usuario nao podera mais acessar o sistema..."

Nenhuma alteracao de banco de dados e necessaria. A logica de rejeicao ja existe e funciona corretamente.

