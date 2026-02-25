

# Corrigir visualizacao de fotos na Auditoria

## Problema
Na pagina `AuditoriaExecucao.tsx`, cada foto usa um componente `Dialog` individual embutido inline. Isso causa problemas ao fechar e navegar entre fotos, pois cada Dialog e independente e conflita com o Dialog pai.

## Solucao
Substituir os Dialogs individuais por foto pelo componente `Lightbox` (ja existente no projeto e ja usado em `AuditoriaDetailModal.tsx`), que suporta navegacao entre fotos, zoom, rotacao e fechamento correto.

## Mudancas

### `src/components/auditoria/AuditoriaExecucao.tsx`

1. **Importacoes**: Remover `Dialog, DialogContent, DialogTrigger`. Adicionar import do `Lightbox`. Adicionar estado para controlar o lightbox.

2. **Adicionar estado global do lightbox** no componente:
   - `lightboxImages`: array de `{url, label}`
   - `lightboxIndex`: indice inicial
   - `lightboxOpen`: boolean

3. **Substituir o Dialog inline por cada foto**: Ao clicar na miniatura ou no botao de zoom, abrir o Lightbox com todas as fotos do item, posicionado na foto clicada.

4. **Renderizar o Lightbox uma unica vez** fora do loop de items, no final do componente.

### Detalhes tecnicos

- O clique na miniatura da foto abrira o lightbox com todas as fotos daquele item, iniciando na foto clicada
- O clique no botao de lixeira continuara removendo a foto diretamente (sem abrir lightbox)
- O Lightbox sera renderizado uma vez no final do JSX com `open={lightboxOpen}` e `onClose` resetando o estado
- Remover import de `ZoomIn` (nao sera mais necessario inline) e `Dialog/DialogContent/DialogTrigger`

