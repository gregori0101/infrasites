import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { ArrowLeft, Download, Share, Plus, MoreVertical, Menu, Smartphone, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Install() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const navigate = useNavigate();

  const handleInstall = async () => {
    await promptInstall();
  };

  return (
    <>
      <Helmet>
        <title>Instalar App | InfraSite</title>
        <meta name="description" content="Como instalar o InfraSite no seu celular" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Instalar InfraSite</h1>
          </div>
        </header>

        <main className="p-4 max-w-lg mx-auto space-y-6">
          {/* Status Card */}
          {isInstalled ? (
            <Card className="border-success/50 bg-success/10">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-success">App já instalado!</p>
                  <p className="text-sm text-muted-foreground">
                    Você está usando o InfraSite como app
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Instale como app</p>
                  <p className="text-sm text-muted-foreground">
                    Acesse mais rápido direto da tela inicial
                  </p>
                </div>
                {isInstallable && (
                  <Button size="sm" onClick={handleInstall}>
                    <Download className="w-4 h-4 mr-1" />
                    Instalar
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Benefícios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Acesso rápido</p>
                  <p className="text-xs text-muted-foreground">
                    Abra direto da tela inicial, como um app nativo
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Download className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Funciona offline</p>
                  <p className="text-xs text-muted-foreground">
                    O app carrega mesmo sem internet (dados precisam de conexão)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Tela cheia</p>
                  <p className="text-xs text-muted-foreground">
                    Sem barra do navegador, mais espaço para trabalhar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions for Android */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-success flex items-center justify-center">
                  <span className="text-success-foreground text-xs font-bold">A</span>
                </div>
                Android (Chrome)
              </CardTitle>
              <CardDescription>
                Siga os passos para instalar no Android
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm">Toque no menu do navegador</p>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <MoreVertical className="w-4 h-4" />
                    <span className="text-xs">(3 pontos no canto superior)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm">Selecione "Instalar app" ou "Adicionar à tela inicial"</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm">Confirme a instalação</p>
                </div>
              </div>

              {isInstallable && (
                <Button className="w-full mt-2" onClick={handleInstall}>
                  <Download className="w-4 h-4 mr-2" />
                  Instalar agora
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Instructions for iOS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-muted-foreground flex items-center justify-center">
                  <span className="text-background text-xs font-bold">🍎</span>
                </div>
                iPhone / iPad (Safari)
              </CardTitle>
              <CardDescription>
                Siga os passos para instalar no iOS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm">Abra o site no Safari (não funciona em outros navegadores)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm">Toque no botão Compartilhar</p>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <Share className="w-4 h-4" />
                    <span className="text-xs">(ícone de quadrado com seta)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm">Role para baixo e toque em "Adicionar à Tela de Início"</p>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <Plus className="w-4 h-4" />
                    <span className="text-xs">(pode precisar rolar a lista)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <p className="text-sm">Confirme tocando em "Adicionar"</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back button */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o app
          </Button>
        </main>
      </div>
    </>
  );
}
