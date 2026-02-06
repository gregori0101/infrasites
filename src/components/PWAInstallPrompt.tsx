import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { X, Download, Share, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, promptInstall, dismissPrompt } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has dismissed before (within last 7 days)
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setDismissed(true);
        return;
      }
    }

    // Show banner after a short delay if installable or iOS
    const timer = setTimeout(() => {
      if (!isInstalled && !dismissed) {
        setShowBanner(isInstallable || isIOS);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, isIOS, dismissed]);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
    setDismissed(true);
    setShowBanner(false);
    dismissPrompt();
  };

  const handleLearnMore = () => {
    setShowBanner(false);
    navigate('/instalar');
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-xl shadow-lg p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Download className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">Instalar InfraSite</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isIOS 
                ? 'Adicione à tela inicial para acesso rápido'
                : 'Instale o app para acesso rápido e offline'
              }
            </p>
            
            <div className="flex items-center gap-2 mt-3">
              {isIOS ? (
                <>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleLearnMore}
                    className="text-xs"
                  >
                    <Share className="w-3 h-3 mr-1" />
                    Como instalar
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm" 
                  onClick={handleInstall}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Instalar agora
                </Button>
              )}
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleLearnMore}
                className="text-xs text-muted-foreground"
              >
                Saiba mais
              </Button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
