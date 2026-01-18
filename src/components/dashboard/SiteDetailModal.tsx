import React, { useState, useEffect, createContext, useContext } from "react";
import { X, Download, Loader2, Building2, Battery, Thermometer, Zap, Radio, User, Calendar, MapPin, Image as ImageIcon, AlertTriangle, CheckCircle, Cable, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbox } from "@/components/ui/lightbox";
import { fetchFullReportById, ReportRow } from "@/lib/reportDatabase";
import { reportToChecklist } from "@/lib/reportToChecklist";
import { generatePDF, downloadPDF } from "@/lib/generatePDF";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  reportId: string | null;
}

interface PhotoViewerProps {
  url: string | null | undefined;
  label: string;
  compact?: boolean;
  onClick?: () => void;
}

// Context for lightbox
interface LightboxContextType {
  openLightbox: (images: { url: string; label: string }[], index: number) => void;
}

const LightboxContext = createContext<LightboxContextType | null>(null);

function PhotoViewer({ url, label, compact = false, onClick }: PhotoViewerProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const lightboxContext = useContext(LightboxContext);
  
  if (!url || error) {
    return (
      <div className={cn(
        "bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground",
        compact ? "aspect-square p-2" : "aspect-video"
      )}>
        <ImageIcon className={cn("mb-1", compact ? "w-5 h-5" : "w-8 h-8 mb-2")} />
        <span className={cn(compact ? "text-[10px]" : "text-xs")}>{label}</span>
        <span className={cn(compact ? "text-[10px]" : "text-xs")}>Sem foto</span>
      </div>
    );
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (lightboxContext) {
      lightboxContext.openLightbox([{ url, label }], 0);
    }
  };

  return (
    <div 
      className={cn(
        "relative bg-muted rounded-lg overflow-hidden cursor-pointer group",
        compact ? "aspect-square" : "aspect-video"
      )}
      onClick={handleClick}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <img
        src={url}
        alt={label}
        className={cn(
          "w-full h-full object-cover transition-all",
          loading ? "opacity-0" : "opacity-100",
          "group-hover:scale-105"
        )}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
      />
      <div className={cn(
        "absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"
      )}>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-2">
          <ImageIcon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-black/60 text-white px-2",
        compact ? "text-[10px] py-0.5" : "text-xs py-1"
      )}>
        {label}
      </div>
    </div>
  );
}

function StatusBadge({ status, label }: { status: string | null; label?: string }) {
  if (!status) return <Badge variant="outline">N/A</Badge>;
  
  const lower = status.toLowerCase();
  if (lower === "ok" || lower === "sim" || lower === "boa") {
    return <Badge className="bg-success text-success-foreground">{label || status}</Badge>;
  }
  if (lower === "nok" || lower === "não" || lower.includes("estufada") || lower.includes("vazando") || lower.includes("trincada")) {
    return <Badge className="bg-destructive text-destructive-foreground">{label || status}</Badge>;
  }
  return <Badge variant="secondary">{label || status}</Badge>;
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: React.ComponentType<any> }) {
  return (
    <div className="flex items-start gap-2 py-1">
      {Icon && <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
      <span className="text-sm text-muted-foreground shrink-0">{label}:</span>
      <span className="text-sm font-medium">{value || "N/A"}</span>
    </div>
  );
}

// Inline photo grid for sections with lightbox support
function PhotoGrid({ photos, allPhotos }: { 
  photos: { url: string | null | undefined; label: string }[];
  allPhotos?: { url: string; label: string }[];
}) {
  const validPhotos = photos.filter(p => p.url) as { url: string; label: string }[];
  const lightboxContext = useContext(LightboxContext);
  
  if (validPhotos.length === 0) return null;
  
  const handlePhotoClick = (photoUrl: string) => {
    if (!lightboxContext) return;
    
    // Use allPhotos if provided, otherwise just the section photos
    const imagesToShow = allPhotos || validPhotos;
    const index = imagesToShow.findIndex(p => p.url === photoUrl);
    lightboxContext.openLightbox(imagesToShow, index >= 0 ? index : 0);
  };
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
      {photos.map((photo, idx) => (
        <PhotoViewer 
          key={idx} 
          url={photo.url} 
          label={photo.label} 
          compact 
          onClick={photo.url ? () => handlePhotoClick(photo.url!) : undefined}
        />
      ))}
    </div>
  );
}

