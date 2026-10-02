import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VivoLogo } from "@/components/ui/vivo-logo";

const BACKBONE_URL = "https://backbonenorte.lovable.app/";

export default function Backbone() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Backbone Norte | InfraSites Vivo</title>
        <meta
          name="description"
          content="Painel Backbone Norte — visualização integrada em tempo real."
        />
      </Helmet>

      <div className="h-screen flex flex-col bg-background">
        <header className="border-b bg-card px-3 h-9 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-sm font-semibold truncate">Backbone Norte</h1>
          </div>
          <VivoLogo className="h-5 w-auto" />
        </header>

        <main className="flex-1 min-h-0">
          <iframe
            src={BACKBONE_URL}
            title="Backbone Norte"
            className="w-full h-full border-0"
            allow="fullscreen; geolocation; clipboard-read; clipboard-write"
            referrerPolicy="no-referrer"
          />
        </main>
      </div>
    </>
  );
}
