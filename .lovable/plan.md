
# Plano: Adicionar Funcionalidade PWA (Progressive Web App)

## Objetivo
Transformar a aplicação InfraSite em um Progressive Web App instalável, permitindo que os técnicos instalem o app diretamente no celular e usem offline.

## Benefícios para os Usuários
- **Instalação fácil**: Instalar direto do navegador na tela inicial do celular
- **Acesso rápido**: Abre como um app nativo, sem barra do navegador
- **Funciona offline**: Carrega mesmo sem internet (dados precisam de conexão)
- **Carregamento rápido**: Recursos ficam em cache no dispositivo

---

## Etapas de Implementação

### 1. Instalar Plugin PWA para Vite
Adicionar a dependência `vite-plugin-pwa` que automatiza a geração do Service Worker e manifest.

### 2. Configurar o Plugin no Vite
Atualizar `vite.config.ts` com as configurações do PWA:
- Nome do app: "InfraSite"
- Descrição: "Checklist de Infraestrutura de Sites"
- Cores da marca Vivo (roxo #660099)
- Ícones em múltiplos tamanhos
- Estratégia de cache para assets

### 3. Criar Ícones do PWA
Adicionar ícones na pasta `public/` nos tamanhos necessários:
- `pwa-192x192.png` (ícone padrão)
- `pwa-512x512.png` (ícone de alta resolução)
- `apple-touch-icon.png` (180x180 para iOS)

### 4. Atualizar index.html
Adicionar meta tags otimizadas para mobile:
- Título: "InfraSite"
- Descrição atualizada
- Cor do tema (theme-color)
- Apple-specific meta tags para iOS
- Link para apple-touch-icon

### 5. Criar Página de Instalação (Opcional)
Página `/instalar` com instruções visuais de como instalar o app em diferentes dispositivos.

### 6. Adicionar Prompt de Instalação
Componente que detecta quando o app pode ser instalado e mostra um botão/banner convidando o usuário a instalar.

---

## Detalhes Técnicos

### Arquivos a Criar
```text
public/pwa-192x192.png      (ícone 192x192)
public/pwa-512x512.png      (ícone 512x512)
public/apple-touch-icon.png (ícone 180x180 para iOS)
src/pages/Install.tsx       (página de instruções)
src/hooks/use-pwa-install.ts (hook para gerenciar instalação)
src/components/PWAInstallPrompt.tsx (componente de prompt)
```

### Arquivos a Modificar
```text
package.json       - adicionar vite-plugin-pwa
vite.config.ts     - configurar plugin PWA
index.html         - meta tags mobile e título
src/App.tsx        - rota /instalar e prompt
```

### Configuração do Manifest (via plugin)
```typescript
{
  name: 'InfraSite',
  short_name: 'InfraSite',
  description: 'Checklist de Infraestrutura de Sites de Telecomunicações',
  theme_color: '#660099',
  background_color: '#ffffff',
  display: 'standalone',
  start_url: '/',
  icons: [
    { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
  ]
}
```

### Estratégia de Cache
- Assets estáticos (JS, CSS, imagens): Cache primeiro
- Requisições API: Rede primeiro com fallback

---

## Como Instalar (Instruções para Usuários)

**Android (Chrome):**
1. Acesse o site no Chrome
2. Toque no menu (3 pontos) > "Instalar app"
3. Confirme a instalação

**iPhone (Safari):**
1. Acesse o site no Safari
2. Toque no botão Compartilhar
3. Selecione "Adicionar à Tela de Início"
4. Confirme

---

## Resultado Esperado
Após a implementação, a aplicação poderá ser instalada como um app nativo em qualquer smartphone, aparecendo na tela inicial com o ícone da Vivo/InfraSite.
