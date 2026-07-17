import React, { useState, useEffect, createContext, useContext } from "react";
import { X, Download, Loader2, Building2, Battery, Thermometer, Zap, Radio, User, Calendar, MapPin, Image as ImageIcon, AlertTriangle, CheckCircle, Cable, Plug, FileEdit, Globe, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbox } from "@/components/ui/lightbox";
import { SignedImage } from "@/components/ui/signed-image";
import { fetchFullReportById, ReportRow, updateReportField } from "@/lib/reportDatabase";
import { reportToChecklist } from "@/lib/reportToChecklist";
import { generatePDF, downloadPDF } from "@/lib/generatePDF";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useChecklist } from "@/contexts/ChecklistContext";
import { useNavigate } from "react-router-dom";

// Helper to parse JSON photo arrays stored in database
function parsePhotoJson(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    // Try to parse as JSON array
    if (value.startsWith('[')) {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((p): p is string => typeof p === 'string' && p.length > 0);
      }
    }
    // Fallback: treat as single URL
    return [value];
  } catch {
    return [value];
  }
}

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
      <SignedImage
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

function EditableInfoRow({ 
  label, 
  value, 
  icon: Icon, 
  fieldName, 
  reportId, 
  canEdit, 
  onUpdate,
  type = "text"
}: { 
  label: string; 
  value: string | null | undefined; 
  icon?: React.ComponentType<any>; 
  fieldName: string;
  reportId: string;
  canEdit: boolean;
  onUpdate: (fieldName: string, newValue: string | number | null) => void;
  type?: "text" | "number";
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const finalValue = type === "number" 
      ? (editValue ? Number(editValue) : null) 
      : (editValue.trim() || null);
    const result = await updateReportField(reportId, fieldName, finalValue);
    setIsSaving(false);
    if (result.success) {
      onUpdate(fieldName, finalValue);
      setIsEditing(false);
      toast.success(`${label} atualizado com sucesso`);
    } else {
      toast.error(`Erro ao atualizar ${label}`);
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 py-1">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
        <span className="text-sm text-muted-foreground shrink-0">{label}:</span>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          type={type}
          className="h-7 text-sm flex-1 max-w-[200px]"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 text-success" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancel}>
          <X className="w-3 h-3 text-destructive" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 py-1 group">
      {Icon && <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
      <span className="text-sm text-muted-foreground shrink-0">{label}:</span>
      <span className="text-sm font-medium">{value || "N/A"}</span>
      {canEdit && (
        <button
          onClick={() => { setEditValue(value || ""); setIsEditing(true); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-0.5 rounded hover:bg-muted"
        >
          <Pencil className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
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
  const { isAdmin, isGestor, user } = useAuth();
  const { loadReportForEditing } = useChecklist();
  const navigate = useNavigate();
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ url: string; label: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const openLightbox = (images: { url: string; label: string }[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const canEditReport = isAdmin || isGestor || (user && report?.user_id === user.id);

  const handleFieldUpdate = (fieldName: string, newValue: string | number | null) => {
    if (report) {
      setReport({ ...report, [fieldName]: newValue });
    }
  };

  const handleEditReport = async () => {
    if (!report?.id) return;
    try {
      const fullReport = await fetchFullReportById(report.id);
      if (!fullReport) { toast.error('Relatório não encontrado'); return; }
      const checklistData = reportToChecklist(fullReport);
      loadReportForEditing(checklistData, report.id);
      onClose();
      navigate('/');
      toast.success('Relatório carregado para edição');
    } catch (err) {
      console.error('Error loading report for editing:', err);
      toast.error('Erro ao carregar relatório');
    }
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
  // Parse observation photos (may be JSON array or single URL)
  const parseObservationPhotos = (value: string | null): string[] => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [value];
    } catch {
      return value ? [value] : [];
    }
  };
  const observationPhotos = parseObservationPhotos(report?.observacao_foto_url);
  observationPhotos.forEach((url, idx) => {
    allPhotos.push({ url, label: `Observação ${idx + 1}`, category: "Geral" });
  });
  // Energy photos
  if (report?.energia_foto_quadro_geral) {
    allPhotos.push({ url: report.energia_foto_quadro_geral, label: "Quadro Geral", category: "Energia" });
  }
  if (report?.energia_foto_transformador) {
    allPhotos.push({ url: report.energia_foto_transformador, label: "Transformador", category: "Energia" });
  }
  if (report?.energia_foto_relogio) {
    allPhotos.push({ url: report.energia_foto_relogio, label: "Medidor", category: "Energia" });
  }
  if (report?.energia_foto_placa) {
    allPhotos.push({ url: report.energia_foto_placa, label: "Placa", category: "Energia" });
  }
  if (report?.energia_foto_cabos) {
    allPhotos.push({ url: report.energia_foto_cabos, label: "Cabos", category: "Energia" });
  }
  // GMG photo
  if (report?.gmg_foto_painel) {
    allPhotos.push({ url: report.gmg_foto_painel, label: "Painel do GMG", category: "GMG" });
  }
  if (report?.gmg_foto_alarme) {
    allPhotos.push({ url: report.gmg_foto_alarme, label: "Alarme GMG", category: "GMG" });
  }
  // Torre photos
  if (report?.torre_foto_fibras_protegidas) {
    allPhotos.push({ url: report.torre_foto_fibras_protegidas, label: "Fibras Protegidas", category: "Torre" });
  }
  if (report?.torre_foto_aterramento) {
    allPhotos.push({ url: report.torre_foto_aterramento, label: "Aterramento", category: "Torre" });
  }
  if (report?.torre_foto_zeladoria) {
    allPhotos.push({ url: report.torre_foto_zeladoria, label: "Zeladoria", category: "Torre" });
  }
  if (report?.torre_foto_esteiramento_horizontal) {
    allPhotos.push({ url: report.torre_foto_esteiramento_horizontal, label: "Esteiramento Horizontal", category: "Torre" });
  }
  if (report?.torre_foto_esteiramento_vertical) {
    allPhotos.push({ url: report.torre_foto_esteiramento_vertical, label: "Esteiramento Vertical", category: "Torre" });
  }
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
  
  // Fiber optic photos
  if (report?.fibra_abord1_foto) {
    allPhotos.push({ url: report.fibra_abord1_foto, label: "Abordagem 1", category: "Fibra Óptica" });
  }
  if (report?.fibra_abord2_foto) {
    allPhotos.push({ url: report.fibra_abord2_foto, label: "Abordagem 2", category: "Fibra Óptica" });
  }
  // Parse JSON arrays for fiber photos
  parsePhotoJson(report?.fibra_foto_caixas_passagem).forEach((url, idx) => {
    allPhotos.push({ url, label: `Caixas de Passagem ${idx + 1}`, category: "Fibra Óptica" });
  });
  parsePhotoJson(report?.fibra_foto_caixas_subterraneas).forEach((url, idx) => {
    allPhotos.push({ url, label: `Caixas Subterrâneas ${idx + 1}`, category: "Fibra Óptica" });
  });
  parsePhotoJson(report?.fibra_foto_subidas_laterais).forEach((url, idx) => {
    allPhotos.push({ url, label: `Subidas Laterais ${idx + 1}`, category: "Fibra Óptica" });
  });
  for (let d = 1; d <= 4; d++) {
    const dgoFoto = report?.[`fibra_dgo${d}_foto`];
    const dgoCordoesFoto = report?.[`fibra_dgo${d}_cordoes_foto`];
    if (dgoFoto) allPhotos.push({ url: dgoFoto, label: `DGO ${d}`, category: "Fibra Óptica" });
    if (dgoCordoesFoto) allPhotos.push({ url: dgoCordoesFoto, label: `DGO ${d} - Cordões`, category: "Fibra Óptica" });
  }

  // Calculate statistics and critical issues
  const calcStats = () => {
    let batteriesOk = 0, batteriesNok = 0, acsOk = 0, acsNok = 0;
    let oldBatteries: { gabinete: number; banco: number; dataFab: string; idade: number }[] = [];
    let defectiveAcs: { gabinete: number; ac: number; modelo: string; status: string }[] = [];
    const currentYear = new Date().getFullYear();
    
    for (let g = 1; g <= totalCabinets; g++) {
      for (let b = 1; b <= 12; b++) {
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
                  {canEditReport && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={handleEditReport}
                    >
                      <FileEdit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
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
                      <EditableInfoRow label="Site" value={report.site_code} icon={Radio} fieldName="site_code" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                      <EditableInfoRow label="UF" value={report.state_uf} icon={MapPin} fieldName="state_uf" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                      <EditableInfoRow label="Técnico" value={report.technician_name} icon={User} fieldName="technician_name" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                      <InfoRow label="Data" value={`${report.created_date} ${report.created_time}`} icon={Calendar} />
                      <EditableInfoRow label="Gabinetes" value={totalCabinets.toString()} icon={Building2} fieldName="total_cabinets" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} type="number" />
                      <EditableInfoRow label="Operadora" value={report.operadora || 'VIVO'} fieldName="operadora" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                      <EditableInfoRow label="Observações" value={report.observacoes} fieldName="observacoes" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                    </CardContent>
                  </Card>

                  {/* Geolocalização */}
                  {(report.geo_latitude || report.geo_endereco) && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Geolocalização
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <InfoRow label="Latitude" value={report.geo_latitude?.toString()} />
                        <InfoRow label="Longitude" value={report.geo_longitude?.toString()} />
                        <InfoRow label="Endereço" value={report.geo_endereco} />
                        <InfoRow label="Capturado em" value={report.geo_capturado_em ? new Date(report.geo_capturado_em).toLocaleString('pt-BR') : null} />
                      </CardContent>
                    </Card>
                  )}

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

                  {observationPhotos.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Fotos de Observação ({observationPhotos.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          {observationPhotos.map((url, idx) => (
                            <PhotoViewer 
                              key={idx} 
                              url={url} 
                              label={`Observação ${idx + 1}`} 
                            />
                          ))}
                        </div>
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
                            <EditableInfoRow label="Tipo" value={report[`${prefix}_tipo`]} fieldName={`${prefix}_tipo`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                            <EditableInfoRow label="Proteção" value={report[`${prefix}_protecao`]} fieldName={`${prefix}_protecao`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                            <EditableInfoRow label="Ativo" value={report[`${prefix}_ativo`] || 'SIM'} fieldName={`${prefix}_ativo`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                            <EditableInfoRow label="Tecnologias Acesso" value={report[`${prefix}_tecnologias_acesso`]} icon={Radio} fieldName={`${prefix}_tecnologias_acesso`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                            <EditableInfoRow label="Tecnologias Transporte" value={report[`${prefix}_tecnologias_transporte`]} fieldName={`${prefix}_tecnologias_transporte`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
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
                            <EditableInfoRow label="Fabricante" value={report[`${prefix}_fcc_fabricante`]} fieldName={`${prefix}_fcc_fabricante`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                            <EditableInfoRow label="Tensão DC" value={report[`${prefix}_fcc_tensao`]} fieldName={`${prefix}_fcc_tensao`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                            <EditableInfoRow label="Gerenciada" value={report[`${prefix}_fcc_gerenciado`]} fieldName={`${prefix}_fcc_gerenciado`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                            <EditableInfoRow label="Gerenciável" value={report[`${prefix}_fcc_gerenciavel`]} fieldName={`${prefix}_fcc_gerenciavel`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                            <EditableInfoRow label="Consumo DC" value={report[`${prefix}_fcc_consumo`]} fieldName={`${prefix}_fcc_consumo`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                            <EditableInfoRow label="Qtd UR Suportadas" value={report[`${prefix}_fcc_qtd_ur`]} fieldName={`${prefix}_fcc_qtd_ur`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                            <EditableInfoRow label="URs Instaladas" value={report[`${prefix}_fcc_qtd_ur_instaladas`]} fieldName={`${prefix}_fcc_qtd_ur_instaladas`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
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
                            {Array.from({ length: 12 }, (_, j) => {
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
                                    <EditableInfoRow label="Tipo" value={tipo} fieldName={`${prefix}_bat${b}_tipo`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                                    <EditableInfoRow label="Fabricante" value={fabricante} fieldName={`${prefix}_bat${b}_fabricante`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                                    <EditableInfoRow label="Capacidade" value={capacidade ? `${capacidade}` : null} fieldName={`${prefix}_bat${b}_capacidade`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                                    <EditableInfoRow label="Fabricação" value={dataFab} fieldName={`${prefix}_bat${b}_data_fabricacao`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                                    <EditableInfoRow label="Estado" value={estado} fieldName={`${prefix}_bat${b}_estado`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                                    <EditableInfoRow label="Colada" value={report[`${prefix}_bat${b}_colada`]} fieldName={`${prefix}_bat${b}_colada`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                                    <EditableInfoRow label="Com Gradil" value={report[`${prefix}_bat${b}_com_gradil`]} fieldName={`${prefix}_bat${b}_com_gradil`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-3">
                            <EditableInfoRow label="Bancos Interligados" value={report[`${prefix}_bancos_interligados`]} fieldName={`${prefix}_bancos_interligados`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
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
                            <EditableInfoRow label="Tipo" value={report[`${prefix}_climatizacao_tipo`]} fieldName={`${prefix}_climatizacao_tipo`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                            <EditableInfoRow label="Ventiladores" value={report[`${prefix}_ventiladores_status`]} fieldName={`${prefix}_ventiladores_status`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                            <EditableInfoRow label="PLC" value={report[`${prefix}_plc_status`]} fieldName={`${prefix}_plc_status`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                            <EditableInfoRow label="Alarme" value={report[`${prefix}_alarme_status`]} fieldName={`${prefix}_alarme_status`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
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
                                <div key={a} className="p-2 border rounded bg-muted/30">
                                  <p className="text-xs font-medium mb-1">AC {a}</p>
                                  <EditableInfoRow label="Modelo" value={modelo} fieldName={`${prefix}_ac${a}_modelo`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                                  <EditableInfoRow label="Status" value={status} fieldName={`${prefix}_ac${a}_status`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
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
                        <EditableInfoRow label="Tipo Quadro" value={report.energia_tipo_quadro} fieldName="energia_tipo_quadro" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Fabricante" value={report.energia_fabricante_outra || report.energia_fabricante} fieldName="energia_fabricante" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Potência (kVA)" value={report.energia_potencia_kva?.toString()} fieldName="energia_potencia_kva" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} type="number" />
                        <EditableInfoRow label="Tensão Entrada" value={report.energia_tensao_entrada} fieldName="energia_tensao_entrada" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Disjuntor Entrada (A)" value={report.energia_disjuntor_entrada?.toString()} fieldName="energia_disjuntor_entrada" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} type="number" />
                        <EditableInfoRow label="Disjuntor QDCA (A)" value={report.energia_disjuntor_qdca?.toString()} fieldName="energia_disjuntor_qdca" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} type="number" />
                        <EditableInfoRow label="Unidade Consumidora" value={report.energia_unidade_consumidora} fieldName="energia_unidade_consumidora" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Potência Transformador" value={report.energia_potencia_transformador} fieldName="energia_potencia_transformador" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Transformador" value={report.energia_transformador_ok} fieldName="energia_transformador_ok" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Protegido Gradil" value={report.energia_protegido_gradil} fieldName="energia_protegido_gradil" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Protegido Cadeado" value={report.energia_protegido_cadeado} fieldName="energia_protegido_cadeado" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                      </div>
                      
                      {/* Energy Photos */}
                      <PhotoGrid photos={[
                        { url: report.energia_foto_quadro_geral, label: "Quadro Geral" },
                        { url: report.energia_foto_transformador, label: "Transformador" },
                        { url: report.energia_foto_relogio, label: "Medidor (Relógio)" },
                        { url: report.energia_foto_placa, label: "Placa" },
                        { url: report.energia_foto_cabos, label: "Cabos" },
                      ]} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Fibra */}
                <TabsContent value="fibra" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Cable className="w-4 h-4" />
                        Resumo de Fibra Óptica
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                        <EditableInfoRow label="Qtd Abordagens" value={report.fibra_qtd_abordagens?.toString()} fieldName="fibra_qtd_abordagens" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} type="number" />
                        <EditableInfoRow label="Caixas de Passagem" value={report.fibra_caixas_passagem_qtd?.toString()} fieldName="fibra_caixas_passagem_qtd" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} type="number" />
                        <EditableInfoRow label="Caixas Subterrâneas" value={report.fibra_caixas_subterraneas_qtd?.toString()} fieldName="fibra_caixas_subterraneas_qtd" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} type="number" />
                        <EditableInfoRow label="Subidas Laterais" value={report.fibra_subidas_laterais_qtd?.toString()} fieldName="fibra_subidas_laterais_qtd" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} type="number" />
                        <EditableInfoRow label="Total DGOs" value={report.fibra_dgos_qtd?.toString()} fieldName="fibra_dgos_qtd" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} type="number" />
                        <div className="flex items-center gap-2 py-1">
                          <span className="text-sm text-muted-foreground">DGOs OK:</span>
                          <Badge className="bg-success text-success-foreground">{report.fibra_dgos_ok_qtd || 0}</Badge>
                          <span className="text-sm text-muted-foreground">NOK:</span>
                          <Badge className="bg-destructive text-destructive-foreground">{report.fibra_dgos_nok_qtd || 0}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Abordagens */}
                  {(report.fibra_abord1_tipo || report.fibra_abord2_tipo || (report as any).fibra_abord3_tipo || (report as any).fibra_abord4_tipo) && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Abordagens de Fibra</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[1, 2, 3, 4].map((num) => {
                          const tipo = report[`fibra_abord${num}_tipo`];
                          const descricao = report[`fibra_abord${num}_descricao`];
                          const foto = report[`fibra_abord${num}_foto`];
                          if (!tipo) return null;
                          return (
                            <div key={num} className="p-3 border rounded-lg bg-muted/30">
                              <p className="font-medium mb-2">Abordagem {num}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                <EditableInfoRow label="Tipo" value={tipo} fieldName={`fibra_abord${num}_tipo`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                                <EditableInfoRow label="Descrição" value={descricao} fieldName={`fibra_abord${num}_descricao`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                              </div>
                              {foto && (
                                <div className="mt-3">
                                  <PhotoViewer url={foto} label={`Foto Abordagem ${num}`} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}

                  {/* Infraestrutura de Fibra */}
                  {(report.fibra_caixas_passagem_qtd || report.fibra_caixas_subterraneas_qtd || report.fibra_subidas_laterais_qtd) && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Infraestrutura de Fibra</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PhotoGrid photos={[
                          ...parsePhotoJson(report.fibra_foto_caixas_passagem).map((url, i) => ({ url, label: `Caixas de Passagem ${i + 1}` })),
                          ...parsePhotoJson(report.fibra_foto_caixas_subterraneas).map((url, i) => ({ url, label: `Caixas Subterrâneas ${i + 1}` })),
                          ...parsePhotoJson(report.fibra_foto_subidas_laterais).map((url, i) => ({ url, label: `Subidas Laterais ${i + 1}` })),
                        ]} />
                      </CardContent>
                    </Card>
                  )}

                  {/* DGOs */}
                  {(report.fibra_dgos_qtd ?? 0) > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">DGOs (Distribuidores Gerais Ópticos)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Array.from({ length: 4 }, (_, i) => {
                            const d = i + 1;
                            const dgoId = report[`fibra_dgo${d}_id`];
                            const dgoCapacidade = report[`fibra_dgo${d}_capacidade`];
                            const dgoCordoes = report[`fibra_dgo${d}_cordoes`];
                            const dgoFoto = report[`fibra_dgo${d}_foto`];
                            const dgoCordoesFoto = report[`fibra_dgo${d}_cordoes_foto`];

                            if (!dgoId && !dgoCapacidade && !dgoCordoes) return null;

                            return (
                              <div key={d} className="p-3 border rounded-lg bg-muted/30">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">DGO {d}</span>
                                  <StatusBadge status={dgoCordoes} />
                                </div>
                                <div className="text-xs text-muted-foreground space-y-0.5 mb-3">
                                  <EditableInfoRow label="ID" value={dgoId} fieldName={`fibra_dgo${d}_id`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                                  <EditableInfoRow label="Capacidade" value={dgoCapacidade} fieldName={`fibra_dgo${d}_capacidade`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                                  <EditableInfoRow label="Estado Cordões" value={dgoCordoes} fieldName={`fibra_dgo${d}_cordoes`} reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                                </div>
                                <PhotoGrid photos={[
                                  { url: dgoFoto, label: `DGO ${d}` },
                                  { url: dgoCordoesFoto, label: `Cordões DGO ${d}` },
                                ]} />
                              </div>
                            );
                          })}
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
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                        <EditableInfoRow label="Possui GMG" value={report.gmg_existe} fieldName="gmg_existe" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Fabricante" value={report.gmg_fabricante} fieldName="gmg_fabricante" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Potência" value={report.gmg_potencia} fieldName="gmg_potencia" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Combustível (%)" value={report.gmg_combustivel} fieldName="gmg_combustivel" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Capacidade Tanque (L)" value={report.gmg_autonomia?.toString()} fieldName="gmg_autonomia" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} type="number" />
                        <EditableInfoRow label="Último Teste" value={report.gmg_ultimo_teste} fieldName="gmg_ultimo_teste" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Status" value={report.gmg_status} fieldName="gmg_status" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Alarme Ativo" value={report.gmg_alarme_ativo} fieldName="gmg_alarme_ativo" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                      </div>
                      
                      {report.gmg_existe === "SIM" && (
                        <PhotoGrid photos={[
                          { url: report.gmg_foto_painel, label: "Painel do GMG" },
                          { url: report.gmg_foto_alarme, label: "Foto do Alarme" },
                        ]} />
                      )}
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                        <EditableInfoRow label="Fibra Protegida" value={report.torre_protecao_fibra} fieldName="torre_protecao_fibra" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Aterramento" value={report.torre_aterramento} fieldName="torre_aterramento" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Zeladoria" value={report.torre_housekeeping} fieldName="torre_housekeeping" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                        <EditableInfoRow label="Ninhos" value={report.torre_ninhos} fieldName="torre_ninhos" reportId={report.id!} canEdit={!!canEditReport} onUpdate={handleFieldUpdate} />
                      </div>
                      <PhotoGrid photos={[
                        { url: report.torre_foto_fibras_protegidas, label: "Fibras Protegidas" },
                        { url: report.torre_foto_aterramento, label: "Aterramento" },
                        { url: report.torre_foto_zeladoria, label: "Zeladoria" },
                        { url: report.torre_foto_ninhos, label: "Ninhos" },
                      ]} />
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
