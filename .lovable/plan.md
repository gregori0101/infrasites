
Objetivo: corrigir definitivamente os controles da galeria de fotos (zoom, rotação, navegação e fechar) dentro da Auditoria de OS, especialmente no cenário mobile mostrado no print.

Diagnóstico encontrado:
- O Lightbox já está em portal (`document.body`), mas quando ele abre por cima de um modal Radix (`Dialog`), ele continua fora da “árvore interativa” do `DismissableLayer`.
- Em diálogos modais, o Radix bloqueia interações fora da camada ativa (`pointer-events` + outside detection). Isso faz os cliques/toques no Lightbox serem ignorados ou tratados como interação “fora” do modal principal.
- Resultado prático: ferramentas visíveis, mas com comportamento inconsistente (não respondem corretamente).

Implementação proposta (mínima e global):
1) Tornar o Lightbox reconhecido como área interativa válida dos modais Radix
- Arquivo: `src/components/ui/lightbox.tsx`
- Envolver o container raiz do Lightbox com `DismissableLayerBranch` de `@radix-ui/react-dismissable-layer`.
- Isso impede que toques/cliques no Lightbox sejam tratados como “outside interaction” do modal pai.

2) Garantir recebimento de ponteiros quando o modal pai estiver ativo
- No mesmo container raiz do Lightbox, aplicar explicitamente `pointer-events-auto` (Tailwind).
- Isso elimina o bloqueio herdado de ponteiros em cenários com modal ativo.

3) Ajuste de robustez para mobile (toque)
- Revisar os handlers de interação para manter consistência em touch:
  - preservar funcionamento dos botões de toolbar (zoom/rotate/close),
  - manter navegação por setas e miniaturas,
  - sem regressão de backdrop click para fechar.
- Se necessário, substituir handlers estritamente de mouse por pointer handlers no bloco de arraste (para funcionar melhor em Android/iOS ao dar zoom e mover imagem).

Validação (E2E, obrigatória):
1. Abrir Auditoria de OS (gestor) → abrir detalhe da OS → abrir foto.
2. Testar, em sequência:
   - Zoom + e Zoom -
   - Rotacionar
   - Próxima/Anterior
   - Seleção por miniatura
   - Fechar no “X”
3. Confirmar que:
   - os botões respondem ao toque/clique,
   - o modal de detalhe não fecha indevidamente durante uso do Lightbox,
   - ao fechar Lightbox, volta normalmente ao detalhe da OS.
4. Repetir em viewport mobile (390x844) para validar o cenário do print.

Arquivos impactados:
- `src/components/ui/lightbox.tsx` (principal, correção global de interação em cima de modais Radix).

Risco e mitigação:
- Risco: ajuste de camada afetar outros usos do Lightbox.
- Mitigação: como o ajuste é no componente compartilhado, farei teste rápido também em outro ponto que usa Lightbox (ex.: dashboard/site detail) para garantir que não houve regressão.
