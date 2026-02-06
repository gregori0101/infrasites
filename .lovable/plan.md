
# Correção: Página Recarregando ao Adicionar Foto Panorâmica

## Problema Identificado

Após a implementação do PWA, a configuração `registerType: "autoUpdate"` no `vite-plugin-pwa` pode estar causando recarregamentos automáticos da página. Quando o Service Worker detecta uma atualização, ele pode automaticamente recarregar a página sem aviso, interrompendo operações como captura de fotos.

## Solução

Mudar a estratégia de atualização do PWA para dar controle ao usuário, em vez de recarregar automaticamente.

---

## Mudanças a Implementar

### 1. Alterar Configuração do PWA (`vite.config.ts`)

Mudar de `registerType: "autoUpdate"` para `registerType: "prompt"`. Isso evita recarregamentos automáticos e permite que o usuário escolha quando atualizar.

### 2. Adicionar Componente de Atualização do PWA

Criar um componente `PWAUpdatePrompt` que:
- Detecta quando há uma nova versão disponível
- Mostra um toast/botão perguntando ao usuário se deseja atualizar
- Só recarrega a página quando o usuário confirma

### 3. Registrar o Service Worker Manualmente

Usar o hook `useRegisterSW` do `vite-plugin-pwa/react` para controlar o registro e atualizações do Service Worker.

---

## Detalhes Técnicos

### Arquivo: `vite.config.ts`
```typescript
VitePWA({
  registerType: "prompt",  // Mudança: era "autoUpdate"
  // ... resto da configuração mantida
})
```

### Novo Arquivo: `src/components/PWAUpdatePrompt.tsx`

Componente que:
- Usa `useRegisterSW` para detectar atualizações
- Mostra toast quando nova versão disponível
- Permite ao usuário controlar quando recarregar

### Arquivo: `src/App.tsx`

Adicionar o novo componente `PWAUpdatePrompt` junto com o `PWAInstallPrompt`.

---

## Resultado Esperado

- A página **não** recarrega automaticamente durante operações
- Quando há nova versão, aparece um botão discreto para atualizar
- O usuário tem controle total sobre quando recarregar
- Capturas de foto funcionam sem interrupção
