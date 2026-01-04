import { useMemo } from "react";
import { ReportRow } from "@/lib/reportDatabase";
import { DashboardFilters, PanelStats, SiteInfo, BatteryInfo, ACInfo } from "./types";
import { format, parse, isValid, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";

const CURRENT_YEAR = 2026;

function parseManufactureDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  
  // Try MM/YYYY format
  const match = dateStr.match(/^(\d{2})\/(\d{4})$/);
  if (match) {
    const month = parseInt(match[1], 10) - 1;
    const year = parseInt(match[2], 10);
    return new Date(year, month, 1);
  }
  
  // Try YYYY format
  const yearMatch = dateStr.match(/^(\d{4})$/);
  if (yearMatch) {
    return new Date(parseInt(yearMatch[1], 10), 0, 1);
  }
  
  return null;
}

function calculateBatteryAge(dateStr: string | null): number {
  const date = parseManufactureDate(dateStr);
  if (!date || !isValid(date)) return 0;
  return differenceInYears(new Date(CURRENT_YEAR, 0, 1), date);
}

function getObsolescenceStatus(age: number): "ok" | "warning" | "critical" {
  if (age >= 8) return "critical";
  if (age >= 5) return "warning";
  return "ok";
}

export function useDashboardStats(reports: ReportRow[], filters: DashboardFilters) {
  return useMemo(() => {
    // Apply filters
    let filtered = reports;
    
    if (filters.technician) {
      filtered = filtered.filter(r => 
        r.technician_name?.toLowerCase().includes(filters.technician.toLowerCase())
      );
    }
    
    if (filters.stateUf && filters.stateUf !== "all") {
      filtered = filtered.filter(r => r.state_uf === filters.stateUf);
    }
    
    if (filters.dateRange.from) {
      filtered = filtered.filter(r => {
        const d = new Date(r.created_at || '');
        return isValid(d) && d >= (filters.dateRange.from as Date);
      });
    }
    
    if (filters.dateRange.to) {
      filtered = filtered.filter(r => {
        const d = new Date(r.created_at || '');
        return isValid(d) && d <= (filters.dateRange.to as Date);
      });
    }

    // Initialize stats
    const stats: PanelStats = {
      totalSites: filtered.length,
      sitesOk: 0,
      sitesNok: 0,
      percentOk: 0,
      vistoriasPorMes: [],
      ufDistribution: [],
      totalACs: 0,
      acsOk: 0,
      acsNok: 0,
      sitesWithGMG: 0,
      sitesWithoutGMG: 0,
      energiaStatus: [],
      zeladoriaOk: 0,
      zeladoriaTotal: filtered.length,
      fibraProtegida: 0,
      fibraTotal: filtered.length,
      aterramentoOk: 0,
      climatizacaoStatus: [],
      totalBatteries: 0,
      batteriesOk: 0,
      batteriesNok: 0,
      batteriesOver5Years: 0,
      batteriesOver8Years: 0,
      batteryStateChart: [],
      batteryAgeChart: [],
    };

    const siteInfoList: SiteInfo[] = [];
    const batteryInfoList: BatteryInfo[] = [];
    const acInfoList: ACInfo[] = [];
    
    const ufMap: Record<string, { count: number; ok: number; nok: number }> = {};
    const monthMap: Record<string, number> = {};
    const batteryStates = { ok: 0, estufada: 0, vazando: 0, trincada: 0, semCarga: 0 };
    const batteryAges = { ok: 0, warning: 0, critical: 0 };
    const climatizationTypes = { ac: 0, fan: 0, na: 0 };

    filtered.forEach((report) => {
      const uf = report.state_uf || "N/A";
      let hasProblems = false;
      let batteryIssues = 0;
      let acIssues = 0;
      
      // UF Distribution
      if (!ufMap[uf]) ufMap[uf] = { count: 0, ok: 0, nok: 0 };
      ufMap[uf].count++;
      
      // Monthly distribution
      if (report.created_at) {
        const d = new Date(report.created_at);
        if (isValid(d)) {
          const monthKey = format(d, "MMM/yy", { locale: ptBR });
          monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
        }
      }
      
      // GMG
      if (report.gmg_existe === "SIM") {
        stats.sitesWithGMG++;
      } else {
        stats.sitesWithoutGMG++;
      }
      
      // Zeladoria
      if (report.torre_housekeeping === "OK") {
        stats.zeladoriaOk++;
      }
      
      // Fibra protection
      if (report.torre_protecao_fibra === "SIM") {
        stats.fibraProtegida++;
      }
      
      // Aterramento
      if (report.torre_aterramento === "OK") {
        stats.aterramentoOk++;
      }

      // Process gabinetes
      for (let g = 1; g <= 7; g++) {
        const prefix = `gab${g}`;
        
        // Climatization type
        const climaTipo = report[`${prefix}_climatizacao_tipo`] as string;
        if (climaTipo) {
          if (climaTipo.includes("AR CONDICIONADO")) climatizationTypes.ac++;
          else if (climaTipo.includes("FAN")) climatizationTypes.fan++;
          else climatizationTypes.na++;
        }
        
        // ACs (4 per gabinete)
        for (let a = 1; a <= 4; a++) {
          const modelo = report[`${prefix}_ac${a}_modelo`] as string;
          const status = report[`${prefix}_ac${a}_status`] as string;
          
          if (modelo && modelo !== "NA") {
            stats.totalACs++;
            if (status === "OK") {
              stats.acsOk++;
            } else if (status === "NOK") {
              stats.acsNok++;
              acIssues++;
              hasProblems = true;
            }
            
            acInfoList.push({
              siteCode: report.site_code,
              uf,
              gabinete: g,
              acNum: a,
              modelo,
              status: status || "N/A",
            });
          }
        }
        
        // Batteries (6 per gabinete)
        for (let b = 1; b <= 6; b++) {
          const tipo = report[`${prefix}_bat${b}_tipo`] as string;
          const fabricante = report[`${prefix}_bat${b}_fabricante`] as string;
          const capacidade = report[`${prefix}_bat${b}_capacidade`] as string;
          const dataFab = report[`${prefix}_bat${b}_data_fabricacao`] as string;
          const estado = report[`${prefix}_bat${b}_estado`] as string;
          
          if (tipo && tipo !== "NA" && fabricante) {
            stats.totalBatteries++;
            const idade = calculateBatteryAge(dataFab);
            const obsolescencia = getObsolescenceStatus(idade);
            
            if (obsolescencia === "warning") stats.batteriesOver5Years++;
            if (obsolescencia === "critical") stats.batteriesOver8Years++;
            batteryAges[obsolescencia]++;
            
            if (estado === "OK" || !estado) {
              stats.batteriesOk++;
              batteryStates.ok++;
            } else {
              stats.batteriesNok++;
              batteryIssues++;
              hasProblems = true;
              
              const estadoLower = estado.toLowerCase();
              if (estadoLower.includes("estufada")) batteryStates.estufada++;
              if (estadoLower.includes("vazando")) batteryStates.vazando++;
              if (estadoLower.includes("trincada")) batteryStates.trincada++;
              if (estadoLower.includes("carga")) batteryStates.semCarga++;
            }
            
            batteryInfoList.push({
              siteCode: report.site_code,
              uf,
              gabinete: g,
              banco: b,
              fabricante,
              tipo,
              capacidade: capacidade || "N/A",
              dataFabricacao: dataFab || "N/A",
              estado: estado || "OK",
              idade,
              obsolescencia,
            });
          }
        }
      }
      
      if (hasProblems) {
        stats.sitesNok++;
        ufMap[uf].nok++;
      } else {
        stats.sitesOk++;
        ufMap[uf].ok++;
      }
      
      siteInfoList.push({
        id: report.id || '',
        siteCode: report.site_code,
        uf,
        technician: report.technician_name || "N/A",
        date: report.created_date,
        time: report.created_time,
        totalCabinets: report.total_cabinets,
        hasProblems,
        gmgExists: report.gmg_existe === "SIM",
        batteryIssues,
        acIssues,
        zeladoriaOk: report.torre_housekeeping === "OK",
      });
    });

    // Calculate percentages
    stats.percentOk = stats.totalSites > 0 
      ? Math.round((stats.sitesOk / stats.totalSites) * 100) 
      : 0;

    // Build chart data
    stats.ufDistribution = Object.entries(ufMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);

    stats.vistoriasPorMes = Object.entries(monthMap)
      .map(([month, count]) => ({ month, count }))
      .slice(-6);

    stats.batteryStateChart = [
      { name: "OK", value: batteryStates.ok, color: "hsl(var(--success))" },
      { name: "Estufada", value: batteryStates.estufada, color: "#f59e0b" },
      { name: "Vazando", value: batteryStates.vazando, color: "#3b82f6" },
      { name: "Trincada", value: batteryStates.trincada, color: "#ef4444" },
      { name: "Sem Carga", value: batteryStates.semCarga, color: "#8b5cf6" },
    ].filter(item => item.value > 0);

    stats.batteryAgeChart = [
      { name: "<5 anos", value: batteryAges.ok, color: "hsl(var(--success))" },
      { name: "5-8 anos", value: batteryAges.warning, color: "#f59e0b" },
      { name: ">8 anos", value: batteryAges.critical, color: "#ef4444" },
    ].filter(item => item.value > 0);

    stats.energiaStatus = [
      { name: "Com GMG", value: stats.sitesWithGMG, color: "hsl(var(--success))" },
      { name: "Sem GMG", value: stats.sitesWithoutGMG, color: "hsl(var(--warning))" },
    ].filter(item => item.value > 0);

    stats.climatizacaoStatus = [
      { name: "Ar Condicionado", value: climatizationTypes.ac, color: "hsl(var(--primary))" },
      { name: "Ventilador", value: climatizationTypes.fan, color: "#8b5cf6" },
      { name: "N/A", value: climatizationTypes.na, color: "hsl(var(--muted))" },
    ].filter(item => item.value > 0);

    // Apply status filter
    let finalSites = siteInfoList;
    let finalBatteries = batteryInfoList;
    let finalACs = acInfoList;
    
    if (filters.status === "ok") {
      finalSites = siteInfoList.filter(s => !s.hasProblems);
      finalBatteries = batteryInfoList.filter(b => b.estado === "OK");
      finalACs = acInfoList.filter(a => a.status === "OK");
    } else if (filters.status === "nok") {
      finalSites = siteInfoList.filter(s => s.hasProblems);
      finalBatteries = batteryInfoList.filter(b => b.estado !== "OK");
      finalACs = acInfoList.filter(a => a.status === "NOK");
    }

    return {
      stats,
      sites: finalSites,
      batteries: finalBatteries,
      acs: finalACs,
    };
  }, [reports, filters]);
}
