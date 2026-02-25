import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useFGAuth } from "@/fiber-guardian/hooks/useFGAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, FileText, Loader2 } from "lucide-react";
import { VivoLogo } from "@/components/ui/vivo-logo";

export default function AuditoriaTA() {
  const navigate = useNavigate();
  const { profile, isAdmin, isTecnico, loading } = useFGAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Auditoria TA | InfraSites Vivo</title>
        <meta name="description" content="Módulo de auditoria de TAs - registro e acompanhamento de reparos de fibra óptica." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b bg-card px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Auditoria TA</h1>
              <p className="text-xs text-muted-foreground">Fiber Guardian</p>
            </div>
          </div>
          <VivoLogo className="h-7 w-auto" />
        </header>

        {/* Content */}
        <main className="flex-1 p-4 space-y-4">
          {/* Welcome */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Olá, <span className="font-semibold text-foreground">{profile?.nome || 'Técnico'}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isAdmin ? 'Visão Administrativa' : 'Visão Técnico'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-3">
            <Card
              className="cursor-pointer border-2 border-transparent hover:border-primary/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
              onClick={() => navigate("/auditoria-ta/novo-registro")}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-foreground">Novo Registro</h2>
                  <p className="text-sm text-muted-foreground">Registrar novo reparo de fibra</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer border-2 border-transparent hover:border-primary/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
              onClick={() => navigate("/auditoria-ta/meus-reparos")}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-accent/50 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-foreground">Meus Reparos</h2>
                  <p className="text-sm text-muted-foreground">Ver registros e acompanhar status</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info */}
          <div className="text-center pt-8">
            <p className="text-xs text-muted-foreground">
              Módulo em integração — mais funcionalidades serão adicionadas em breve.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
