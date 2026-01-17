import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Radio,
  MapPin,
  RefreshCw,
  Battery,
  Thermometer,
  Zap,
  Trash2,
  LayoutDashboard,
  Home,
  Cable,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VivoLogo } from "@/components/ui/vivo-logo";
import { fetchReportsForDashboard } from "@/lib/reportDatabase";

// Dashboard components
import { DashboardFiltersBar } from "@/components/dashboard/DashboardFilters";
import { DashboardFilters } from "@/components/dashboard/types";
import { useDashboardStats } from "@/components/dashboard/useDashboardStats";
import { DrillDownModal } from "@/components/dashboard/DrillDownModal";
import { SiteDetailModal } from "@/components/dashboard/SiteDetailModal";

// Panels
import { OverviewPanel } from "@/components/dashboard/panels/OverviewPanel";
import { DGOSPanel } from "@/components/dashboard/panels/DGOSPanel";
import { EnergiaPanel } from "@/components/dashboard/panels/EnergiaPanel";
import { ZeladoriaPanel } from "@/components/dashboard/panels/ZeladoriaPanel";
import { BateriaPanel } from "@/components/dashboard/panels/BateriaPanel";
import { ClimatizacaoPanel } from "@/components/dashboard/panels/ClimatizacaoPanel";
import { FibraOpticaPanel, FibraStats } from "@/components/dashboard/panels/FibraOpticaPanel";

