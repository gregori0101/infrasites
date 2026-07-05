import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VivoLogo } from "@/components/ui/vivo-logo";

const MONITORING_URL = "https://mildly-nonusable-sanjuanita.ngrok-free.dev/";
const REFRESH_INTERVAL_MS = 60_000;

export default function PainelMonitoramento() {
  const navigate = useNavigate();

  // Two iframes: one visible, one preloading. Swap after preload finishes so
  // the user never sees a blank/loading state.
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [srcs, setSrcs] = useState<[string, string]>([MONITORING_URL, ""]);
  const pendingSlotRef = useRef<0 | 1 | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const nextSlot: 0 | 1 = activeSlot === 0 ? 1 : 0;
      pendingSlotRef.current = nextSlot;
      // Cache-bust so intermediate proxies/browsers actually re-fetch.
      const url = `${MONITORING_URL}${MONITORING_URL.includes("?") ? "&" : "?"}_r=${Date.now()}`;
      setSrcs((prev) => {
        const copy: [string, string] = [prev[0], prev[1]];
        copy[nextSlot] = url;
        return copy;
      });
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [activeSlot]);

  const handleLoad = (slot: 0 | 1) => {
    if (pendingSlotRef.current === slot) {
      pendingSlotRef.current = null;
      setActiveSlot(slot);
    }
  };

  return (
    <>
      <Helmet>
        <title>Painel de Monitoramento | InfraSites Vivo</title>
        <meta
          name="description"
          content="Painel de monitoramento da rede Norte — visualização integrada em tempo real."
        />
      </Helmet>

      <div className="h-screen flex flex-col bg-background">
        <header className="border-b bg-card px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-semibold truncate">Painel de Monitoramento</h1>
          </div>
          <VivoLogo className="h-7 w-auto" />
        </header>

        <main className="flex-1 min-h-0 relative">
          {[0, 1].map((i) => {
            const slot = i as 0 | 1;
            const isActive = activeSlot === slot;
            const src = srcs[slot];
            if (!src) return null;
            return (
              <iframe
                key={slot}
                src={src}
                title="Painel de Monitoramento"
                onLoad={() => handleLoad(slot)}
                className="absolute inset-0 w-full h-full border-0"
                style={{
                  opacity: isActive ? 1 : 0,
                  pointerEvents: isActive ? "auto" : "none",
                  zIndex: isActive ? 1 : 0,
                }}
                allow="fullscreen; geolocation; clipboard-read; clipboard-write"
                referrerPolicy="no-referrer"
              />
            );
          })}
        </main>
      </div>
    </>
  );
}
