

# Plano: Perfil do Usuario + Logs de Atividade

## 1. Pagina de Perfil do Usuario

### O que sera feito
Uma nova pagina `/perfil` acessivel por todos os usuarios autenticados, contendo:

- **Dados pessoais**: email, cargo, operadora, area de atuacao, data de cadastro
- **Alterar senha**: formulario para o usuario redefinir sua propria senha (usando a edge function `public-reset-password` ja existente)
- **Estatisticas pessoais** (para tecnicos): total de vistorias, vistorias no mes, nivel, badges desbloqueados, progresso para o proximo nivel
- **Botao de logout** destacado

### Arquivos envolvidos
| Arquivo | Acao |
|---------|------|
| `src/pages/Profile.tsx` | Criar - pagina completa de perfil |
| `src/App.tsx` | Editar - adicionar rota `/perfil` protegida |
| `src/pages/Index.tsx` | Editar - adicionar link de perfil no header do tecnico |
| `src/pages/Dashboard.tsx` | Editar - adicionar link de perfil no menu mobile e sidebar |

---

## 2. Logs de Atividade (Audit Trail)

### O que sera feito
Registrar acoes importantes dos usuarios em uma tabela `activity_logs` e exibi-las em uma pagina acessivel apenas por administradores.

### Acoes registradas
- Aprovacao/rejeicao de usuarios
- Alteracao de cargo ou operadora
- Exclusao de relatorios
- Reset de senha por administrador
- Criacao/exclusao de atribuicoes de vistoria

### Tabela no banco de dados

```text
activity_logs
-----------------------------------------
id          uuid (PK, gen_random_uuid)
user_id     uuid (quem fez a acao)
action      text (ex: 'user_approved', 'report_deleted')
target_type text (ex: 'user', 'report', 'assignment')
target_id   text (ID do objeto afetado)
details     jsonb (metadados extras)
created_at  timestamptz (now())
```

### RLS
- Administradores podem ler todos os logs
- Nenhum usuario pode inserir via client (insercao via funcao SECURITY DEFINER)

### Funcao de insercao segura

Uma funcao `log_activity(action, target_type, target_id, details)` com SECURITY DEFINER que captura automaticamente o `auth.uid()` do usuario logado.

### Pagina de visualizacao
| Arquivo | Acao |
|---------|------|
| `src/pages/ActivityLogs.tsx` | Criar - tabela com filtros por acao, data e usuario |
| `src/lib/activityLogger.ts` | Criar - funcao helper para chamar `log_activity` RPC |
| `src/App.tsx` | Editar - adicionar rota `/logs` protegida (admin) |
| `src/pages/Dashboard.tsx` | Editar - adicionar link no menu |

### Integracao nos pontos de acao
Adicionar chamadas ao logger nos seguintes arquivos:
- `src/pages/UserManagement.tsx` - ao aprovar, rejeitar, alterar cargo
- `src/pages/ReportsHistory.tsx` - ao excluir relatorio
- `src/pages/AssignmentManagement.tsx` - ao criar/excluir atribuicao

---

## 3. Detalhes Tecnicos

### Migracao SQL

```sql
-- Tabela de logs
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Somente admins podem ler
CREATE POLICY "Admins can view logs"
  ON public.activity_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Funcao segura para inserir logs
CREATE OR REPLACE FUNCTION public.log_activity(
  _action text,
  _target_type text,
  _target_id text DEFAULT NULL,
  _details jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), _action, _target_type, _target_id, _details);
END;
$$;
```

### Ordem de implementacao
1. Migracao SQL (tabela + funcao + RLS)
2. Pagina de Perfil (`/perfil`)
3. Helper de logging (`activityLogger.ts`)
4. Pagina de Logs (`/logs`)
5. Integrar logging nas acoes existentes
6. Adicionar links de navegacao (perfil + logs) no menu mobile e sidebar

