import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, Search, Filter, Mail, MailCheck, 
  FileText, FileSpreadsheet, RefreshCw, X,
  Calendar, User, Building2, Loader2, AlertCircle, Download
} from "lucide-react";
import { generatePDF, downloadPDF } from "@/lib/generatePDF";
import { generateExcel, generateConsolidatedExcel, downloadExcel } from "@/lib/generateExcel";
import { reportToChecklist } from "@/lib/reportToChecklist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { VivoLogo } from "@/components/ui/vivo-logo";
import { fetchReportsSummary, fetchReportByIdWithPhotos, ReportRow } from "@/lib/reportDatabase";

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function ReportsHistory() {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [downloadingPDFId, setDownloadingPDFId] = useState<string | null>(null);
  
  // Filters
  const [siteCodeFilter, setSiteCodeFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Applied filters (only update when user clicks "Filtrar")
  const [appliedFilters, setAppliedFilters] = useState({
    siteCode: "",
    stateUf: "",
    startDate: "",
    endDate: "",
  });

  // TanStack Query for robust data fetching with retries
  const { 
    data: reports = [], 
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching 
  } = useQuery({
    queryKey: ['reports-summary', appliedFilters],
    queryFn: () => fetchReportsSummary({
      siteCode: appliedFilters.siteCode || undefined,
      stateUf: appliedFilters.stateUf || undefined,
      startDate: appliedFilters.startDate ? new Date(appliedFilters.startDate).toISOString() : undefined,
      endDate: appliedFilters.endDate ? new Date(appliedFilters.endDate + 'T23:59:59').toISOString() : undefined,
    }),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 15000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const handleFilter = () => {
    setAppliedFilters({
      siteCode: siteCodeFilter,
      stateUf: stateFilter,
      startDate: dateFrom,
      endDate: dateTo,
    });
  };

  const clearFilters = () => {
    setSiteCodeFilter("");
    setStateFilter("");
    setDateFrom("");
    setDateTo("");
    setAppliedFilters({
      siteCode: "",
      stateUf: "",
      startDate: "",
      endDate: "",
    });
  };

  const openReportDetails = async (report: ReportRow) => {
    if (report.id) {
      // Carrega o relatório com URLs das fotos para gerar o PDF com imagens
      const fullReport = await fetchReportByIdWithPhotos(report.id);
      setSelectedReport(fullReport);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedReport) return;
    
    setIsGeneratingPDF(true);
    try {
      const checklistData = reportToChecklist(selectedReport);
      const pdfBlob = await generatePDF(checklistData);
      const filename = `Checklist_${selectedReport.site_code}_${selectedReport.state_uf}_${selectedReport.created_date?.replace(/\//g, '')}.pdf`;
      downloadPDF(pdfBlob, filename);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Download direto de PDF sem abrir modal
  const handleQuickDownloadPDF = async (e: React.MouseEvent, report: ReportRow) => {
    e.stopPropagation(); // Não abre o modal ao clicar no botão
    if (!report.id) return;
    
    setDownloadingPDFId(report.id);
    try {
      const fullReport = await fetchReportByIdWithPhotos(report.id);
      if (!fullReport) {
        toast.error('Relatório não encontrado');
        return;
      }
      const checklistData = reportToChecklist(fullReport);
      const pdfBlob = await generatePDF(checklistData);
      const filename = `Checklist_${report.site_code}_${report.state_uf}_${report.created_date?.replace(/\//g, '')}.pdf`;
      downloadPDF(pdfBlob, filename);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setDownloadingPDFId(null);
    }
  };

  const handleDownloadExcel = async () => {
    if (!selectedReport) return;
    
    setIsGeneratingExcel(true);
    try {
      const checklistData = reportToChecklist(selectedReport);
      const excelBlob = generateExcel(checklistData);
      const filename = `Checklist_${selectedReport.site_code}_${selectedReport.state_uf}_${selectedReport.created_date?.replace(/\//g, '')}.xlsx`;
      downloadExcel(excelBlob, filename);
      toast.success('Excel baixado com sucesso!');
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Erro ao gerar Excel');
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  const handleResendEmail = async () => {
    if (!selectedReport) return;
    
    // Generate and download files first
    try {
      const checklistData = reportToChecklist(selectedReport);
      const pdfBlob = await generatePDF(checklistData);
      const excelBlob = generateExcel(checklistData);
      
      const pdfFilename = `Checklist_${selectedReport.site_code}_${selectedReport.state_uf}_${selectedReport.created_date?.replace(/\//g, '')}.pdf`;
      const excelFilename = `Checklist_${selectedReport.site_code}_${selectedReport.state_uf}_${selectedReport.created_date?.replace(/\//g, '')}.xlsx`;
      
      downloadPDF(pdfBlob, pdfFilename);
      downloadExcel(excelBlob, excelFilename);
      
      const dateStr = selectedReport.created_date + ' ' + selectedReport.created_time;
      const emailBody = `
Checklist Sites Telecom
  
Site: ${selectedReport.site_code} - ${selectedReport.state_uf}
Data: ${dateStr}
Técnico: ${selectedReport.technician_name || 'N/A'}
Gabinetes: ${selectedReport.total_cabinets}
  
---
Os arquivos PDF e Excel foram baixados automaticamente.
Por favor, anexe-os a este email antes de enviar.
      `.trim();

      const subject = `Checklist ${selectedReport.site_code} – ${selectedReport.state_uf} – ${dateStr}`;
      const mailtoLink = `mailto:gregori.jose@telefonica.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      
      window.open(mailtoLink, '_blank');
      toast.success('Arquivos baixados e email preparado!', {
        description: 'Anexe os arquivos baixados ao email.'
      });
    } catch (error) {
      console.error('Error preparing email:', error);
      toast.error('Erro ao preparar email');
    }
  };

  const handleExportAllReports = async () => {
    if (reports.length === 0) {
      toast.error('Nenhum relatório para exportar');
      return;
    }
    
    setIsExportingAll(true);
    try {
      // Convert all reports to ChecklistData
      const allChecklistData = reports.map(report => reportToChecklist(report));
      
      // Generate consolidated Excel
      const excelBlob = generateConsolidatedExcel(allChecklistData);
      const filename = `Relatorios_Consolidados_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;
      downloadExcel(excelBlob, filename);
      
      toast.success(`${reports.length} relatório(s) exportado(s) com sucesso!`);
    } catch (error) {
      console.error('Error exporting all reports:', error);
      toast.error('Erro ao exportar relatórios');
    } finally {
      setIsExportingAll(false);
    }
  };

  const formatDateTime = (createdAt: string | undefined) => {
    if (!createdAt) return '-';
    try {
      return format(parseISO(createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return '-';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <VivoLogo className="h-6" />
          <div className="flex-1">
            <h1 className="font-bold text-foreground">Histórico de Relatórios</h1>
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Sigla do Site</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={siteCodeFilter}
                    onChange={(e) => setSiteCodeFilter(e.target.value)}
                    placeholder="Ex: ABCDE"
                    className="pl-8 h-9"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Estado (UF)</Label>
                <Select value={stateFilter || "all"} onValueChange={(val) => setStateFilter(val === "all" ? "" : val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {ESTADOS_BR.map(uf => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Data Início</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data Fim</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleFilter} className="flex-1 h-9">
                <Search className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
              <Button variant="outline" onClick={clearFilters} className="h-9">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            Carregando relatórios...
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-destructive" />
            <p className="text-destructive font-medium">Erro ao buscar relatórios</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Tente novamente'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum relatório encontrado</p>
            <p className="text-sm">Preencha um checklist para criar o primeiro.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{reports.length} relatório(s) encontrado(s)</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportAllReports}
                disabled={isExportingAll}
              >
                {isExportingAll ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                )}
                Exportar Todos
              </Button>
            </div>
            {reports.map((report) => (
              <Card 
                key={report.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => openReportDetails(report)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {report.site_code}
                          <Badge variant="outline" className="text-xs">
                            {report.state_uf}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {report.created_date}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {report.technician_name || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleQuickDownloadPDF(e, report)}
                        disabled={downloadingPDFId === report.id}
                        title="Baixar PDF"
                      >
                        {downloadingPDFId === report.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                      <Badge variant={report.email_sent ? "default" : "secondary"}>
                        {report.email_sent ? (
                          <MailCheck className="w-3 h-3 mr-1" />
                        ) : (
                          <Mail className="w-3 h-3 mr-1" />
                        )}
                        {report.email_sent ? 'Enviado' : 'Pendente'}
                      </Badge>
                      <Badge variant="outline">{report.total_cabinets} gab</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Report Details Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {selectedReport.site_code} - {selectedReport.state_uf}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <div className="overflow-y-auto max-h-[60vh] p-4 space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Data/Hora</Label>
                    <p className="font-medium">{formatDateTime(selectedReport.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Técnico</Label>
                    <p className="font-medium">{selectedReport.technician_name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Total Gabinetes</Label>
                    <p className="font-medium">{selectedReport.total_cabinets}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <Badge variant={selectedReport.email_sent ? "default" : "secondary"}>
                      {selectedReport.email_sent ? 'Enviado' : 'Não enviado'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Cabinets Summary */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Gabinetes</Label>
                  <div className="space-y-2">
                    {Array.from({ length: selectedReport.total_cabinets }, (_, i) => {
                      const prefix = `gab${i + 1}`;
                      return (
                        <div key={i} className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium">Gabinete {i + 1}</p>
                          <div className="grid grid-cols-2 gap-2 mt-1 text-sm text-muted-foreground">
                            <span>Tipo: {selectedReport[`${prefix}_tipo`] || '-'}</span>
                            <span>FCC: {selectedReport[`${prefix}_fcc_fabricante`] || '-'}</span>
                            <span>Acesso: {selectedReport[`${prefix}_tecnologias_acesso`] || '-'}</span>
                            <span>Transporte: {selectedReport[`${prefix}_tecnologias_transporte`] || '-'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* GMG & Tower */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">GMG</Label>
                    <p className="font-medium">{selectedReport.gmg_existe}</p>
                    {selectedReport.gmg_fabricante && (
                      <p className="text-sm text-muted-foreground">{selectedReport.gmg_fabricante}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Aterramento</Label>
                    <p className="font-medium">{selectedReport.torre_aterramento || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ninhos na Torre</Label>
                    <p className="font-medium">{selectedReport.torre_ninhos || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Zeladoria</Label>
                    <p className="font-medium">{selectedReport.torre_housekeeping || '-'}</p>
                  </div>
                </div>

                {selectedReport.observacoes && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-xs text-muted-foreground">Observações</Label>
                      <p className="mt-1 text-sm">{selectedReport.observacoes}</p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Actions */}
              <div className="border-t p-4 flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF || isGeneratingExcel}
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Baixar PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={handleDownloadExcel}
                  disabled={isGeneratingPDF || isGeneratingExcel}
                >
                  {isGeneratingExcel ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Baixar Excel
                </Button>
                <Button 
                  onClick={handleResendEmail} 
                  className="flex-1"
                  disabled={isGeneratingPDF || isGeneratingExcel}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