type ActivePanel = "overview" | "dgos" | "energia" | "zeladoria" | "bateria" | "climatizacao" | "fibra";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<ActivePanel>("overview");
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: { from: undefined, to: undefined },
    technician: "",
    stateUf: "all",
    status: "all",
  });

  // Drill-down modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"sites" | "batteries" | "acs">("sites");
  const [modalTitle, setModalTitle] = useState("");
  const [modalFilterFn, setModalFilterFn] = useState<(data: any) => any[]>(() => () => []);

  // Site detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Fetch reports using React Query
  const {
    data: reports = [],
    isLoading,
    error,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["dashboard-reports"],
    queryFn: () => fetchReportsForDashboard({}),
    staleTime: 1000 * 60 * 5,
    retry: 3,
    refetchOnWindowFocus: true,
  });

  // Process stats based on filters
  const { stats, sites, batteries, acs, climatizacao } = useDashboardStats(reports, filters);

  // Extract unique values for filter dropdowns
  const uniqueUFs = useMemo(() => {
    const ufs = new Set(reports.map((r) => r.state_uf).filter(Boolean));
    return Array.from(ufs).sort() as string[];
  }, [reports]);

  const uniqueTechnicians = useMemo(() => {
    const techs = new Set(reports.map((r) => r.technician_name).filter(Boolean));
    return Array.from(techs).sort() as string[];
  }, [reports]);

  // Drill-down handlers
  const openDrillDown = (
    type: "sites" | "batteries" | "acs",
    title: string,
    filterFn?: (data: any[]) => any[]
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalFilterFn(() => filterFn || ((d: any[]) => d));
    setModalOpen(true);
  };

  // Panel navigation items
  const panelItems = [
    { id: "overview" as const, label: "Visão Geral", icon: Home },
    { id: "bateria" as const, label: "Baterias", icon: Battery },
    { id: "climatizacao" as const, label: "Climatização", icon: Thermometer },
    { id: "fibra" as const, label: "Fibra Óptica", icon: Cable },
    { id: "zeladoria" as const, label: "Zeladoria", icon: Trash2 },
    { id: "energia" as const, label: "Energia", icon: Zap },
  ];

  // Calculate fiber stats from reports
  const fibraStats = useMemo((): FibraStats => {
    let totalAbordagens = 0;
    let abordagensAereas = 0;
    let abordagensSubterraneas = 0;
    let totalCaixasPassagem = 0;
    let totalCaixasSubterraneas = 0;
    let totalSubidasLaterais = 0;
    let totalDGOs = 0;
    let dgosOk = 0;
    let dgosNok = 0;
    let sitesWithFibra = 0;

    reports.forEach(report => {
      const qtdAbord = (report as any).fibra_qtd_abordagens || 0;
      if (qtdAbord > 0) {
        sitesWithFibra++;
        totalAbordagens += qtdAbord;
        
        if ((report as any).fibra_abord1_tipo === 'AÉREA') abordagensAereas++;
        else if ((report as any).fibra_abord1_tipo === 'SUBTERRÂNEA') abordagensSubterraneas++;
        
        if (qtdAbord >= 2) {
          if ((report as any).fibra_abord2_tipo === 'AÉREA') abordagensAereas++;
          else if ((report as any).fibra_abord2_tipo === 'SUBTERRÂNEA') abordagensSubterraneas++;
        }
      }

      totalCaixasPassagem += (report as any).fibra_caixas_passagem_qtd || 0;
      totalCaixasSubterraneas += (report as any).fibra_caixas_subterraneas_qtd || 0;
      totalSubidasLaterais += (report as any).fibra_subidas_laterais_qtd || 0;
      
      const qtdDgos = (report as any).fibra_dgos_qtd || 0;
      totalDGOs += qtdDgos;
      dgosOk += (report as any).fibra_dgos_ok_qtd || 0;
      dgosNok += (report as any).fibra_dgos_nok_qtd || 0;
    });

    return {
      totalSites: reports.length,
      sitesWithFibra,
      totalAbordagens,
      abordagensAereas,
      abordagensSubterraneas,
      totalCaixasPassagem,
      totalCaixasSubterraneas,
      totalSubidasLaterais,
      totalDGOs,
      dgosOk,
      dgosNok,
      abordagemChart: [
        { name: "Aérea", value: abordagensAereas, color: "#3b82f6" },
        { name: "Subterrânea", value: abordagensSubterraneas, color: "#6b7280" },
      ].filter(d => d.value > 0),
      dgosStatusChart: [
        { name: "OK", value: dgosOk, color: "#22c55e" },
        { name: "NOK", value: dgosNok, color: "#ef4444" },
      ].filter(d => d.value > 0),
      infraestruturaChart: [
        { name: "Caixas de Passagem", value: totalCaixasPassagem },
        { name: "Caixas Subterrâneas", value: totalCaixasSubterraneas },
        { name: "Subidas Laterais", value: totalSubidasLaterais },
        { name: "DGOs", value: totalDGOs },
      ],
    };
  }, [reports]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-56 bg-card border-r border-border hidden lg:flex flex-col z-40">
        <div className="p-4 border-b border-border bg-gradient-to-r from-[#003366] to-[#004d99]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">InfraSites</h1>
              <p className="text-xs text-white/70">Dashboard Executivo</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3">
          <p className="text-xs text-muted-foreground mb-2 px-2">Painéis</p>
          <ul className="space-y-1">
            {panelItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActivePanel(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePanel === item.id
                      ? "bg-[#003366]/10 text-[#003366] border-l-2 border-[#003366]"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted-foreground mb-2 px-2 mt-6">Ações</p>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => navigate("/historico")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Relatórios
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">Última atualização</p>
          <p className="text-sm font-medium">
            {dataUpdatedAt
              ? format(new Date(dataUpdatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
              : "—"}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-56">
        {/* Header Mobile */}
        <header className="lg:hidden sticky top-0 z-50 bg-[#003366] text-white shadow-sm">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <VivoLogo className="h-6" />
            <div className="flex-1">
              <h1 className="font-bold">Dashboard</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Mobile Panel Tabs */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
            {panelItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePanel(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activePanel === item.id
                    ? "bg-white text-[#003366]"
                    : "bg-white/20 text-white/80"
                }`}
              >
                <item.icon className="w-3 h-3" />
                {item.label}
              </button>
            ))}
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Executivo</h1>
            <p className="text-muted-foreground">Análise completa da infraestrutura de telecomunicações</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          {/* Global Filters */}
          <DashboardFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            uniqueUFs={uniqueUFs}
            uniqueTechnicians={uniqueTechnicians}
          />

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-[#003366]" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">Erro ao carregar dados</p>
              <Button onClick={() => refetch()}>Tentar novamente</Button>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <>
              {activePanel === "overview" && (
                <OverviewPanel
                  stats={stats}
                  sites={sites}
                  onDrillDown={(type) => {
                    if (type === "total") openDrillDown("sites", "Todos os Sites", (s) => s);
                    else if (type === "ok") openDrillDown("sites", "Sites OK", (s) => s.filter((site: any) => !site.hasProblems));
                    else openDrillDown("sites", "Sites com Problemas", (s) => s.filter((site: any) => site.hasProblems));
                  }}
                />
              )}

              {activePanel === "dgos" && (
                <DGOSPanel
                  stats={stats}
                  sites={sites}
                  onDrillDown={(type) => {
                    if (type === "total") openDrillDown("sites", "Todos os Sites", (s) => s);
                    else if (type === "ok") openDrillDown("sites", "Sites sem Problemas", (s) => s.filter((site: any) => !site.hasProblems));
                    else openDrillDown("sites", "Sites com Problemas", (s) => s.filter((site: any) => site.hasProblems));
                  }}
                />
              )}

              {activePanel === "energia" && (
                <EnergiaPanel
                  stats={stats}
                  acs={acs}
                  onDrillDown={(type) => {
                    if (type === "gmg") openDrillDown("sites", "Sites com GMG", (s) => s.filter((site: any) => site.gmgExists));
                    else if (type === "ac-ok") openDrillDown("acs", "ACs Funcionando", (a) => a.filter((ac: any) => ac.status === "OK"));
                    else openDrillDown("acs", "ACs com Defeito", (a) => a.filter((ac: any) => ac.status === "NOK"));
                  }}
                />
              )}

              {activePanel === "climatizacao" && (
                <ClimatizacaoPanel
                  stats={stats}
                  climatizacao={climatizacao}
                  acs={acs}
                  onDrillDown={(type) => {
                    if (type === "all") openDrillDown("sites", "Todos Gabinetes", (s) => s);
                    else if (type === "ac-ok") openDrillDown("acs", "ACs OK", (a) => a.filter((ac: any) => ac.status === "OK"));
                    else if (type === "ac-nok") openDrillDown("acs", "ACs NOK", (a) => a.filter((ac: any) => ac.status === "NOK"));
                    else openDrillDown("sites", "Sites", (s) => s);
                  }}
                />
              )}

              {activePanel === "zeladoria" && (
                <ZeladoriaPanel
                  stats={stats}
                  sites={sites}
                  onDrillDown={(type) => {
                    if (type === "zeladoria") openDrillDown("sites", "Zeladoria OK", (s) => s.filter((site: any) => site.zeladoriaOk));
                    else openDrillDown("sites", "Aterramento OK", (s) => s);
                  }}
                />
              )}

              {activePanel === "bateria" && (
                <BateriaPanel
                  stats={stats}
                  batteries={batteries}
                  onDrillDown={(type) => {
                    if (type === "all") openDrillDown("batteries", "Todas as Baterias", (b) => b);
                    else if (type === "ok") openDrillDown("batteries", "Baterias OK", (b) => b.filter((bat: any) => bat.estado === "BOA"));
                    else if (type === "nok") openDrillDown("batteries", "Baterias com Defeito", (b) => b.filter((bat: any) => bat.estado !== "BOA"));
                    else if (type === "obsolete-warning") openDrillDown("batteries", "Baterias 5-8 anos", (b) => b.filter((bat: any) => bat.obsolescencia === "warning"));
                    else openDrillDown("batteries", "Baterias +8 anos (CRÍTICO)", (b) => b.filter((bat: any) => bat.obsolescencia === "critical"));
                  }}
                />
              )}

              {activePanel === "fibra" && (
                <FibraOpticaPanel stats={fibraStats} />
              )}
            </>
          )}
        </div>
      </main>

      {/* Drill-Down Modal */}
      <DrillDownModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        type={modalType}
        sites={modalType === "sites" ? modalFilterFn(sites) : undefined}
        batteries={modalType === "batteries" ? modalFilterFn(batteries) : undefined}
        acs={modalType === "acs" ? modalFilterFn(acs) : undefined}
        onSiteClick={(id) => {
          setSelectedReportId(id);
          setDetailModalOpen(true);
        }}
      />

      {/* Site Detail Modal */}
      <SiteDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedReportId(null);
        }}
        reportId={selectedReportId}
      />
    </div>
  );
}
