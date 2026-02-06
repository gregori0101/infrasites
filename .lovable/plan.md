
# Plano: Aplicar Tratamento Robusto de Erros em Todos os Componentes de Foto

## Diagnóstico

A página continua recarregando ao adicionar fotos porque o componente **`PhotoCapture`** (usado nas seções de Fibra Óptica e Finalização) **não possui** o mesmo tratamento robusto de erros que foi implementado no `PhotoCaptureWithExtras`.

O problema específico é que erros assíncronos não capturados (como falhas de memória durante compressão) causam "Unhandled Promise Rejections" que podem fazer o navegador recarregar a página.

## Componentes Afetados

| Componente | Uso | Status |
|------------|-----|--------|
| `PhotoCaptureWithExtras` | Step1-5, Step7, Step9 | ✅ Já possui double try-catch |
| `PhotoCapture` | Step6, Step10 | ❌ **Precisa de ajuste** |

## Mudanças a Implementar

### 1. Atualizar `PhotoCapture` (`src/components/ui/photo-capture.tsx`)

Adicionar o mesmo padrão de double try-catch usado em `PhotoCaptureWithExtras`:

```typescript
const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  
  if (inputRef.current) {
    inputRef.current.value = '';
  }
  
  if (!file) return;

  // CRÍTICO: Envolver TUDO em try-catch para evitar rejeições não tratadas
  try {
    // Validações...
    
    setIsProcessing(true);

    try {
      // Upload interno com seu próprio try-catch
      const result = await uploadPhotoFile(file);
      // ...
    } catch (uploadError) {
      // Erro específico de upload
      console.error("[PhotoCapture] Upload error:", uploadError);
      toast.error("Erro ao enviar foto", { 
        description: "Verifique sua conexão e tente novamente." 
      });
    }
  } catch (error) {
    // Erro externo genérico (previne crash)
    console.error("[PhotoCapture] Capture error:", error);
    toast.error("Erro ao processar imagem", {
      description: "Tente capturar novamente."
    });
  } finally {
    setIsProcessing(false);
  }
};
```

### 2. Melhorar Mensagens de Erro

As mensagens de erro serão padronizadas para serem mais claras e informativas para o usuário.

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/ui/photo-capture.tsx` | Adicionar double try-catch no `handleCapture` |

## Resultado Esperado

- O componente `PhotoCapture` terá a mesma proteção contra crashes que o `PhotoCaptureWithExtras`
- Erros durante captura/upload mostrarão toasts informativos em vez de recarregar a página
- Todas as seções do formulário (Fibra Óptica, Finalização, etc.) ficarão estáveis
