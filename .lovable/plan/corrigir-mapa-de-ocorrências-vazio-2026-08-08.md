# Corrigir mapa de ocorrências vazio

## Diagnóstico (confirmado)

Abri a página `/check-vandalismo/mapa` num navegador de teste. Os dados estão corretos: existe 1 vistoria registrada (PAMNH / PA) com latitude e longitude preenchidas, e o marcador é criado (1 marcador no DOM, tiles carregando).

O problema é de layout: o contêiner do mapa tem **altura 0 px** (largura 1280, altura 0). O mapa usa `height: 100%`, mas o elemento pai não tem altura definida (`min-h-screen` no wrapper, sem altura fixa), então 100% resolve para zero. Resultado: tela em branco entre o cabeçalho e a legenda.

## Correção

Em `src/pages/VandalismoMapa.tsx`:

1. Trocar o wrapper de `min-h-screen` para altura fixa de viewport (`h-screen` com `overflow-hidden`), mantendo cabeçalho e legenda fixos e o mapa ocupando o espaço restante.
2. Dar altura explícita à área do mapa (`flex-1 min-h-0`) e usar `height: 100%` apenas dentro dela — assim o Leaflet recebe uma altura real.
3. Chamar `invalidateSize()` do Leaflet logo após a montagem (via `whenReady`/`useEffect` curto), para o mapa recalcular dimensões caso o container mude de tamanho.

## Observações

- Hoje existe apenas 1 registro de vandalismo com GPS no banco, então o mapa mostrará 1 marcador. Registros antigos sem coordenadas continuam fora do mapa (comportamento esperado).
