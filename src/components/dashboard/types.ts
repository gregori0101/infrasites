import { ReportRow } from "@/lib/reportDatabase";

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined };
  technician: string;
  stateUf: string;
  status: "all" | "ok" | "nok";
  siteType: string; // e.g., "DWDM", "HL3", "HL4", "all"
}

export interface BatteryInfo {
  siteCode: string;
  uf: string;
  gabinete: number;
  banco: number;
  fabricante: string;
  tipo: string;
  tipoClassificado: "chumbo" | "litio" | "outro"; // Classified battery type
  capacidade: string;
  dataFabricacao: string;
  estado: string;
  idade: number;
  obsolescencia: "ok" | "warning" | "critical";
  obsolescenciaTipo: "ok" | "medio" | "alto"; // Based on battery type rules
  autonomyRisk: "ok" | "medio" | "alto" | "critico"; // Autonomy classification for the gabinete
  needsReplacement: boolean; // Whether battery needs replacement
}

export interface ACInfo {
  siteCode: string;
  uf: string;
  gabinete: number;
  acNum: number;
  modelo: string;
  status: string;
}

export interface ClimatizacaoInfo {
  siteCode: string;
  uf: string;
  gabinete: number;
  tipo: string;
  fanStatus: string;
  plcStatus: string;
  alarmeStatus: string;
  acs: ACInfo[];
}

export interface GabineteInfo {
  siteCode: string;
  uf: string;
  gabinete: number;
  autonomyRisk: "ok" | "medio" | "alto" | "critico";
  obsolescenciaRisk: "ok" | "medio" | "alto" | "sem_banco";
  hasGMG: boolean;
  autonomyHours: number;
  totalBatteries: number;
  batteryTypes: string[]; // e.g., ["chumbo", "litio"]
}

export interface SiteInfo {
  id: string;
  siteCode: string;
  uf: string;
  technician: string;
  date: string;
  time: string;
  totalCabinets: number;
  hasProblems: boolean;
  gmgExists: boolean;
  batteryIssues: number;
  acIssues: number;
  climatizacaoIssues: number;
  zeladoriaOk: boolean;
  autonomyRisk?: "ok" | "medio" | "alto" | "critico";
  obsolescenciaRisk?: "ok" | "medio" | "alto" | "sem_banco";
}

export interface OverviewStats {
  totalSites: number;
  sitesOk: number;
  sitesNok: number;
  percentOk: number;
  totalBatteries: number;
  batteriesOk: number;
  batteriesCritical: number;
  totalACs: number;
  acsOk: number;
  acsNok: number;
  sitesWithGMG: number;
  zeladoriaOkCount: number;
  lastUpdate: string;
}

export interface TechnicianRanking {
  id: string;
  name: string;
  email?: string;
  count: number;
  mainUf: string;
}

export interface UfAssignmentStats {
  uf: string;
  totalSites: number;
  concluidas: number;
  emAndamento: number;
  pendentes: number;
  semAtribuicao: number;
}

export interface AutonomyRiskStats {
  // Per gabinete - unified (all, regardless of GMG)
  gabinetesOk: number;
  gabinetesMedioRisco: number;
  gabinetesAltoRisco: number;
  gabinetesCritico: number;
  // Per site - unified (all, regardless of GMG)
  sitesOk: number;
  sitesMedioRisco: number;
  sitesAltoRisco: number;
  sitesCritico: number;
}

export interface PanelStats {
  // Overview Panel
  overview: OverviewStats;
  
  // DGOS Panel
  totalSites: number;
  sitesOk: number;
  sitesNok: number;
  percentOk: number;
  vistoriasPorMes: { month: string; count: number }[];
  vistoriasPorDia: { day: string; count: number }[];
  vistoriasPorDiaTecnico: { day: string; technician: string; technicianId: string; count: number }[];
  vistoriasPorDiaUf: { day: string; uf: string; count: number }[];
  ufDistribution: { name: string; count: number; ok: number; nok: number }[];
  
  // AC/Energia Panel
  totalACs: number;
  acsOk: number;
  acsNok: number;
  sitesWithGMG: number;
  sitesWithoutGMG: number;
  energiaStatus: { name: string; value: number; color: string }[];
  
  // Zeladoria Panel
  zeladoriaOk: number;
  zeladoriaTotal: number;
  aterramentoOk: number;
  climatizacaoStatus: { name: string; value: number; color: string }[];
  
  // Battery Panel
  totalBatteries: number;
  batteriesOk: number;
  batteriesNok: number;
  batteriesOver5Years: number;
  batteriesOver8Years: number;
  batteryStateChart: { name: string; value: number; color: string }[];
  batteryAgeChart: { name: string; value: number; color: string }[];
  
  // Autonomy Risk (New)
  autonomyRisk: AutonomyRiskStats;
  
  // Obsolescence - unified (Chumbo + Lítio combined)
  obsolescencia: {
    gabinetesOk: number;
    gabinetesMedioRisco: number;
    gabinetesAltoRisco: number;
    gabinetesSemBanco: number;
    sitesOk: number;
    sitesMedioRisco: number;
    sitesAltoRisco: number;
    sitesSemBanco: number;
  };
  
  // Climatização Panel
  climatizacaoTotal: number;
  acTotal: number;
  fanTotal: number;
  naTotal: number;
  acsOkCount: number;
  acsNokCount: number;
  fanOkCount: number;
  fanNokCount: number;
  plcOkCount: number;
  plcNokCount: number;
  climatizacaoChart: { name: string; value: number; color: string }[];

  // Produtividade Panel
  technicianRanking: TechnicianRanking[];
  mediaPorTecnico: number;

  // Baterias por tipo
  bateriasChumboTotal: number;
  bateriasChumboByUf: { uf: string; count: number }[];
  bateriasLitioTotal: number;
  bateriasLitioByUf: { uf: string; count: number }[];

  // Baterias para troca (região Norte)
  bateriasParaTroca: {
    total: number;
    byUf: { uf: string; count: number }[];
  };
}

export interface DrillDownData {
  type: "sites" | "batteries" | "acs" | "zeladoria" | "climatizacao" | "overview";
  title: string;
  sites?: SiteInfo[];
  batteries?: BatteryInfo[];
  acs?: ACInfo[];
  climatizacao?: ClimatizacaoInfo[];
}
