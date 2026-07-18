import React, { useState, useEffect } from "react";
import { Battery, Calendar, Factory, Gauge, Info, MapPin, Shield, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbox } from "@/components/ui/lightbox";
import { BatteryInfo } from "./types";
import { fetchBatteryPhoto } from "@/lib/reportDatabase";

interface Props {
  open: boolean;
  onClose: () => void;
  battery: BatteryInfo | null;
}

export function BatteryDetailModal({ open, onClose, battery }: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (open && battery?.reportId) {
      setPhotoLoading(true);
      setPhotoUrl(null);
      fetchBatteryPhoto(battery.reportId, battery.gabinete)
        .then((url) => {
          setPhotoUrl(url);
        })
        .finally(() => {
          setPhotoLoading(false);
        });
    }
  }, [open, battery?.reportId, battery?.gabinete]);

  if (!battery) return null;

  const getEstadoBadge = (estado: string) => {
    const lower = estado.toLowerCase();
    if (lower === "boa" || lower === "ok") {
      return <Badge className="bg-success text-success-foreground">OK</Badge>;
    }
    if (lower.includes("estufada") || lower.includes("vazando") || lower.includes("trincada")) {
      return <Badge className="bg-destructive text-destructive-foreground">{estado}</Badge>;
    }
    if (lower.includes("carga")) {
      return <Badge className="bg-warning text-warning-foreground">{estado}</Badge>;
    }
    return <Badge variant="secondary">{estado}</Badge>;
  };

  const getObsolescenciaTipoBadge = (obs: "ok" | "medio" | "alto") => {
    if (obs === "ok") return <Badge className="bg-success text-success-foreground">OK</Badge>;
    if (obs === "medio") return <Badge className="bg-warning text-warning-foreground">Médio</Badge>;
    return <Badge className="bg-destructive text-destructive-foreground">Alto</Badge>;
  };

  const getAutonomyRiskBadge = (risk: "ok" | "medio" | "alto" | "critico") => {
    if (risk === "ok") return <Badge className="bg-success text-success-foreground">OK</Badge>;
    if (risk === "medio") return <Badge className="bg-warning text-warning-foreground">Médio</Badge>;
    if (risk === "alto") return <Badge className="bg-orange-500 text-white">Alto</Badge>;
    return <Badge className="bg-destructive text-destructive-foreground">Crítico</Badge>;
  };

  const getBoolBadge = (value: string) => {
    const lower = value.toLowerCase();
    if (lower === "sim" || lower === "yes") {
      return <Badge className="bg-success text-success-foreground">Sim</Badge>;
    }
    if (lower === "não" || lower === "nao" || lower === "no") {
      return <Badge className="bg-destructive text-destructive-foreground">Não</Badge>;
    }
    return <Badge variant="outline">{value || "N/A"}</Badge>;
  };

  const getTipoBadge = (tipo: "chumbo" | "litio" | "outro") => {
    if (tipo === "chumbo") return <Badge variant="outline" className="border-orange-500 text-orange-600">Chumbo</Badge>;
    if (tipo === "litio") return <Badge variant="outline" className="border-blue-500 text-blue-600">Lítio</Badge>;
    return <Badge variant="outline">Outro</Badge>;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Battery className="w-5 h-5" />
              <span>Bateria - {battery.siteCode} - G{battery.gabinete} Banco {battery.banco}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Photo Section */}
          <div className="w-full">
            {photoLoading ? (
              <Skeleton className="w-full h-48 rounded-md" />
            ) : photoUrl ? (
              <div 
                className="relative cursor-pointer group"
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={photoUrl}
                  alt={`Foto do gabinete ${battery.gabinete}`}
                  className="w-full h-48 object-cover rounded-md transition-opacity group-hover:opacity-90"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                  <span className="text-white text-sm font-medium">Clique para ampliar</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-sm">
                Foto não disponível
              </div>
            )}
          </div>

          <Separator />

          {/* Identification */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Identificação
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Site:</span>
                <span className="ml-2 font-medium">{battery.siteCode}</span>
              </div>
              <div>
                <span className="text-muted-foreground">UF:</span>
                <span className="ml-2 font-medium">{battery.uf}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Gabinete:</span>
                <span className="ml-2 font-medium">G{battery.gabinete}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Banco:</span>
                <span className="ml-2 font-medium">{battery.banco}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Technical Specs */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Especificações Técnicas
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Tipo:</span>
                {getTipoBadge(battery.tipoClassificado)}
              </div>
              <div>
                <span className="text-muted-foreground">Fabricante:</span>
                <span className="ml-2 font-medium">{battery.fabricante}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Capacidade:</span>
                <span className="ml-2 font-medium">{battery.capacidade}Ah</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Fabricação:</span>
                <span className="ml-1 font-medium">{battery.dataFabricacao}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Idade:</span>
                <span className="ml-2 font-medium">{battery.idade > 0 ? `${battery.idade} anos` : "N/A"}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 flex-wrap">
                <span className="text-muted-foreground">Tipo (IA):</span>
                {battery.tipoIA ? (
                  <>
                    <Badge variant="outline" className="border-primary text-primary">{battery.tipoIA}</Badge>
                    {typeof battery.confiancaIA === "number" && (
                      <Badge
                        className={
                          battery.confiancaIA >= 0.8
                            ? "bg-success text-success-foreground"
                            : battery.confiancaIA >= 0.5
                            ? "bg-warning text-warning-foreground"
                            : "bg-destructive text-destructive-foreground"
                        }
                      >
                        {Math.round(battery.confiancaIA * 100)}%
                      </Badge>
                    )}
                  </>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">Não analisado</Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Info className="w-4 h-4" />
              Status
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Estado:</span>
                {getEstadoBadge(battery.estado)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Obsolescência:</span>
                {getObsolescenciaTipoBadge(battery.obsolescenciaTipo)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Autonomia:</span>
                {getAutonomyRiskBadge(battery.autonomyRisk)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Requer Troca:</span>
                {battery.needsReplacement ? (
                  <Badge className="bg-destructive text-destructive-foreground">Sim</Badge>
                ) : (
                  <Badge variant="outline">Não</Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Protection Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Proteção
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Colada:</span>
                {getBoolBadge(battery.colada)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Com Gradil:</span>
                {getBoolBadge(battery.comGradil)}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox for photo */}
      {photoUrl && (
        <Lightbox
          images={[{ url: photoUrl, label: `Bateria - ${battery.siteCode} G${battery.gabinete}` }]}
          initialIndex={0}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
