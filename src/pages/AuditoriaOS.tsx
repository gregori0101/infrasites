import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileSearch } from "lucide-react";

export default function AuditoriaOS() {
  const navigate = useNavigate();

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
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              <FileSearch className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Em breve</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              O módulo de Auditoria de Ordens de Serviço está em desenvolvimento.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
