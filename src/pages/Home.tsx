import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck, FileSearch, UserCircle, LayoutDashboard, Cable, Radar, ShieldAlert } from "lucide-react";
import { VivoLogo } from "@/components/ui/vivo-logo";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isGestor, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Início | InfraSites Vivo</title>
        <meta name="description" content="Escolha o módulo desejado para iniciar suas atividades." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b bg-card px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <VivoLogo className="h-8 w-auto" />
          <div className="flex items-center gap-2">
            {(isAdmin || isGestor) && (
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
              <UserCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">O que deseja fazer?</h1>
              <p className="text-muted-foreground text-sm">Selecione o módulo para iniciar</p>
            </div>

            <div className="grid gap-4">
              {/* Vistoria Site */}
              <Card
                className="cursor-pointer border-2 border-transparent hover:border-primary/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                onClick={() => navigate("/checklist")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ClipboardCheck className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-lg text-foreground">Vistoria Site</h2>
                    <p className="text-sm text-muted-foreground">
                      Checklist de inspeção de sites e gabinetes de telecomunicações
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Check Vandalismo */}
              <Card
                className="cursor-pointer border-2 border-transparent hover:border-destructive/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                onClick={() => navigate("/check-vandalismo")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <ShieldAlert className="h-7 w-7 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-lg text-foreground">Check Vandalismo</h2>
                    <p className="text-sm text-muted-foreground">
                      Vistoria de estações vandalizadas e registro de vulnerabilidades
                    </p>
                    {(isAdmin || isGestor) && (
                      <div className="mt-4 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs font-bold border-primary/30 text-primary hover:bg-primary/5"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/check-vandalismo/gestor");
                          }}
                        >
                          <LayoutDashboard className="h-3.5 w-3.5 mr-2" />
                          Painel Gestor
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>


              {/* Auditoria OS */}
              <Card
                className="cursor-pointer border-2 border-transparent hover:border-primary/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                onClick={() => navigate("/auditoria")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-accent/50 flex items-center justify-center">
                    <FileSearch className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-lg text-foreground">Auditoria OS</h2>
                    <p className="text-sm text-muted-foreground">
                      Auditoria de ordens de serviço
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Auditoria TA */}
              <Card
                className="cursor-pointer border-2 border-transparent hover:border-primary/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                onClick={() => navigate("/auditoria-ta")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Cable className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-lg text-foreground">Auditoria TA</h2>
                    <p className="text-sm text-muted-foreground">
                      Registro e auditoria de reparos de fibra óptica
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Painel de Monitoramento */}
              <Card
                className="cursor-pointer border-2 border-transparent hover:border-primary/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                onClick={() => navigate("/monitoramento")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Radar className="h-7 w-7 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-lg text-foreground">Painel de Monitoramento</h2>
                    <p className="text-sm text-muted-foreground">
                      Monitoramento da rede Norte — ERBs, backbone, riscos e indisponibilidades
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