export function SiteDetailModal({ open, onClose, reportId }: Props) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportRow | null>(null);
  const [activeTab, setActiveTab] = useState("geral");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ url: string; label: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const openLightbox = (images: { url: string; label: string }[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleDownloadPDF = async () => {
    if (!report) return;
    
    setIsGeneratingPDF(true);
    try {
      const checklistData = reportToChecklist(report);
      const pdfBlob = await generatePDF(checklistData);
      const filename = `Checklist_${report.site_code}_${report.state_uf}_${report.created_date?.replace(/\//g, '') || ''}.pdf`;
      downloadPDF(pdfBlob, filename);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    if (open && reportId) {
      loadReport(reportId);
    }
  }, [open, reportId]);

  const loadReport = async (id: string) => {
    setLoading(true);
    try {
      const data = await fetchFullReportById(id);
      setReport(data);
    } catch (err) {
      console.error("Error loading report:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalCabinets = report?.total_cabinets || 1;

  // Collect all photos for gallery tab
  const allPhotos: { url: string; label: string; category: string }[] = [];
  if (report?.panoramic_photo_url) {
    allPhotos.push({ url: report.panoramic_photo_url, label: "Panorâmica", category: "Geral" });
  }
  if (report?.observacao_foto_url) {
    allPhotos.push({ url: report.observacao_foto_url, label: "Observação", category: "Geral" });
  }
  // Energy photos
  if (report?.energia_foto_quadro_geral) {
    allPhotos.push({ url: report.energia_foto_quadro_geral, label: "Quadro Geral", category: "Energia" });
  }
  if (report?.energia_foto_transformador) {
    allPhotos.push({ url: report.energia_foto_transformador, label: "Transformador", category: "Energia" });
  }
  if (report?.energia_foto_placa) {
    allPhotos.push({ url: report.energia_foto_placa, label: "Placa", category: "Energia" });
  }
  if (report?.energia_foto_cabos) {
    allPhotos.push({ url: report.energia_foto_cabos, label: "Cabos", category: "Energia" });
  }
  // Torre photos
  if (report?.torre_foto_ninhos) {
    allPhotos.push({ url: report.torre_foto_ninhos, label: "Ninhos", category: "Torre" });
  }
  // Gabinete photos
  for (let g = 1; g <= 7; g++) {
    const panoramica = report?.[`gab${g}_foto_panoramica`];
    const transmissao = report?.[`gab${g}_foto_transmissao`];
    const acesso = report?.[`gab${g}_foto_acesso`];
    const fccPan = report?.[`gab${g}_fcc_foto_panoramica`];
    const fccPainel = report?.[`gab${g}_fcc_foto_painel`];
    const batFoto = report?.[`gab${g}_bat_foto`];
    
    if (panoramica) allPhotos.push({ url: panoramica, label: "Panorâmica", category: `Gab ${g}` });
    if (transmissao) allPhotos.push({ url: transmissao, label: "Transmissão", category: `Gab ${g}` });
    if (acesso) allPhotos.push({ url: acesso, label: "Acesso", category: `Gab ${g}` });
    if (fccPan) allPhotos.push({ url: fccPan, label: "FCC Panorâmica", category: `Gab ${g}` });
    if (fccPainel) allPhotos.push({ url: fccPainel, label: "FCC Painel", category: `Gab ${g}` });
    if (batFoto) allPhotos.push({ url: batFoto, label: "Baterias", category: `Gab ${g}` });
    
    // AC photos
    for (let a = 1; a <= 4; a++) {
      const acFoto = report?.[`gab${g}_clima_foto_ar${a}`];
      if (acFoto) allPhotos.push({ url: acFoto, label: `AC ${a}`, category: `Gab ${g}` });
    }
    const condensador = report?.[`gab${g}_clima_foto_condensador`];
    const evaporador = report?.[`gab${g}_clima_foto_evaporador`];
    const controlador = report?.[`gab${g}_clima_foto_controlador`];
    if (condensador) allPhotos.push({ url: condensador, label: "Condensador", category: `Gab ${g}` });
    if (evaporador) allPhotos.push({ url: evaporador, label: "Evaporador", category: `Gab ${g}` });
    if (controlador) allPhotos.push({ url: controlador, label: "Controlador", category: `Gab ${g}` });
  }

  // Calculate statistics and critical issues
  const calcStats = () => {
    let batteriesOk = 0, batteriesNok = 0, acsOk = 0, acsNok = 0;
    let oldBatteries: { gabinete: number; banco: number; dataFab: string; idade: number }[] = [];
    let defectiveAcs: { gabinete: number; ac: number; modelo: string; status: string }[] = [];
    const currentYear = new Date().getFullYear();
    
    for (let g = 1; g <= totalCabinets; g++) {
      for (let b = 1; b <= 6; b++) {
        const estado = report?.[`gab${g}_bat${b}_estado`];
        const dataFab = report?.[`gab${g}_bat${b}_data_fabricacao`];
        
        if (estado) {
          if (estado.toLowerCase() === "boa") batteriesOk++;
          else batteriesNok++;
        }
        
        // Check for old batteries (>5 years)
        if (dataFab) {
          const year = parseInt(dataFab.split("/").pop() || "0");
          if (year > 0) {
            const idade = currentYear - year;
            if (idade > 5) {
              oldBatteries.push({ gabinete: g, banco: b, dataFab, idade });
            }
          }
        }
      }
      for (let a = 1; a <= 4; a++) {
        const status = report?.[`gab${g}_ac${a}_status`];
        const modelo = report?.[`gab${g}_ac${a}_modelo`];
        if (status) {
          if (status.toLowerCase() === "ok") acsOk++;
          else {
            acsNok++;
            defectiveAcs.push({ gabinete: g, ac: a, modelo: modelo || "N/A", status });
          }
        }
      }
    }

    return { batteriesOk, batteriesNok, acsOk, acsNok, oldBatteries, defectiveAcs };
  };

  const statistics = report ? calcStats() : null;
  const hasCriticalIssues = statistics && (
    statistics.oldBatteries.length > 0 || 
    statistics.defectiveAcs.length > 0 ||
    statistics.batteriesNok > 0
  );

  // Flatten allPhotos for lightbox (remove category)
  const lightboxPhotosFlat = allPhotos.map(p => ({ url: p.url, label: `${p.category} - ${p.label}` }));

  return (
    <LightboxContext.Provider value={{ openLightbox }}>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : report ? (
            <>
              {/* Header */}
            <DialogHeader className="px-6 py-4 border-b shrink-0 bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-white">
                      {report.site_code}
                    </DialogTitle>
                    <p className="text-white/70 text-sm">
                      {report.state_uf} • {report.created_date} às {report.created_time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasCriticalIssues && (
                    <Badge className="bg-red-500/90 text-white animate-pulse gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Alertas Críticos
                    </Badge>
                  )}
                  {!hasCriticalIssues && (
                    <Badge className="bg-green-500/90 text-white gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Site OK
                    </Badge>
                  )}
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-1" />
                    )}
                    PDF
                  </Button>
                </div>
              </div>
              
              {/* Critical Issues Indicators */}
              {hasCriticalIssues && (
                <div className="mt-3 space-y-2">
                  {statistics?.oldBatteries && statistics.oldBatteries.length > 0 && (
                    <div className="flex items-start gap-2 bg-amber-500/20 rounded-lg px-3 py-2">
                      <Battery className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <span className="font-semibold text-amber-200">
                          {statistics.oldBatteries.length} bateria(s) com mais de 5 anos:
                        </span>
                        <span className="text-white/80 ml-1">
                          {statistics.oldBatteries.slice(0, 3).map(b => 
                            `Gab${b.gabinete}/B${b.banco} (${b.idade} anos)`
                          ).join(", ")}
                          {statistics.oldBatteries.length > 3 && ` +${statistics.oldBatteries.length - 3} mais`}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {statistics?.defectiveAcs && statistics.defectiveAcs.length > 0 && (
                    <div className="flex items-start gap-2 bg-red-500/20 rounded-lg px-3 py-2">
                      <Thermometer className="w-4 h-4 text-red-300 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <span className="font-semibold text-red-200">
                          {statistics.defectiveAcs.length} AC(s) com defeito:
                        </span>
                        <span className="text-white/80 ml-1">
                          {statistics.defectiveAcs.slice(0, 3).map(ac => 
                            `Gab${ac.gabinete}/AC${ac.ac} (${ac.status})`
                          ).join(", ")}
                          {statistics.defectiveAcs.length > 3 && ` +${statistics.defectiveAcs.length - 3} mais`}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {statistics?.batteriesNok && statistics.batteriesNok > 0 && (
                    <div className="flex items-start gap-2 bg-red-500/20 rounded-lg px-3 py-2">
                      <AlertTriangle className="w-4 h-4 text-red-300 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <span className="font-semibold text-red-200">
                          {statistics.batteriesNok} bateria(s) em estado ruim
                        </span>
                        <span className="text-white/80 ml-1">
                          (estufada, vazando, trincada, etc.)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogHeader>

            {/* Scrollable content area */}
            <ScrollArea className="flex-1">
              {/* Summary Cards */}
              <div className="px-6 py-3 border-b bg-muted/30">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{report.technician_name || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{totalCabinets} Gabinete(s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Battery className="w-4 h-4 text-success" />
                    <span className="font-medium">{statistics?.batteriesOk || 0} OK</span>
                    {statistics && statistics.batteriesNok > 0 && (
                      <Badge className="bg-destructive text-destructive-foreground text-xs">{statistics.batteriesNok} NOK</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Thermometer className="w-4 h-4 text-primary" />
                    <span className="font-medium">{statistics?.acsOk || 0} OK</span>
                    {statistics && statistics.acsNok > 0 && (
                      <Badge className="bg-destructive text-destructive-foreground text-xs">{statistics.acsNok} NOK</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-warning" />
                    <StatusBadge status={report.gmg_existe} label={report.gmg_existe === "SIM" ? "Com GMG" : "Sem GMG"} />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{allPhotos.length} Foto(s)</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
              <TabsList className="mx-6 mt-3 shrink-0 flex flex-wrap h-auto gap-1">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                {Array.from({ length: totalCabinets }, (_, i) => (
                  <TabsTrigger key={i + 1} value={`gab${i + 1}`}>
                    Gab {i + 1}
                  </TabsTrigger>
                ))}
                <TabsTrigger value="energia">Energia</TabsTrigger>
                <TabsTrigger value="fibra">Fibra</TabsTrigger>
                <TabsTrigger value="gmg">GMG/Torre</TabsTrigger>
                <TabsTrigger value="galeria">Galeria ({allPhotos.length})</TabsTrigger>
              </TabsList>

              <div className="px-6 py-4">
                {/* Tab: Geral */}
                <TabsContent value="geral" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Informações do Site
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                      <InfoRow label="Site" value={report.site_code} icon={Radio} />
                      <InfoRow label="UF" value={report.state_uf} icon={MapPin} />
                      <InfoRow label="Técnico" value={report.technician_name} icon={User} />
                      <InfoRow label="Data" value={`${report.created_date} ${report.created_time}`} icon={Calendar} />
                      <InfoRow label="Gabinetes" value={totalCabinets.toString()} icon={Building2} />
                      <InfoRow label="Observações" value={report.observacoes} />
                    </CardContent>
                  </Card>

                  {report.panoramic_photo_url && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Foto Panorâmica</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PhotoViewer url={report.panoramic_photo_url} label="Panorâmica" />
                      </CardContent>
                    </Card>
                  )}

                  {report.observacao_foto_url && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Foto Observação</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PhotoViewer url={report.observacao_foto_url} label="Observação" />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Tab: Gabinetes */}
                {Array.from({ length: totalCabinets }, (_, i) => {
                  const g = i + 1;
                  const prefix = `gab${g}`;
                  
                  // Collect gabinete photos
                  const gabFotos = [
                    { url: report[`${prefix}_foto_panoramica`], label: "Panorâmica" },
                    { url: report[`${prefix}_foto_transmissao`], label: "Transmissão" },
                    { url: report[`${prefix}_foto_acesso`], label: "Acesso" },
                  ];
                  
                  const fccFotos = [
                    { url: report[`${prefix}_fcc_foto_panoramica`], label: "FCC Panorâmica" },
                    { url: report[`${prefix}_fcc_foto_painel`], label: "FCC Painel" },
                  ];
                  
                  const batFotos = [
                    { url: report[`${prefix}_bat_foto`], label: "Bancos de Bateria" },
                  ];
                  
                  const climaFotos = [
                    { url: report[`${prefix}_clima_foto_ar1`], label: "AC 1" },
                    { url: report[`${prefix}_clima_foto_ar2`], label: "AC 2" },
                    { url: report[`${prefix}_clima_foto_ar3`], label: "AC 3" },
                    { url: report[`${prefix}_clima_foto_ar4`], label: "AC 4" },
                    { url: report[`${prefix}_clima_foto_condensador`], label: "Condensador" },
                    { url: report[`${prefix}_clima_foto_evaporador`], label: "Evaporador" },
                    { url: report[`${prefix}_clima_foto_controlador`], label: "Controlador" },
                  ];
                  
                  return (
                    <TabsContent key={g} value={prefix} className="mt-0 space-y-4">
                      {/* Tipo e Tecnologias */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Gabinete {g} - Informações
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <InfoRow label="Tipo" value={report[`${prefix}_tipo`]} />
                            <InfoRow label="Proteção" value={report[`${prefix}_protecao`]} />
                            <InfoRow label="Tecnologias Acesso" value={report[`${prefix}_tecnologias_acesso`]} icon={Radio} />
                            <InfoRow label="Tecnologias Transporte" value={report[`${prefix}_tecnologias_transporte`]} />
                          </div>
                          <PhotoGrid photos={gabFotos} />
                        </CardContent>
                      </Card>

                      {/* FCC */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            FCC
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                            <InfoRow label="Fabricante" value={report[`${prefix}_fcc_fabricante`]} />
                            <InfoRow label="Tensão DC" value={report[`${prefix}_fcc_tensao`]} />
                            <InfoRow label="Gerenciada" value={report[`${prefix}_fcc_gerenciado`]} />
                            <InfoRow label="Gerenciável" value={report[`${prefix}_fcc_gerenciavel`]} />
                            <InfoRow label="Consumo DC" value={report[`${prefix}_fcc_consumo`]} />
                            <InfoRow label="Qtd UR" value={report[`${prefix}_fcc_qtd_ur`]} />
                          </div>
                          <PhotoGrid photos={fccFotos} />
                        </CardContent>
                      </Card>

                      {/* Baterias */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Battery className="w-4 h-4" />
                            Baterias
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }, (_, j) => {
                              const b = j + 1;
                              const tipo = report[`${prefix}_bat${b}_tipo`];
                              const fabricante = report[`${prefix}_bat${b}_fabricante`];
                              const capacidade = report[`${prefix}_bat${b}_capacidade`];
                              const dataFab = report[`${prefix}_bat${b}_data_fabricacao`];
                              const estado = report[`${prefix}_bat${b}_estado`];

                              if (!tipo && !fabricante && !estado) return null;

                              return (
                                <div key={b} className="p-3 border rounded-lg bg-muted/30">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">Banco {b}</span>
                                    <StatusBadge status={estado} />
                                  </div>
                                  <div className="text-xs text-muted-foreground space-y-0.5">
                                    <p>Tipo: {tipo || "N/A"}</p>
                                    <p>Fabricante: {fabricante || "N/A"}</p>
                                    <p>Capacidade: {capacidade ? `${capacidade}Ah` : "N/A"}</p>
                                    <p>Fabricação: {dataFab || "N/A"}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-3">
                            <InfoRow label="Bancos Interligados" value={report[`${prefix}_bancos_interligados`]} />
                          </div>
                          <PhotoGrid photos={batFotos} />
                        </CardContent>
                      </Card>

                      {/* Climatização */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Thermometer className="w-4 h-4" />
                            Climatização
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 mb-4">
                            <InfoRow label="Tipo" value={report[`${prefix}_climatizacao_tipo`]} />
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Ventiladores:</span>
                              <StatusBadge status={report[`${prefix}_ventiladores_status`]} />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">PLC:</span>
                              <StatusBadge status={report[`${prefix}_plc_status`]} />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Alarme:</span>
                              <StatusBadge status={report[`${prefix}_alarme_status`]} />
                            </div>
                          </div>

                          <Separator className="my-3" />
                          <p className="text-sm font-medium mb-2">Ar Condicionados</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Array.from({ length: 4 }, (_, j) => {
                              const a = j + 1;
                              const modelo = report[`${prefix}_ac${a}_modelo`];
                              const status = report[`${prefix}_ac${a}_status`];

                              if (!modelo && !status) return null;

                              return (
                                <div key={a} className="p-2 border rounded bg-muted/30 text-center">
                                  <p className="text-xs font-medium mb-1">AC {a}</p>
                                  <p className="text-xs text-muted-foreground mb-1">{modelo || "N/A"}</p>
                                  <StatusBadge status={status} />
                                </div>
                              );
                            })}
                          </div>
                          <PhotoGrid photos={climaFotos} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  );
                })}

                {/* Tab: Energia */}
                <TabsContent value="energia" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Plug className="w-4 h-4" />
                        Quadro de Energia
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                        <InfoRow label="Tipo" value={report.energia_tipo} />
                        <InfoRow label="Fabricante" value={report.energia_fabricante} />
                        <InfoRow label="Potência (kVA)" value={report.energia_potencia} />
                        <InfoRow label="Tensão" value={report.energia_tensao} />
                        <InfoRow label="Tipo Disjuntor" value={report.energia_tipo_disjuntor} />
                        <InfoRow label="Corrente Disjuntor" value={report.energia_corrente_disjuntor} />
                      </div>
                      
                      {/* Energy Photos */}
                      <PhotoGrid photos={[
                        { url: report.energia_foto_quadro_geral, label: "Quadro Geral" },
                        { url: report.energia_foto_transformador, label: "Transformador" },
                        { url: report.energia_foto_placa, label: "Placa" },
                        { url: report.energia_foto_cabos, label: "Cabos" },
                      ]} />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Proteções
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">DPS:</span>
                          <StatusBadge status={report.energia_dps_status} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Aterramento:</span>
                          <StatusBadge status={report.energia_aterramento_status} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Cabos:</span>
                          <StatusBadge status={report.energia_cabos_status} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Nobreak:</span>
                          <StatusBadge status={report.energia_nobreak_status} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Fibra */}
                <TabsContent value="fibra" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Cable className="w-4 h-4" />
                        Fibra Óptica
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                        <InfoRow label="Qtd Abordagens" value={report.fibra_qtd_abordagens?.toString()} />
                        <InfoRow label="Caixas de Passagem" value={report.fibra_caixas_passagem_qtd?.toString()} />
                        <InfoRow label="Caixas Subterrâneas" value={report.fibra_caixas_subterraneas_qtd?.toString()} />
                        <InfoRow label="Subidas Laterais" value={report.fibra_subidas_laterais_qtd?.toString()} />
                        <InfoRow label="Total DGOs" value={report.fibra_dgos_qtd?.toString()} />
                        <div className="flex items-center gap-2 py-1">
                          <span className="text-sm text-muted-foreground">DGOs OK:</span>
                          <Badge className="bg-success text-success-foreground">{report.fibra_dgos_ok_qtd || 0}</Badge>
                          <span className="text-sm text-muted-foreground">NOK:</span>
                          <Badge className="bg-destructive text-destructive-foreground">{report.fibra_dgos_nok_qtd || 0}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Abordagem 1 */}
                  {report.fibra_abord1_tipo && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Abordagem 1</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                          <InfoRow label="Tipo" value={report.fibra_abord1_tipo} />
                          <InfoRow label="Descrição" value={report.fibra_abord1_descricao} />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Abordagem 2 */}
                  {report.fibra_abord2_tipo && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Abordagem 2</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                          <InfoRow label="Tipo" value={report.fibra_abord2_tipo} />
                          <InfoRow label="Descrição" value={report.fibra_abord2_descricao} />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Tab: GMG/Torre */}
                <TabsContent value="gmg" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Grupo Motor Gerador (GMG)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                      <div className="flex items-center gap-2 py-1">
                        <span className="text-sm text-muted-foreground">Possui GMG:</span>
                        <StatusBadge status={report.gmg_existe} />
                      </div>
                      <InfoRow label="Fabricante" value={report.gmg_fabricante} />
                      <InfoRow label="Potência" value={report.gmg_potencia} />
                      <InfoRow label="Combustível" value={report.gmg_combustivel} />
                      <InfoRow label="Último Teste" value={report.gmg_ultimo_teste} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Radio className="w-4 h-4" />
                        Torre e Infraestrutura
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <div className="flex items-center gap-2 py-1">
                          <span className="text-sm text-muted-foreground">Ninhos:</span>
                          <StatusBadge status={report.torre_ninhos} />
                        </div>
                        <div className="flex items-center gap-2 py-1">
                          <span className="text-sm text-muted-foreground">Fibra Protegida:</span>
                          <StatusBadge status={report.torre_protecao_fibra} />
                        </div>
                        <InfoRow label="Aterramento" value={report.torre_aterramento} />
                        <InfoRow label="Zeladoria" value={report.torre_housekeeping} />
                      </div>
                      
                      {/* Foto de ninhos */}
                      {report.torre_ninhos === "SIM" && report.torre_foto_ninhos && (
                        <div className="mt-4">
                          <PhotoViewer url={report.torre_foto_ninhos} label="Foto dos Ninhos" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Galeria (todas as fotos) */}
                <TabsContent value="galeria" className="mt-0">
                  {allPhotos.length > 0 ? (
                    <div className="space-y-6">
                      {/* Group photos by category */}
                      {Object.entries(
                        allPhotos.reduce((acc, photo) => {
                          if (!acc[photo.category]) acc[photo.category] = [];
                          acc[photo.category].push(photo);
                          return acc;
                        }, {} as Record<string, typeof allPhotos>)
                      ).map(([category, photos]) => (
                        <div key={category}>
                          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">{category}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {photos.map((photo, idx) => {
                              // Find index in full list for lightbox navigation
                              const fullIndex = lightboxPhotosFlat.findIndex(p => p.url === photo.url);
                              return (
                                <PhotoViewer 
                                  key={idx} 
                                  url={photo.url} 
                                  label={photo.label} 
                                  compact 
                                  onClick={() => openLightbox(lightboxPhotosFlat, fullIndex >= 0 ? fullIndex : 0)}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma foto disponível</p>
                    </div>
                  )}
                </TabsContent>
              </div>
              </Tabs>
            </ScrollArea>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Relatório não encontrado</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </LightboxContext.Provider>
  );
}
