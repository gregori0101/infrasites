

## Sistema de Ranking e Gamificacao para Tecnicos

Transformar a experiencia do tecnico em algo mais envolvente, com niveis, pontos de experiencia (XP) e conquistas baseadas nas vistorias realizadas.

### O que muda para o usuario

- Na aba "Minhas Vistorias", um card de perfil aparece no topo mostrando:
  - **Nivel atual** (ex: "Nivel 5 - Inspetor Senior") com uma barra de progresso para o proximo nivel
  - **Total de XP** acumulado
  - **Vistorias realizadas** (hoje / mes / total)
  - **Ranking** entre todos os tecnicos (posicao)
  - **Conquistas/Badges** desbloqueados (icones visuais)

- Sistema de **niveis progressivos**:
  1. Novato (0-4 vistorias)
  2. Aprendiz (5-14)
  3. Inspetor (15-29)
  4. Inspetor Senior (30-49)
  5. Especialista (50-99)
  6. Mestre (100-199)
  7. Lenda (200+)

- **Conquistas/Badges** desbloqueaveis:
  - "Primeira Vistoria" - completar a primeira
  - "Maratonista" - 5 vistorias em um unico dia
  - "Consistente" - vistorias em 5 dias consecutivos
  - "Centenario" - 100 vistorias no total
  - "Relampago" - 3 vistorias em um unico dia

- **Posicao no ranking** em relacao aos outros tecnicos

### Detalhes tecnicos

**1. Nova funcao `fetchTechnicianStats` em `src/lib/reportDatabase.ts`**
- Consulta contagem de reports do usuario logado (total, mes atual, hoje)
- Consulta contagem total por user_id para calcular ranking relativo
- Retorna `{ total, monthly, today, rank, totalTechnicians }`

**2. Novo componente `src/components/technician/TechnicianRankCard.tsx`**
- Recebe as stats do tecnico e renderiza o card de gamificacao
- Calcula nivel, XP e progresso com base no total de vistorias
- Mostra badges conquistados como icones coloridos
- Barra de progresso animada com Tailwind
- Design compacto e mobile-first

**3. Logica de niveis e XP (pure functions, sem banco)**
- Cada vistoria = 10 XP
- Niveis definidos por thresholds fixos no codigo
- Badges calculados client-side com base nas stats
- Sem tabela adicional no banco - tudo derivado da contagem de reports

**4. Integracao no `TechnicianInbox.tsx`**
- Adicionar o `TechnicianRankCard` no topo da aba "Minhas Vistorias"
- Usar `useQuery` para buscar as stats do tecnico logado
- Dados atualizados automaticamente quando a lista de assignments muda

**5. Arquivos a criar/editar:**
- Criar: `src/components/technician/TechnicianRankCard.tsx`
- Criar: `src/lib/gamification.ts` (logica de niveis, XP, badges)
- Editar: `src/lib/reportDatabase.ts` (adicionar `fetchTechnicianStats`)
- Editar: `src/components/technician/TechnicianInbox.tsx` (integrar o card)

