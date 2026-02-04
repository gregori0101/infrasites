
Objetivo
- Parar o “Ah, não! Algo deu errado ao exibir esta página da Web.” (crash do Chrome) ao capturar/adicionar foto (principal e extras) no Android Chrome.

Diagnóstico (baseado no que vi no código + sintoma do print)
- Esse “Ah, não!” é a tela do Chrome quando a aba “quebra” (crash), não é apenas reload por submit.
- Hoje o fluxo faz: FileReader.readAsDataURL(file) → gera uma string base64 grande → depois comprime via canvas → converte base64 → Blob → upload.
- Em Android, especialmente com fotos grandes da câmera, a criação/manipulação dessas strings base64 pode estourar memória e derrubar a aba.
- Já corrigimos “type=button” para evitar submits, mas o erro persistiu: isso aponta mais para “pressão de memória” do que para submit.

Estratégia de correção (mudança de arquitetura do upload, sem quebrar o resto)
1) Evitar base64 no caminho principal (usar File/Blob direto)
- Implementar um caminho “file-first”:
  - Em vez de FileReader → base64, vamos:
    - carregar a imagem a partir do File (via createImageBitmap ou Image + objectURL)
    - desenhar no canvas
    - exportar direto como Blob (canvas.toBlob)
    - enviar Blob para o storage
- Isso reduz picos de memória e evita strings base64 gigantes.

2) Estender o hook usePhotoUpload para aceitar File
- No `src/hooks/use-photo-upload.ts`:
  - Adicionar uma função nova, por exemplo `uploadPhotoFile(file: File): Promise<string | null>`.
  - Manter a função existente `uploadPhoto(base64Data: string)` para compatibilidade (caso algum lugar ainda use base64).
  - `uploadPhotoFile` deve:
    - validar tipo/tamanho (ou assumir que o componente já validou)
    - comprimir do File para Blob (target ~500KB como hoje; e mais agressivo se necessário)
    - fazer upload do Blob (sem converter para base64)
    - limpar referências (ajuda GC): revogar objectURL, soltar canvas, setar variáveis grandes para null

3) Criar utilitário de compressão “File -> Blob” com fallback
- Em `src/lib/imageCompression.ts` (ou um novo utilitário dentro dele, reaproveitando padrão existente):
  - Adicionar funções:
    - `compressFileToBlob(file, options/targetKB): Promise<Blob>`
    - internamente, tentar:
      - createImageBitmap(file) (melhor performance/memória quando disponível)
      - fallback para Image() + URL.createObjectURL(file)
    - iterar tentativas (redução de dimensão/qualidade), semelhante ao `compressWithFallback`, mas produzindo Blob.
  - Garantir `URL.revokeObjectURL()` no finally.

4) Atualizar componentes PhotoCapture e PhotoCaptureWithExtras para usar uploadPhotoFile
- Em `src/components/ui/photo-capture.tsx`:
  - Remover FileReader/readAsDataURL do caminho padrão.
  - No `handleCapture`, usar diretamente:
    - `const result = await uploadPhotoFile(file)`
  - Resetar `e.target.value = ''` (ou `inputRef.current.value=''`) após processar para permitir selecionar a mesma foto novamente.
  - Manter try/catch/finally envolvendo todo o handler (não só dentro do onload), já que agora tudo é await direto.
- Em `src/components/ui/photo-capture-with-extras.tsx`:
  - Mesma mudança para `handleMainCapture` e `handleExtraCapture`.
  - Garantir que `processingExtra/isProcessing` sejam desligados no finally sempre, mesmo em erros.

5) Rede de segurança: capturar erros assíncronos globais (para não “morrer” silenciosamente)
- Em `src/App.tsx`:
  - Adicionar listeners:
    - `window.addEventListener('unhandledrejection', ...)`
    - `window.addEventListener('error', ...)`
  - Nesses handlers:
    - logar no console (com prefixo claro)
    - mostrar toast “Ocorreu um erro ao processar a foto. Tente novamente.”
    - `event.preventDefault()` quando aplicável (especialmente em unhandledrejection) para evitar que o browser finalize o app por erro não tratado.
- Observação: isso não impede crash por memória, mas ajuda muito a evitar “quedas” por Promise rejeitada não tratada.

6) Ajustes finos para Android Chrome (memória/performance)
- Reduzir um pouco dimensões máximas no mobile:
  - Se detectar mobile (hook `use-mobile` já existe), usar maxWidth/maxHeight menores (ex.: 1280) antes de tentar qualidade alta.
- Garantir que os Blobs sejam criados como JPEG (não WebP em todos os devices, mas podemos manter WebP como fallback se der certo).
- Inserir pequenos yields entre etapas pesadas:
  - `await new Promise(requestAnimationFrame)` ou `await new Promise(r => setTimeout(r, 0))` antes/depois de compressão para evitar travar a UI.

7) Testes de validação (o que você deve checar no Android)
- Fluxo principal:
  - Capturar foto principal em um campo comum (Step 1/2 etc.) e confirmar que não crasha.
- Extras:
  - Adicionar 3-5 fotos extras no mesmo campo (sequencialmente) e confirmar estabilidade.
- Fibra/Finalização:
  - Onde `PhotoCapture` ainda é usado (Step6/Step10), repetir o teste, porque eles usam “Adicionar foto” com value null (muito importante).
- Rede ruim:
  - Testar com conexão mais lenta (4G fraco) para confirmar que o progresso e estados não deixam o componente travado.

Riscos e como vamos mitigar
- Diferenças de compatibilidade do canvas/toBlob/createImageBitmap:
  - Usar fallback (Image + objectURL) se createImageBitmap falhar.
- Mudança grande no caminho de upload:
  - Manter `uploadPhoto(base64)` antigo por compatibilidade; migrar componentes primeiro, e só depois avaliar remover base64 em outras partes.
- Possível perda de qualidade:
  - Manter tentativas progressivas e apenas reduzir mais se precisar atingir target KB.

Arquivos que serão alterados (previsto)
- src/hooks/use-photo-upload.ts (adicionar uploadPhotoFile + usar compressão via Blob)
- src/lib/imageCompression.ts (adicionar compressão File/Blob com fallback)
- src/components/ui/photo-capture.tsx (trocar FileReader por uploadPhotoFile)
- src/components/ui/photo-capture-with-extras.tsx (trocar FileReader por uploadPhotoFile)
- src/App.tsx (handlers globais de erro/unhandled rejection)

Critério de pronto
- No Android Chrome, ao tocar “Capturar Foto” e confirmar a foto:
  - não aparece mais “Ah, não!”
  - a foto aparece no preview do campo
  - upload completa (ou cai no fallback com mensagem, sem derrubar a página)
