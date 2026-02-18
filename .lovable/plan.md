

## Adicionar Porcentagem nos Cards de Risco (Autonomia e Obsolescencia)

Adicionar a porcentagem que cada categoria representa do total, exibida como badge nos cards de risco de autonomia e obsolescencia no painel de Baterias.

### O que muda para o usuario

- Cada card de risco (OK, Medio Risco, Alto Risco, Critico, Sem Banco) passa a exibir um badge com a porcentagem que aquela categoria representa do total
- Exemplo: se ha 58 OK de 449 total, o card OK mostra "13%"
- Melhora a leitura rapida dos dados sem precisar fazer calculo mental

### Detalhes tecnicos

**Arquivo a editar:** `src/components/dashboard/panels/BateriaPanel.tsx`

**1. Cards de Risco de Autonomia (AutonomyRiskCard)**
- Adicionar prop `percentage` ao componente `AutonomyRiskCard` (linhas 79-119)
- Exibir badge com a porcentagem ao lado do valor numerico
- Calcular: `Math.round((value / totalAutonomy) * 100)` para cada card
- Passar a porcentagem nas 4 instancias (OK, Medio, Alto, Critico) nas linhas 516-551

**2. Cards de Risco de Obsolescencia (cards inline, linhas 680-755)**
- Adicionar badge de porcentagem em cada card (OK, Medio Risco, Alto Risco, Sem Banco)
- Calcular usando `totalObsolescencia` que ja existe no escopo do pie chart mas sera movido para ficar acessivel nos cards

**Formato do badge:** texto pequeno colorido ao lado do valor, usando o mesmo estilo de badge ja utilizado nos StatCards do projeto (ex: `bg-success/10 text-success` para OK, `bg-destructive/10 text-destructive` para critico).
