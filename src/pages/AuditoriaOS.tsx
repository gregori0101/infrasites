import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuditoriaGestorView from "@/components/auditoria/AuditoriaGestorView";
import AuditoriaTechnicianView from "@/components/auditoria/AuditoriaTechnicianView";

export default function AuditoriaOS() {
  const navigate = useNavigate();
  const { isGestor, isTecnico } = useAuth();

  return (
    <>
      <Helmet>
        <title>Auditoria OS | InfraSites Vivo</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-foreground">Auditoria OS</h1>
          <div className="flex-1" />
          {isGestor && (
            <Button variant="outline" size="icon" onClick={() => navigate("/auditoria/dashboard")} title="Dashboard">
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          )}
        </header>

        <main className="flex-1 p-4 max-w-3xl mx-auto w-full">
          {isGestor ? <AuditoriaGestorView /> : isTecnico ? <AuditoriaTechnicianView /> : (
            <p className="text-center text-muted-foreground py-12">Sem permissão para acessar este módulo.</p>
          )}
        </main>
      </div>
    </>
  );
}
