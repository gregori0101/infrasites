import { useEffect } from 'react';

export function PWAUpdatePrompt() {
  useEffect(() => {
    const cleanupServiceWorker = async () => {
      try {
        let changed = false;
        const hadController = 'serviceWorker' in navigator && Boolean(navigator.serviceWorker.controller);

        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          const results = await Promise.all(registrations.map((registration) => registration.unregister()));
          changed = results.some(Boolean);
        }

        if ('caches' in window) {
          const cacheNames = await caches.keys();
          const stalePwaCaches = cacheNames.filter((name) => {
            const normalized = name.toLowerCase();
            return (
              normalized.includes('workbox') ||
              normalized.includes('precache') ||
              normalized.includes('runtime') ||
              normalized.includes('supabase-api') ||
              normalized.includes('vivo') ||
              normalized.startsWith('pwa-')
            );
          });
          const deleted = await Promise.all(stalePwaCaches.map((name) => caches.delete(name)));
          changed = changed || deleted.some(Boolean);
        }

        if ((changed || hadController) && !sessionStorage.getItem('pwa-sw-cleanup-reloaded')) {
          sessionStorage.setItem('pwa-sw-cleanup-reloaded', 'true');
          window.location.reload();
        }
      } catch (error) {
        console.warn('[PWA] Falha ao limpar service worker antigo:', error);
      }
    };

    void cleanupServiceWorker();
  }, []);

  return null;
}
