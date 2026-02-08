
# Permitir Administradores Acessarem o Checklist

## Problema Atual
Quando um administrador ou gestor clica no botao "Checklist" no dashboard, ele e redirecionado para `/`, mas a pagina `Index.tsx` possui um `useEffect` que redireciona automaticamente administradores e gestores de volta para `/dashboard`. Isso cria um loop de redirecionamento que impede o acesso ao checklist.

## Solucao
Usar um parametro de URL (`?checklist=true`) para indicar que o usuario deseja acessar o checklist intencionalmente, e pular o redirecionamento automatico nesse caso.

## Alteracoes

### 1. `src/pages/Index.tsx`
- Ler o parametro `checklist` da URL usando `useSearchParams` do React Router
- Modificar o `useEffect` de redirecionamento para **nao** redirecionar quando `?checklist=true` estiver presente
- Quando o admin/gestor acessar com esse parametro, exibir o `ChecklistWizard` normalmente

### 2. `src/pages/Dashboard.tsx`
- Atualizar os botoes "Checklist" (sidebar e mobile) para navegar para `/?checklist=true` em vez de apenas `/`
- Isso vale tanto para o botao na barra lateral (desktop) quanto para o chip de acao (mobile)

## Detalhes Tecnicos

```text
Fluxo atual:
  Dashboard [Checklist] --> navigate("/") --> Index.tsx useEffect --> navigate("/dashboard") --> loop

Fluxo corrigido:
  Dashboard [Checklist] --> navigate("/?checklist=true") --> Index.tsx detecta param --> exibe ChecklistWizard
```

Arquivos modificados:
- `src/pages/Index.tsx` (2 alteracoes: import useSearchParams + condicao no useEffect)
- `src/pages/Dashboard.tsx` (2 alteracoes: sidebar button + mobile button URL)
