import { ReportRow } from "@/lib/reportDatabase";

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined };
  technician: string;
  stateUf: string;
  status: "all" | "ok" | "nok";
}

export interface BatteryInfo {
  siteCode: string;
  uf: string;
  gabinete: number;
  banco: number;
  fabricante: string;
  tipo: string;
  capacidade: string;
  dataFabricacao: string;
  estado: string;
  idade: number;
  obsolescencia: "ok" | "warning" | "critical";
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

export interface PanelStats {
  // Overview Panel
  overview: OverviewStats;
  
  // DGOS Panel
  totalSites: number;
  sitesOk: number;
  sitesNok: number;
  percentOk: number;
  vistoriasPorMes: { month: string; count: number }[];
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
}

export interface DrillDownData {
  type: "sites" | "batteries" | "acs" | "zeladoria" | "climatizacao" | "overview";
  title: string;
  sites?: SiteInfo[];
  batteries?: BatteryInfo[];
  acs?: ACInfo[];
  climatizacao?: ClimatizacaoInfo[];
}
