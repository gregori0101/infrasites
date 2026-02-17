

## Pagina de Ranking dos Tecnicos

Criar uma pagina dedicada (`/ranking`) para visualizar o ranking completo de todos os tecnicos, com seus niveis, XP, vistorias e posicao.

### O que muda para o usuario

- Nova pagina acessivel em `/ranking` com o ranking completo dos tecnicos
- Tabela ordenada por total de vistorias (mais produtivo no topo)
- Cada linha mostra: posicao, nome/email do tecnico, nivel com emoji, total de XP, vistorias (total/mes), e badges desbloqueados
- Card de destaque no topo com o podio (top 3)
- Acessivel para todos os usuarios logados (tecnicos veem sua posicao destacada)
- Link para a pagina de ranking no menu/navegacao principal

### Detalhes tecnicos

**1. Nova funcao `fetchAllTechniciansRanking` em `src/lib/reportDatabase.ts`**
- Busca contagem de reports agrupada por `user_id`
- Cruza com tabela `user_roles` para obter operadora e area de atuacao
- Busca emails dos usuarios via edge function `get-technician-emails` (ja existente)
- Calcula stats por tecnico (total, mensal, max em um dia, dias consecutivos)
- Retorna array ordenado por total de vistorias descendente

**2. Nova pagina `src/pages/Ranking.tsx`**
- Card de podio no topo (1o, 2o, 3o lugar) com emojis de medalha
- Tabela completa com todas as colunas: posicao, tecnico, nivel, XP, vistorias totais, vistorias no mes, badges
- Linha do usuario logado destacada com cor de fundo diferente
- Filtro por operadora (VIVO/TEL) se aplicavel
- Responsivo para mobile

**3. Rota e navegacao**
- Adicionar rota `/ranking` em `App.tsx` como rota protegida (usuario aprovado)
- Adicionar link no menu de navegacao existente

**4. Arquivos a criar/editar:**
- Criar: `src/pages/Ranking.tsx`
- Editar: `src/lib/reportDatabase.ts` (adicionar `fetchAllTechniciansRanking`)
- Editar: `src/App.tsx` (adicionar rota)
- Editar: `src/pages/Index.tsx` (adicionar link de navegacao para o ranking)

