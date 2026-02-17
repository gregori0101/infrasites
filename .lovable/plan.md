

## Correcao: Baterias OK sendo classificadas como NOK no dashboard

### Problema identificado

O codigo do dashboard (`useDashboardStats.ts`, linha 570) verifica se o estado da bateria e `"BOA"` para classificar como OK. Porem, o formulario de checklist salva o estado como `"OK"` no banco de dados. Isso faz com que todas as baterias com estado "OK" sejam incorretamente contabilizadas como NOK.

**Dados do site AMCDB no banco:**
- 10 baterias, todas com `estado = "OK"`
- Dashboard mostra todas como problematicas porque `"OK" !== "BOA"`

### Solucao

Alterar a condicao na linha 570 de `useDashboardStats.ts` para reconhecer tanto `"OK"` quanto `"BOA"` como estados saudaveis:

```typescript
// Antes (bugado):
if (estado === "BOA" || !estado) {

// Depois (corrigido):
if (estado === "OK" || estado === "BOA" || !estado) {
```

### Detalhes tecnicos

**Arquivo a editar:** `src/components/dashboard/useDashboardStats.ts` (linha 570)

- Adicionar `estado === "OK"` na condicao que classifica baterias como saudaveis
- Manter `"BOA"` por compatibilidade com eventuais registros antigos
- Manter `!estado` para tratar baterias sem estado definido como OK (comportamento atual)
- Impacto: corrige a contagem de baterias OK/NOK em todo o dashboard (Overview, painel de Baterias, drill-downs, e indicadores de site)

