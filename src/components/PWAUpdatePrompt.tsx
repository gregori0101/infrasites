import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect } from 'react';

export function PWAUpdatePrompt() {
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
    onNeedRefresh() {
      console.log('[PWA] Nova versão disponível');
    },
  });

  useEffect(() => {
    if (needRefresh) {
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}
