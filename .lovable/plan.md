
# Excluir solicitacao ao recusar cadastro pendente

## Problema

Atualmente, ao recusar um cadastro pendente, o sistema apenas marca `approved = false` no registro. A solicitacao permanece na lista de pendentes indefinidamente.

## Solucao

Quando um administrador recusar um cadastro **pendente** (usuario que nunca foi aprovado), o registro sera **excluido** da tabela `user_roles`. Para usuarios **ja aprovados** que estao tendo o acesso revogado, o comportamento atual sera mantido (marcar `approved = false`).

## Alteracoes

### 1. Migracao de banco de dados

Adicionar uma politica RLS de DELETE na tabela `user_roles` para permitir que administradores excluam registros:

```sql
CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));
```

### 2. Arquivo: `src/pages/UserManagement.tsx`

Atualizar a funcao `handleReject` para verificar se o usuario e pendente ou aprovado:

- **Se pendente** (`approved = false`): executar `DELETE` na tabela `user_roles` onde `user_id = userId`
- **Se aprovado** (`approved = true`): manter o comportamento atual (UPDATE para `approved = false`)

A logica sera:

```
const targetUser = users.find(u => u.user_id === userId);
if (targetUser && !targetUser.approved) {
  // DELETE - remover registro completamente
} else {
  // UPDATE - revogar acesso (comportamento atual)
}
```

Mensagens de toast atualizadas:
- Pendente excluido: "Cadastro recusado" / "A solicitacao de cadastro foi removida"
- Aprovado revogado: "Acesso revogado" / "O usuario nao pode mais acessar o sistema" (mantido)
