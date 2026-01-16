import React, { useState, useEffect } from "react";
import { X, Download, Loader2, Building2, Battery, Thermometer, Zap, Radio, User, Calendar, MapPin, Image as ImageIcon, AlertTriangle, CheckCircle } from "lucide-react";
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
import { fetchFullReportById, ReportRow } from "@/lib/reportDatabase";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  reportId: string | null;
}

interface PhotoViewerProps {
  url: string;
  label: string;
}

function PhotoViewer({ url, label }: PhotoViewerProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  if (!url || error) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground">
        <ImageIcon className="w-8 h-8 mb-2" />
        <span className="text-xs">{label}</span>
        <span className="text-xs">Sem foto</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <img
        src={url}
        alt={label}
        className={cn("w-full h-full object-cover transition-opacity", loading ? "opacity-0" : "opacity-100")}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1">
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

export function SiteDetailModal({ open, onClose, reportId }: Props) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportRow | null>(null);
  const [activeTab, setActiveTab] = useState("geral");

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

  // Collect all photos
  const allPhotos: { url: string; label: string }[] = [];
  if (report?.panoramic_photo_url) {
    allPhotos.push({ url: report.panoramic_photo_url, label: "Foto Panorâmica" });
  }
  if (report?.observacao_foto_url) {
    allPhotos.push({ url: report.observacao_foto_url, label: "Foto Observação" });
  }
  for (let g = 1; g <= 7; g++) {
    const transmissao = report?.[`gab${g}_foto_transmissao`];
    const acesso = report?.[`gab${g}_foto_acesso`];
    if (transmissao) allPhotos.push({ url: transmissao, label: `Gabinete ${g} - Transmissão` });
    if (acesso) allPhotos.push({ url: acesso, label: `Gabinete ${g} - Acesso` });
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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
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
                  {report.pdf_file_path && (
                    <Button variant="secondary" size="sm" asChild>
                      <a href={report.pdf_file_path} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </a>
                    </Button>
                  )}
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

            {/* Summary Cards */}
            <div className="px-6 py-3 border-b bg-muted/30 shrink-0">
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-6 mt-3 shrink-0 flex flex-wrap h-auto gap-1">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                {Array.from({ length: totalCabinets }, (_, i) => (
                  <TabsTrigger key={i + 1} value={`gab${i + 1}`}>
                    Gab {i + 1}
                  </TabsTrigger>
                ))}
                <TabsTrigger value="gmg">GMG/Torre</TabsTrigger>
                <TabsTrigger value="fotos">Fotos ({allPhotos.length})</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-6 py-4">
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
                </TabsContent>

                {/* Tab: Gabinetes */}
                {Array.from({ length: totalCabinets }, (_, i) => {
                  const g = i + 1;
                  const prefix = `gab${g}`;
                  
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
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                          <InfoRow label="Tipo" value={report[`${prefix}_tipo`]} />
                          <InfoRow label="Proteção" value={report[`${prefix}_protecao`]} />
                          <InfoRow label="Tecnologias Acesso" value={report[`${prefix}_tecnologias_acesso`]} icon={Radio} />
                          <InfoRow label="Tecnologias Transporte" value={report[`${prefix}_tecnologias_transporte`]} />
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
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                          <InfoRow label="Fabricante" value={report[`${prefix}_fcc_fabricante`]} />
                          <InfoRow label="Tensão DC" value={report[`${prefix}_fcc_tensao`]} />
                          <InfoRow label="Gerenciada" value={report[`${prefix}_fcc_gerenciado`]} />
                          <InfoRow label="Gerenciável" value={report[`${prefix}_fcc_gerenciavel`]} />
                          <InfoRow label="Consumo DC" value={report[`${prefix}_fcc_consumo`]} />
                          <InfoRow label="Qtd UR" value={report[`${prefix}_fcc_qtd_ur`]} />
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
                        </CardContent>
                      </Card>

                      {/* Fotos do Gabinete */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Fotos do Gabinete
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PhotoViewer url={report[`${prefix}_foto_transmissao`]} label="Transmissão" />
                            <PhotoViewer url={report[`${prefix}_foto_acesso`]} label="Acesso" />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  );
                })}

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
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
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
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Fotos */}
                <TabsContent value="fotos" className="mt-0">
                  {allPhotos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allPhotos.map((photo, idx) => (
                        <PhotoViewer key={idx} url={photo.url} label={photo.label} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma foto disponível</p>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Relatório não encontrado</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
