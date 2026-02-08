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
  Users,
  Fuel,
  ClipboardList,
  Building2,
  UserCog,
  FileText,
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
import { GMGPanel } from "@/components/dashboard/panels/GMGPanel";
import { ProdutividadePanel, ProdutividadeStats } from "@/components/dashboard/panels/ProdutividadePanel";
import { fetchAssignmentStatsForDashboard } from "@/lib/assignmentDatabase";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type ActivePanel = "overview" | "dgos" | "energia" | "zeladoria" | "bateria" | "climatizacao" | "fibra" | "produtividade" | "gmg";

export default function Dashboard() {
  const navigate = useNavigate();
  const { userOperadora, isAdmin, isGestor } = useAuth();
  const [activePanel, setActivePanel] = useState<ActivePanel>("overview");
  // TEL users can only see TEL reports; VIVO users can see all by default
  const isVivoUser = userOperadora === 'VIVO';
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: { from: undefined, to: undefined },
    technician: "",
    stateUf: "all",
    status: "all",
    siteType: "all",
    operadora: isVivoUser ? "all" : "TEL", // TEL users default to TEL only
    areaAtuacao: "all",
    siteCode: "",
    municipio: "all",
  });

  // Drill-down modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"sites" | "batteries" | "acs" | "gabinetes">("sites");
  const [modalTitle, setModalTitle] = useState("");
  const [modalFilterFn, setModalFilterFn] = useState<(data: any) => any[]>(() => () => []);
  // Extra state for dual-view (autonomy/obsolescence)
  const [modalAllowSiteView, setModalAllowSiteView] = useState(false);
  const [modalAutonomyFilter, setModalAutonomyFilter] = useState<"ok" | "medio" | "alto" | "critico" | undefined>(undefined);
  const [modalObsolescenciaFilter, setModalObsolescenciaFilter] = useState<"ok" | "medio" | "alto" | undefined>(undefined);

  // Site detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Determine the operadora filter to use in query
  // TEL users always see TEL only; VIVO users can filter or see all
  const effectiveOperadoraFilter = isVivoUser ? filters.operadora : 'TEL';
  
  // Fetch reports using React Query
  const {
    data: reports = [],
    isLoading,
    error,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["dashboard-reports", effectiveOperadoraFilter],
    queryFn: () => fetchReportsForDashboard({ operadora: effectiveOperadoraFilter }),
    staleTime: 1000 * 60 * 5,
    retry: 3,
    refetchOnWindowFocus: true,
  });

  // Fetch assignment stats for productivity panel
  const { data: assignmentStats } = useQuery({
    queryKey: ["dashboard-assignment-stats"],
    queryFn: () => fetchAssignmentStatsForDashboard(),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // Fetch sites to get site types and municipalities (paginated to overcome 1000 row limit)
  const { data: sitesData = [] } = useQuery({
    queryKey: ["dashboard-sites"],
    queryFn: async () => {
      const allSites: { site_code: string; tipo: string; municipio: string | null }[] = [];
      const pageSize = 1000;
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("sites")
          .select("site_code, tipo, municipio")
          .range(from, from + pageSize - 1);

        if (error) {
          console.error("Error fetching sites:", error);
          break;
        }

        if (data && data.length > 0) {
          allSites.push(...data);
          from += pageSize;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      return allSites;
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
  const { data: technicianEmails } = useQuery({
    queryKey: ["technician-emails-dashboard"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      
      const { data, error } = await supabase.functions.invoke("get-technician-emails", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      
      if (error) {
        console.error("Error fetching technician emails:", error);
        return [];
      }
      return data?.technicians || [];
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  // Build site type map and municipio map for filtering
  const siteTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    sitesData.forEach((site: { site_code: string; tipo: string }) => {
      map.set(site.site_code, site.tipo);
    });
    return map;
  }, [sitesData]);

  const siteMunicipioMap = useMemo(() => {
    const map = new Map<string, string>();
    sitesData.forEach((site: { site_code: string; municipio: string | null }) => {
      if (site.municipio) map.set(site.site_code, site.municipio);
    });
    return map;
  }, [sitesData]);

  // Filter reports by site type, site code, and municipio before processing
  const filteredReportsBySiteType = useMemo(() => {
    let result = reports;
    if (filters.siteType !== "all") {
      result = result.filter(r => siteTypeMap.get(r.site_code) === filters.siteType);
    }
    if (filters.siteCode) {
      result = result.filter(r => r.site_code === filters.siteCode);
    }
    if (filters.municipio !== "all") {
      result = result.filter(r => siteMunicipioMap.get(r.site_code) === filters.municipio);
    }
    return result;
  }, [reports, filters.siteType, filters.siteCode, filters.municipio, siteTypeMap, siteMunicipioMap]);

  // Build reverse map: email -> user_ids for technician filtering
  const emailToUserIdMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    (technicianEmails || []).forEach((t: { id: string; email: string }) => {
      const email = t.email.toLowerCase();
      if (!map.has(email)) {
        map.set(email, new Set());
      }
      map.get(email)!.add(t.id);
    });
    return map;
  }, [technicianEmails]);

  // Filter reports by technician email (applied before useDashboardStats)
  const filteredReportsByTechnician = useMemo(() => {
    if (!filters.technician || filters.technician === "all") {
      return filteredReportsBySiteType;
    }
    const targetEmail = filters.technician.toLowerCase();
    const userIds = emailToUserIdMap.get(targetEmail);
    if (!userIds || userIds.size === 0) {
      return filteredReportsBySiteType;
    }
    return filteredReportsBySiteType.filter(r => r.user_id && userIds.has(r.user_id));
  }, [filteredReportsBySiteType, filters.technician, emailToUserIdMap]);

  // Pass filters without technician (already filtered above) to avoid double filtering
  const filtersForStats = useMemo(() => ({
    ...filters,
    technician: "", // Already filtered by email above
  }), [filters]);

  // Process stats based on filters (using reports already filtered by site type and technician)
  const { stats, sites, batteries, acs, climatizacao, gabinetes } = useDashboardStats(filteredReportsByTechnician, filtersForStats);

  // Extract unique values for filter dropdowns
  const uniqueUFs = useMemo(() => {
    const ufs = new Set(reports.map((r) => r.state_uf).filter(Boolean));
    return Array.from(ufs).sort() as string[];
  }, [reports]);

  // Build a map of user_id to email for technician filter
  const technicianEmailMap = useMemo(() => {
    const map = new Map<string, string>();
    (technicianEmails || []).forEach((t: { id: string; email: string }) => {
      map.set(t.id, t.email);
    });
    return map;
  }, [technicianEmails]);

  // Extract unique technician emails from reports
  const uniqueTechnicians = useMemo(() => {
    const emailsSet = new Set<string>();
    filteredReportsBySiteType.forEach((r) => {
      if (r.user_id) {
        const email = technicianEmailMap.get(r.user_id);
        if (email) {
          emailsSet.add(email);
        }
      }
    });
    return Array.from(emailsSet).sort();
  }, [filteredReportsBySiteType, technicianEmailMap]);

  // Extract unique site types
  const uniqueSiteTypes = useMemo(() => {
    const types = new Set(sitesData.map((s: { tipo: string }) => s.tipo).filter(Boolean));
    return Array.from(types).sort() as string[];
  }, [sitesData]);

  // Extract unique site codes from filtered reports
  const uniqueSiteCodes = useMemo(() => {
    const codes = new Set(reports.map(r => r.site_code).filter(Boolean));
    return Array.from(codes).sort() as string[];
  }, [reports]);

  // Extract unique municipalities from sites data
  const uniqueMunicipios = useMemo(() => {
    const municipios = new Set(
      sitesData.map((s: { municipio: string | null }) => s.municipio).filter(Boolean) as string[]
    );
    return Array.from(municipios).sort();
  }, [sitesData]);

  // Drill-down handlers
  const openDrillDown = (
    type: "sites" | "batteries" | "acs" | "gabinetes",
    title: string,
    filterFn?: (data: any[]) => any[],
    options?: {
      allowSiteView?: boolean;
      autonomyFilter?: "ok" | "medio" | "alto" | "critico";
      obsolescenciaFilter?: "ok" | "medio" | "alto";
    }
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalFilterFn(() => filterFn || ((d: any[]) => d));
    setModalAllowSiteView(options?.allowSiteView || false);
    setModalAutonomyFilter(options?.autonomyFilter);
    setModalObsolescenciaFilter(options?.obsolescenciaFilter);
    setModalOpen(true);
  };

  // Panel navigation items
  const panelItems = [
    { id: "overview" as const, label: "Visão Geral", icon: Home },
    { id: "produtividade" as const, label: "Produtividade", icon: Users },
    { id: "bateria" as const, label: "Baterias", icon: Battery },
    { id: "climatizacao" as const, label: "Climatização", icon: Thermometer },
    { id: "fibra" as const, label: "Fibra Óptica", icon: Cable },
    { id: "zeladoria" as const, label: "Zeladoria", icon: Trash2 },
    { id: "energia" as const, label: "Energia", icon: Zap },
    { id: "gmg" as const, label: "GMG", icon: Fuel },
  ];

  // Calculate productivity stats
  const produtividadeStats = useMemo((): ProdutividadeStats => {
    const totalRealizadas = stats.totalSites;
    const totalPendentes = assignmentStats?.totalPendente || 0;
    const totalEmAndamento = assignmentStats?.totalEmAndamento || 0;
    const totalAtribuidas = totalRealizadas + totalPendentes + totalEmAndamento;
    const taxaConclusao = totalAtribuidas > 0 
      ? Math.round((totalRealizadas / totalAtribuidas) * 100) 
      : 0;

    // Total de sites na base
    const totalSitesBase = sitesData.length;
    
    // Sites únicos já vistoriados (usando site_code único) - sem filtro de técnico para mostrar progresso geral
    const sitesVistoriados = new Set(filteredReportsBySiteType.map(r => r.site_code)).size;
    
    // Sites não vistoriados = total base - sites únicos vistoriados
    const sitesNaoVistoriados = Math.max(0, totalSitesBase - sitesVistoriados);

    // Vistorias por UF from reports
    const vistoriasPorUf = stats.ufDistribution.map(uf => ({
      uf: uf.name,
      count: uf.count
    })).sort((a, b) => b.count - a.count);

    // Map technician emails and area_atuacao to ranking
    const emailMap = new Map<string, string>(
      (technicianEmails || []).map((t: { id: string; email: string }) => [t.id, t.email] as [string, string])
    );
    
    const areaMap = new Map<string, 'PI' | 'REDE' | null>(
      (technicianEmails || []).map((t: { id: string; email: string; area_atuacao?: string | null }) => 
        [t.id, (t.area_atuacao as 'PI' | 'REDE' | null) || null] as [string, 'PI' | 'REDE' | null]
      )
    );
    
    const technicianRankingWithEmails = stats.technicianRanking.map(tech => ({
      ...tech,
      email: emailMap.get(tech.id) as string | undefined,
      areaAtuacao: areaMap.get(tech.id) as 'PI' | 'REDE' | null | undefined
    }));

    return {
      totalRealizadas,
      totalPendentes,
      totalEmAndamento,
      taxaConclusao,
      mediaPorTecnico: stats.mediaPorTecnico,
      totalSitesBase,
      sitesNaoVistoriados,
      technicianRanking: technicianRankingWithEmails,
      vistoriasPorMes: stats.vistoriasPorMes,
      vistoriasPorDia: stats.vistoriasPorDia,
      vistoriasPorDiaTecnico: stats.vistoriasPorDiaTecnico,
      vistoriasPorDiaUf: stats.vistoriasPorDiaUf,
      vistoriasPorUf,
      assignmentsByUf: assignmentStats?.byUf || []
    };
  }, [stats, assignmentStats, technicianEmails, sitesData, filteredReportsBySiteType]);

  // Calculate fiber stats from reports
  const fibraStats = useMemo((): FibraStats => {
    let abordagensAereas = 0;
    let abordagensSubterraneas = 0;
    let totalCaixasPassagem = 0;
    let totalCaixasSubterraneas = 0;
    let totalSubidasLaterais = 0;
    let totalDGOs = 0;
    let dgosOk = 0;
    let dgosNok = 0;
    let sitesWithFibra = 0;
    let sitesDesprotegidos = 0; // 1 abordagem
    let sitesProtegidos = 0; // 2 abordagens

    reports.forEach(report => {
      const qtdAbord = (report as any).fibra_qtd_abordagens || 0;
      if (qtdAbord > 0) {
        sitesWithFibra++;
        
        // Contabilizar sites protegidos vs desprotegidos
        if (qtdAbord === 1) {
          sitesDesprotegidos++;
        } else if (qtdAbord >= 2) {
          sitesProtegidos++;
        }
        
        // Count all abordagens (up to 4)
        for (let i = 1; i <= Math.min(qtdAbord, 4); i++) {
          const tipoAbord = (report as any)[`fibra_abord${i}_tipo`];
          if (tipoAbord === 'AÉREA') abordagensAereas++;
          else if (tipoAbord === 'SUBTERRÂNEA') abordagensSubterraneas++;
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
      sitesProtegidos,
      sitesDesprotegidos,
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
      protecaoChart: [
        { name: "Protegidos (2+ abord.)", value: sitesProtegidos, color: "#22c55e" },
        { name: "Desprotegidos (1 abord.)", value: sitesDesprotegidos, color: "#f59e0b" },
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

          <p className="text-xs text-muted-foreground mb-2 px-2 mt-6">Gestão</p>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => navigate("/atribuicoes")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                Atribuir Vistorias
              </button>
            </li>
            {isAdmin && (
              <>
                <li>
                  <button
                    onClick={() => navigate("/sites")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    Gestão de Sites
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/usuarios")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <UserCog className="w-4 h-4" />
                    Gerenciar Usuários
                  </button>
                </li>
              </>
            )}
            <li>
              <button
                onClick={() => navigate("/historico")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileText className="w-4 h-4" />
                Relatórios
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Checklist
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

          {/* Mobile Action Buttons */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
            <button
              onClick={() => navigate("/atribuicoes")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-white/20 text-white/90 hover:bg-white/30 transition-colors"
            >
              <ClipboardList className="w-3 h-3" />
              Vistorias
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => navigate("/sites")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-white/20 text-white/90 hover:bg-white/30 transition-colors"
                >
                  <Building2 className="w-3 h-3" />
                  Sites
                </button>
                <button
                  onClick={() => navigate("/usuarios")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-white/20 text-white/90 hover:bg-white/30 transition-colors"
                >
                  <UserCog className="w-3 h-3" />
                  Usuários
                </button>
              </>
            )}
            <button
              onClick={() => navigate("/historico")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-white/20 text-white/90 hover:bg-white/30 transition-colors"
            >
              <FileText className="w-3 h-3" />
              Relatórios
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-white/20 text-white/90 hover:bg-white/30 transition-colors"
            >
              <MapPin className="w-3 h-3" />
              Checklist
            </button>
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
        <header className="hidden lg:block border-b border-border bg-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard Executivo</h1>
              <p className="text-muted-foreground">Análise completa da infraestrutura de telecomunicações</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          {/* Action buttons bar */}
          <div className="flex items-center gap-2 px-6 pb-3 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate("/atribuicoes")}>
              <ClipboardList className="w-4 h-4 mr-1.5" />
              Atribuir Vistorias
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate("/sites")}>
                  <Building2 className="w-4 h-4 mr-1.5" />
                  Gestão de Sites
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/usuarios")}>
                  <UserCog className="w-4 h-4 mr-1.5" />
                  Gerenciar Usuários
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate("/historico")}>
              <FileText className="w-4 h-4 mr-1.5" />
              Relatórios
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <MapPin className="w-4 h-4 mr-1.5" />
              Checklist
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
            uniqueSiteTypes={uniqueSiteTypes}
            uniqueSiteCodes={uniqueSiteCodes}
            uniqueMunicipios={uniqueMunicipios}
            showOperadoraFilter={isVivoUser}
            showAreaAtuacaoFilter={false}
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
                    else if (type === "nok") openDrillDown("sites", "Sites com Problemas", (s) => s.filter((site: any) => site.hasProblems));
                    else if (type === "batteries") openDrillDown("batteries", "Todas as Baterias", (b) => b);
                    else if (type === "batteries-critical") openDrillDown("batteries", "Baterias Críticas (+8 anos)", (b) => b.filter((bat: any) => bat.obsolescencia === "critical"));
                    else if (type === "acs") openDrillDown("acs", "Todos os Ar Condicionados", (a) => a);
                    else if (type === "acs-nok") openDrillDown("acs", "Ar Condicionados com Defeito", (a) => a.filter((ac: any) => ac.status === "NOK"));
                    else if (type === "gmg") openDrillDown("sites", "Sites com GMG", (s) => s.filter((site: any) => site.gmgExists));
                    else if (type === "zeladoria-ok") openDrillDown("sites", "Zeladoria OK", (s) => s.filter((site: any) => site.zeladoriaOk));
                  }}
                />
              )}

              {activePanel === "produtividade" && (
                <ProdutividadePanel
                  stats={produtividadeStats}
                  areaAtuacaoFilter={filters.areaAtuacao}
                  onAreaAtuacaoChange={(value) => setFilters({ ...filters, areaAtuacao: value })}
                  onDrillDown={(type) => {
                    if (type === "realizadas") openDrillDown("sites", "Vistorias Realizadas", (s) => s);
                    else if (type === "pendentes") openDrillDown("sites", "Sites com Atribuições Pendentes", (s) => s);
                    else if (type === "nao-vistoriados") openDrillDown("sites", "Sites Não Vistoriados", () => []);
                    else if (type === "base") openDrillDown("sites", "Todos os Sites da Base", (s) => s);
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
                  onDrillDown={(type) => {
                    if (type === "transformador-ok") openDrillDown("sites", "Transformador OK", (s) => s.filter((site: any) => {
                      const report = reports.find(r => r.id === site.id);
                      return report && report.energia_transformador_ok === "SIM";
                    }));
                    else if (type === "transformador-nok") openDrillDown("sites", "Transformador NOK", (s) => s.filter((site: any) => {
                      const report = reports.find(r => r.id === site.id);
                      return report && (report.energia_transformador_ok === "NÃO" || report.energia_transformador_ok === "NAO");
                    }));
                    else if (type === "gradil-ok") openDrillDown("sites", "Sites com Gradil", (s) => s.filter((site: any) => {
                      const report = reports.find(r => r.id === site.id);
                      return report && report.energia_protegido_gradil === "SIM";
                    }));
                    else if (type === "gradil-nok") openDrillDown("sites", "Sites sem Gradil", (s) => s.filter((site: any) => {
                      const report = reports.find(r => r.id === site.id);
                      return report && (report.energia_protegido_gradil === "NÃO" || report.energia_protegido_gradil === "NAO");
                    }));
                    else if (type === "cadeado-ok") openDrillDown("sites", "Sites com Cadeado", (s) => s.filter((site: any) => {
                      const report = reports.find(r => r.id === site.id);
                      return report && report.energia_protegido_cadeado === "SIM";
                    }));
                    else if (type === "cadeado-nok") openDrillDown("sites", "Sites sem Cadeado", (s) => s.filter((site: any) => {
                      const report = reports.find(r => r.id === site.id);
                      return report && (report.energia_protegido_cadeado === "NÃO" || report.energia_protegido_cadeado === "NAO");
                    }));
                  }}
                />
              )}

              {activePanel === "gmg" && (
                <GMGPanel
                  stats={stats}
                  onDrillDown={(type) => {
                    if (type === "gmg") openDrillDown("sites", "Sites com GMG", (s) => s.filter((site: any) => site.gmgExists));
                    else if (type === "gmg-no") openDrillDown("sites", "Sites sem GMG", (s) => s.filter((site: any) => !site.gmgExists));
                    else if (type === "gmg-ok") openDrillDown("sites", "GMG Operacional (OK)", (s) => s.filter((site: any) => {
                      const report = reports.find(r => r.id === site.id);
                      return report && report.gmg_existe === "SIM" && report.gmg_status === "OK";
                    }));
                    else if (type === "gmg-nok") openDrillDown("sites", "GMG Inoperante (NOK)", (s) => s.filter((site: any) => {
                      const report = reports.find(r => r.id === site.id);
                      return report && report.gmg_existe === "SIM" && report.gmg_status === "NOK";
                    }));
                    else if (type === "gmg-alarme") openDrillDown("sites", "GMG com Alarme Ativo", (s) => s.filter((site: any) => {
                      const report = reports.find(r => r.id === site.id);
                      return report && report.gmg_alarme_ativo === "SIM";
                    }));
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
                    else if (type === "ac") openDrillDown("sites", "Sites com Ar Condicionado", (s) => s);
                    else if (type === "fan") openDrillDown("sites", "Sites com Ventilação/Fan", (s) => s);
                    else if (type === "ac-ok") openDrillDown("acs", "Ar Condicionados OK", (a) => a.filter((ac: any) => ac.status === "OK"));
                    else if (type === "ac-nok") openDrillDown("acs", "Ar Condicionados NOK", (a) => a.filter((ac: any) => ac.status === "NOK"));
                    else if (type === "plc-ok") openDrillDown("sites", "Sites com PLC OK", (s) => s);
                    else if (type === "plc-nok") openDrillDown("sites", "Sites com PLC NOK", (s) => s);
                    else if (type === "na") openDrillDown("sites", "Sites sem Climatização", (s) => s);
                  }}
                />
              )}

              {activePanel === "zeladoria" && (
                <ZeladoriaPanel
                  stats={stats}
                  sites={sites}
                  onDrillDown={(type) => {
                    if (type === "zeladoria") openDrillDown("sites", "Zeladoria OK", (s) => s.filter((site: any) => site.zeladoriaOk));
                    else if (type === "zeladoria_nok") openDrillDown("sites", "Zeladoria NOK", (s) => s.filter((site: any) => !site.zeladoriaOk));
                    else if (type === "aterramento") openDrillDown("sites", "Aterramento OK", (s) => s);
                    else if (type === "aterramento_nok") openDrillDown("sites", "Aterramento NOK", (s) => s);
                  }}
                />
              )}

              {activePanel === "bateria" && (
                <BateriaPanel
                  stats={stats}
                  batteries={batteries}
                  onDrillDown={(type, uf) => {
                    // Basic types
                    if (type === "all") openDrillDown("batteries", "Todas as Baterias", (b) => b);
                    else if (type === "ok") openDrillDown("batteries", "Baterias OK", (b) => b.filter((bat: any) => bat.estado === "BOA"));
                    else if (type === "nok") openDrillDown("batteries", "Baterias com Defeito", (b) => b.filter((bat: any) => bat.estado !== "BOA"));
                    else if (type === "obsolete-warning") openDrillDown("batteries", "Baterias Médio Risco Obsolescência", (b) => b.filter((bat: any) => bat.obsolescencia === "warning"));
                    else if (type === "obsolete-critical") openDrillDown("batteries", "Baterias +8 anos (CRÍTICO)", (b) => b.filter((bat: any) => bat.obsolescencia === "critical"));
                    // Autonomy types - show GABINETES (with site view toggle)
                    else if (type === "autonomy-ok") openDrillDown("gabinetes", "Autonomia OK", (g) => g.filter((gab: any) => gab.autonomyRisk === "ok"), { allowSiteView: true, autonomyFilter: "ok" });
                    else if (type === "autonomy-medio") openDrillDown("gabinetes", "Médio Risco Autonomia", (g) => g.filter((gab: any) => gab.autonomyRisk === "medio"), { allowSiteView: true, autonomyFilter: "medio" });
                    else if (type === "autonomy-alto") openDrillDown("gabinetes", "Alto Risco Autonomia", (g) => g.filter((gab: any) => gab.autonomyRisk === "alto"), { allowSiteView: true, autonomyFilter: "alto" });
                    else if (type === "autonomy-critico") openDrillDown("gabinetes", "Autonomia Crítica", (g) => g.filter((gab: any) => gab.autonomyRisk === "critico"), { allowSiteView: true, autonomyFilter: "critico" });
                    // Chumbo/Litio types - use tipoClassificado
                    else if (type === "chumbo-all") openDrillDown("batteries", "Baterias de Chumbo", (b) => b.filter((bat: any) => bat.tipoClassificado === "chumbo"));
                    else if (type === "chumbo-uf" && uf) openDrillDown("batteries", `Baterias de Chumbo - ${uf}`, (b) => b.filter((bat: any) => bat.uf === uf && bat.tipoClassificado === "chumbo"));
                    else if (type === "litio-all") openDrillDown("batteries", "Baterias de Lítio", (b) => b.filter((bat: any) => bat.tipoClassificado === "litio"));
                    else if (type === "litio-uf" && uf) openDrillDown("batteries", `Baterias de Lítio - ${uf}`, (b) => b.filter((bat: any) => bat.uf === uf && bat.tipoClassificado === "litio"));
                    // Troca types - use needsReplacement field
                    else if (type === "troca-all") openDrillDown("batteries", "Baterias para Troca (Região Norte)", (b) => {
                      const ufsNorte = ["PA", "MA", "AM", "RR", "AP"];
                      return b.filter((bat: any) => ufsNorte.includes(bat.uf) && bat.needsReplacement);
                    });
                    else if (type === "troca-uf" && uf) openDrillDown("batteries", `Baterias para Troca - ${uf}`, (b) => b.filter((bat: any) => bat.uf === uf && bat.needsReplacement));
                    // Obsolescence unified types - show GABINETES (with site view toggle)
                    else if (type === "obsolete-ok") openDrillDown("gabinetes", "Obsolescência OK", (g) => g.filter((gab: any) => gab.obsolescenciaRisk === "ok"), { allowSiteView: true, obsolescenciaFilter: "ok" });
                    else if (type === "obsolete-medio") openDrillDown("gabinetes", "Médio Risco Obsolescência", (g) => g.filter((gab: any) => gab.obsolescenciaRisk === "medio"), { allowSiteView: true, obsolescenciaFilter: "medio" });
                    else if (type === "obsolete-alto") openDrillDown("gabinetes", "Alto Risco Obsolescência", (g) => g.filter((gab: any) => gab.obsolescenciaRisk === "alto"), { allowSiteView: true, obsolescenciaFilter: "alto" });
                  }}
                />
              )}

              {activePanel === "fibra" && (
                <FibraOpticaPanel 
                  stats={fibraStats} 
                  onDrillDown={(type) => {
                    if (type === "protegidos") {
                      openDrillDown("sites", "Sites Protegidos (2 abordagens)", (s) => 
                        s.filter((site: any) => {
                          const report = reports.find(r => r.id === site.id);
                          return report && (report as any).fibra_qtd_abordagens >= 2;
                        })
                      );
                    } else if (type === "desprotegidos") {
                      openDrillDown("sites", "Sites Desprotegidos (1 abordagem)", (s) => 
                        s.filter((site: any) => {
                          const report = reports.find(r => r.id === site.id);
                          return report && (report as any).fibra_qtd_abordagens === 1;
                        })
                      );
                    } else if (type === "dgos-ok") {
                      openDrillDown("sites", "Sites com DGOs OK", (s) => 
                        s.filter((site: any) => {
                          const report = reports.find(r => r.id === site.id);
                          return report && ((report as any).fibra_dgos_ok_qtd || 0) > 0;
                        })
                      );
                    } else if (type === "dgos-nok") {
                      openDrillDown("sites", "Sites com DGOs NOK", (s) => 
                        s.filter((site: any) => {
                          const report = reports.find(r => r.id === site.id);
                          return report && ((report as any).fibra_dgos_nok_qtd || 0) > 0;
                        })
                      );
                    } else {
                      openDrillDown("sites", "Todos os Sites com Fibra", (s) => 
                        s.filter((site: any) => {
                          const report = reports.find(r => r.id === site.id);
                          return report && ((report as any).fibra_qtd_abordagens || 0) > 0;
                        })
                      );
                    }
                  }}
                />
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
        sites={modalAllowSiteView || modalType === "sites" ? modalFilterFn(sites) : undefined}
        batteries={modalType === "batteries" ? modalFilterFn(batteries) : undefined}
        acs={modalType === "acs" ? modalFilterFn(acs) : undefined}
        gabinetes={modalType === "gabinetes" ? modalFilterFn(gabinetes) : undefined}
        allowSiteView={modalAllowSiteView}
        autonomyFilter={modalAutonomyFilter}
        obsolescenciaFilter={modalObsolescenciaFilter}
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
