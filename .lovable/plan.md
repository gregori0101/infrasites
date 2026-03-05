

## Substituir visualização por tecnologia: Chumbo/Lítio → OK/NOK (Obsolescência e Autonomia)

### O que muda

**Remover**: Seção atual "Baterias por Tecnologia de Acesso" com cards de totais Chumbo/Lítio e gráfico "Distribuição por Tecnologia e Tipo" (linhas 282-363 do BateriaPanel).

**Adicionar no lugar**: Nova seção "Indicadores por Tecnologia de Acesso" com dois gráficos de barras empilhadas:
1. **Obsolescência por Tecnologia** — barras OK (verde) e NOK (vermelho) por 2G/3G/4G/5G
2. **Autonomia por Tecnologia** — barras OK (verde) e NOK (vermelho) por 2G/3G/4G/5G

OK/NOK segue a lógica existente:
- Obsolescência: OK = ok + medio, NOK = alto
- Autonomia: OK = ok + medio, NOK = alto + critico

### Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `types.ts` | Alterar tipo `bateriasByTecAcesso` para incluir `ok` e `nok` para obsolescência e autonomia |
| `useDashboardStats.ts` | Computar OK/NOK por tecnologia no loop `tecAcessoMap` |
| `BateriaPanel.tsx` | Substituir seção de cards+gráfico por dois BarCharts OK vs NOK |

### Detalhes técnicos

**Novo tipo em `types.ts`**:
```typescript
bateriasByTecAcesso: { 
  tech: string; total: number; chumbo: number; litio: number;
  obsolescenciaOk: number; obsolescenciaNok: number;
  autonomiaOk: number; autonomiaNok: number;
}[];
```

**`useDashboardStats.ts`**: No loop `tecAcessoMap`, para cada bateria por tecnologia, classificar obsolescência (ok+medio vs alto) e autonomia (ok+medio vs alto+critico) usando os campos `obsolescenciaTipo` e `autonomyRisk` já existentes em `BatteryInfo`.

**`BateriaPanel.tsx`**: Substituir cards e gráfico Chumbo/Lítio por dois `BarChart` empilhados lado a lado (ou empilhados em mobile), cada um mostrando barras OK (verde) e NOK (vermelho) agrupadas por tecnologia.

