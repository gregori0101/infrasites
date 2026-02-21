
# Plano: Atualizar e Profissionalizar Todos os Painéis do Dashboard

## Objetivo
Padronizar a aparencia visual de todos os paineis do dashboard, aplicando um estilo consistente e profissional em cada um. Atualmente, os paineis possuem estilos mistos -- alguns usam headers com barra colorida, outros com gradiente; tooltips, graficos e cards tem estilos diferentes entre si. O objetivo e unificar tudo.

## Mudancas Visuais a Aplicar

### 1. Headers de Secao Padronizados (todos os paineis)
- Usar a mesma estrutura: barra lateral colorida (`w-1.5 h-7 rounded-full`) + titulo em negrito + subtitulo em texto pequeno
- Aplicar em: DGOS, Energia, Zeladoria, Climatizacao, Fibra Optica, GMG, Gabinete, Produtividade, Bateria

### 2. Cards de Graficos Refinados (todos os paineis)
- Bordas sutis (`border-border/60`)
- Sombra leve (`shadow-sm`)
- CardHeader com icone em container arredondado (`p-1.5 rounded-lg bg-primary/10`)
- Titulo `text-sm font-semibold` com icone ao lado
- Aplicar em: DGOS, Energia, Zeladoria, Climatizacao, Fibra Optica, GMG

### 3. Graficos (Pie/Bar/Line) Padronizados
- Pie charts: `innerRadius={65}`, `outerRadius={85}`, `paddingAngle={4}`, `strokeWidth={2}`, `stroke="hsl(var(--card))"`
- Tooltip style unificado: `borderRadius: '0.75rem'`, `border: '1px solid hsl(var(--border))'`, `boxShadow`, `fontSize: '0.8rem'`
- Legend: `fontSize: '0.75rem'`, `fontWeight: 500`
- Aplicar a todos os graficos em todos os paineis

### 4. Espacamento Consistente
- `space-y-6` entre secoes principais
- `gap-4` nos grids de cards
- `mb-3` apos section headers

### 5. Cards de KPI (StatCard) -- ja atualizado
- Manter o estilo atualizado com uppercase, tracking-wide, etc.

## Arquivos a Editar

| Arquivo | Alteracoes |
|---------|-----------|
| `DGOSPanel.tsx` | Headers de secao refinados, tooltips e graficos padronizados, bordas dos cards |
| `EnergiaPanel.tsx` | Headers, graficos pie/bar com estilo unificado, tooltips |
| `ZeladoriaPanel.tsx` | Header padronizado, card de progress com bordas refinadas |
| `ClimatizacaoPanel.tsx` | Headers, graficos padronizados, tooltips unificados |
| `FibraOpticaPanel.tsx` | Headers, graficos pie padronizados, card de resumo refinado |
| `GMGPanel.tsx` | Headers, graficos pie com estilo consistente, cards de fabricante/potencia |
| `GabinetePanel.tsx` | Headers padronizados com subtitulo |
| `ProdutividadePanel.tsx` | Headers de secao, cards de KPI com iconBg refinado, tabela com bordas |
| `BateriaPanel.tsx` | Headers padronizados com subtitulo, graficos pie com estilo unificado |

## Detalhes Tecnicos

### Estilo padrao de Header de Secao:
```tsx
<div className="flex items-center gap-3">
  <div className="w-1.5 h-7 bg-[COR] rounded-full" />
  <div>
    <h2 className="font-bold text-lg tracking-tight">Titulo</h2>
    <p className="text-xs text-muted-foreground">Subtitulo</p>
  </div>
</div>
```

### Estilo padrao de Card de Grafico:
```tsx
<Card className="border-border/60 shadow-sm">
  <CardHeader className="pb-2 px-6">
    <CardTitle className="text-sm font-semibold flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-[COR]/10">
        <Icon className="w-3.5 h-3.5 text-[COR]" />
      </div>
      Titulo do Grafico
    </CardTitle>
  </CardHeader>
  <CardContent className="px-6">...</CardContent>
</Card>
```

### Estilo padrao de Tooltip:
```tsx
contentStyle={{
  borderRadius: '0.75rem',
  border: '1px solid hsl(var(--border))',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  fontSize: '0.8rem'
}}
```

### Estilo padrao de Pie Chart:
```tsx
<Pie
  innerRadius={65}
  outerRadius={85}
  paddingAngle={4}
  strokeWidth={2}
  stroke="hsl(var(--card))"
/>
```

## Ordem de Implementacao
1. DGOSPanel + EnergiaPanel (paineis com mais graficos)
2. GMGPanel + ZeladoriaPanel + FibraOpticaPanel
3. ClimatizacaoPanel + GabinetePanel
4. ProdutividadePanel + BateriaPanel (ajustes menores nos headers)
