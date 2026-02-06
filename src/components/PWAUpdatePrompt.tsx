import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

export function PWAUpdatePrompt() {
  const [dismissed, setDismissed] = useState(false);
  
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('[PWA] Service Worker registrado:', r);
    },
    onRegisterError(error) {
      console.error('[PWA] Erro ao registrar Service Worker:', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!needRefresh || dismissed) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-primary text-primary-foreground rounded-xl shadow-lg p-4 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Nova versão disponível</h3>
            <p className="text-xs opacity-90 mt-0.5">
              Atualize para obter as últimas melhorias
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleUpdate}
              className="text-xs"
            >
              Atualizar
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
