import { useMemo } from "react";
import { ReportRow } from "@/lib/reportDatabase";
import { DashboardFilters, PanelStats, SiteInfo, BatteryInfo, ACInfo, ClimatizacaoInfo, OverviewStats } from "./types";
import { format, isValid, differenceInYears, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

const CURRENT_YEAR = 2026;

function parseManufactureDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  
  // Try YYYY-MM-DD format
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
  }
  
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
    
    if (filters.technician && filters.technician !== "all") {
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
      overview: {
        totalSites: 0,
        sitesOk: 0,
        sitesNok: 0,
        percentOk: 0,
        totalBatteries: 0,
        batteriesOk: 0,
        batteriesCritical: 0,
        totalACs: 0,
        acsOk: 0,
        acsNok: 0,
        sitesWithGMG: 0,
        zeladoriaOkCount: 0,
        lastUpdate: "N/A"
      },
      totalSites: filtered.length,
      sitesOk: 0,
      sitesNok: 0,
      percentOk: 0,
      vistoriasPorMes: [],
      vistoriasPorDia: [],
      vistoriasPorDiaTecnico: [],
      vistoriasPorDiaUf: [],
      ufDistribution: [],
      totalACs: 0,
      acsOk: 0,
      acsNok: 0,
      sitesWithGMG: 0,
      sitesWithoutGMG: 0,
      energiaStatus: [],
      zeladoriaOk: 0,
      zeladoriaTotal: filtered.length,
      aterramentoOk: 0,
      climatizacaoStatus: [],
      totalBatteries: 0,
      batteriesOk: 0,
      batteriesNok: 0,
      batteriesOver5Years: 0,
      batteriesOver8Years: 0,
      batteryStateChart: [],
      batteryAgeChart: [],
      // Climatização
      climatizacaoTotal: 0,
      acTotal: 0,
      fanTotal: 0,
      naTotal: 0,
      acsOkCount: 0,
      acsNokCount: 0,
      fanOkCount: 0,
      fanNokCount: 0,
      plcOkCount: 0,
      plcNokCount: 0,
      climatizacaoChart: [],
      // Produtividade
      technicianRanking: [],
      mediaPorTecnico: 0
    };

    const siteInfoList: SiteInfo[] = [];
    const batteryInfoList: BatteryInfo[] = [];
    const acInfoList: ACInfo[] = [];
    const climatizacaoList: ClimatizacaoInfo[] = [];
    
    const ufMap: Record<string, { count: number; ok: number; nok: number }> = {};
    const monthMap: Record<string, number> = {};
    const dayMap: Record<string, number> = {};
    const dayTechnicianMap: Record<string, Record<string, { count: number; name: string }>> = {};
    const dayUfMap: Record<string, Record<string, number>> = {};
    const batteryStates = { ok: 0, estufada: 0, vazando: 0, trincada: 0, semCarga: 0 };
    const batteryAges = { ok: 0, warning: 0, critical: 0 };
    const technicianMap: Record<string, { count: number; ufs: Record<string, number>; name: string }> = {};

    filtered.forEach((report) => {
      const uf = report.state_uf || "N/A";
      const techId = report.user_id || "unknown";
      const techName = report.technician_name || "Desconhecido";
      let hasProblems = false;
      let batteryIssues = 0;
      let acIssues = 0;
      let climatizacaoIssues = 0;
      
      // Technician tracking by user_id
      if (!technicianMap[techId]) {
        technicianMap[techId] = { count: 0, ufs: {}, name: techName };
      }
      technicianMap[techId].count++;
      technicianMap[techId].ufs[uf] = (technicianMap[techId].ufs[uf] || 0) + 1;
      
      // UF Distribution
      if (!ufMap[uf]) ufMap[uf] = { count: 0, ok: 0, nok: 0 };
      ufMap[uf].count++;
      
      // Monthly and daily distribution
      if (report.created_at) {
        const d = new Date(report.created_at);
        if (isValid(d)) {
          const monthKey = format(d, "MMM/yy", { locale: ptBR });
          monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
          
          // Daily distribution
          const dayKey = format(d, "dd/MM", { locale: ptBR });
          dayMap[dayKey] = (dayMap[dayKey] || 0) + 1;
          
          // Daily by technician
          if (!dayTechnicianMap[dayKey]) dayTechnicianMap[dayKey] = {};
          if (!dayTechnicianMap[dayKey][techId]) {
            dayTechnicianMap[dayKey][techId] = { count: 0, name: techName };
          }
          dayTechnicianMap[dayKey][techId].count++;
          
          // Daily by UF
          if (!dayUfMap[dayKey]) dayUfMap[dayKey] = {};
          dayUfMap[dayKey][uf] = (dayUfMap[dayKey][uf] || 0) + 1;
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
      
      // Aterramento
      if (report.torre_aterramento === "OK") {
        stats.aterramentoOk++;
      }

      // Process gabinetes
      for (let g = 1; g <= 7; g++) {
        const prefix = `gab${g}`;
        
        // Climatization type
        const climaTipo = report[`${prefix}_climatizacao_tipo`] as string;
        const fanStatus = report[`${prefix}_ventiladores_status`] as string;
        const plcStatus = report[`${prefix}_plc_status`] as string;
        const alarmeStatus = report[`${prefix}_alarme_status`] as string;
        
        if (climaTipo) {
          stats.climatizacaoTotal++;
          
          if (climaTipo.includes("AR CONDICIONADO")) {
            stats.acTotal++;
          } else if (climaTipo.includes("FAN")) {
            stats.fanTotal++;
          } else if (climaTipo === "NA") {
            stats.naTotal++;
          }
          
          // Fan status
          if (fanStatus === "OK") {
            stats.fanOkCount++;
          } else if (fanStatus === "NOK") {
            stats.fanNokCount++;
            climatizacaoIssues++;
          }
          
          // PLC status
          if (plcStatus === "OK") {
            stats.plcOkCount++;
          } else if (plcStatus === "NOK") {
            stats.plcNokCount++;
            climatizacaoIssues++;
          }
        }
        
        // ACs (4 per gabinete)
        const gabAcs: ACInfo[] = [];
        for (let a = 1; a <= 4; a++) {
          const modelo = report[`${prefix}_ac${a}_modelo`] as string;
          const status = report[`${prefix}_ac${a}_status`] as string;
          
          if (modelo && modelo !== "NA") {
            stats.totalACs++;
            const acInfo: ACInfo = {
              siteCode: report.site_code,
              uf,
              gabinete: g,
              acNum: a,
              modelo,
              status: status || "N/A",
            };
            
            if (status === "OK") {
              stats.acsOk++;
              stats.acsOkCount++;
            } else if (status === "NOK") {
              stats.acsNok++;
              stats.acsNokCount++;
              acIssues++;
              hasProblems = true;
            }
            
            acInfoList.push(acInfo);
            gabAcs.push(acInfo);
          }
        }
        
        // Add climatizacao info
        if (climaTipo) {
          climatizacaoList.push({
            siteCode: report.site_code,
            uf,
            gabinete: g,
            tipo: climaTipo,
            fanStatus: fanStatus || "N/A",
            plcStatus: plcStatus || "N/A",
            alarmeStatus: alarmeStatus || "N/A",
            acs: gabAcs
          });
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
            
            if (estado === "BOA" || !estado) {
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
              estado: estado || "BOA",
              idade,
              obsolescencia,
            });
          }
        }
      }
      
      // Check zeladoria
      const zeladoriaIsOk = report.torre_housekeeping === "OK" && report.torre_aterramento === "OK";
      if (!zeladoriaIsOk) hasProblems = true;
      
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
        climatizacaoIssues,
        zeladoriaOk: zeladoriaIsOk,
      });
    });

    // Calculate percentages
    stats.percentOk = stats.totalSites > 0 
      ? Math.round((stats.sitesOk / stats.totalSites) * 100) 
      : 0;

    // Build overview
    stats.overview = {
      totalSites: stats.totalSites,
      sitesOk: stats.sitesOk,
      sitesNok: stats.sitesNok,
      percentOk: stats.percentOk,
      totalBatteries: stats.totalBatteries,
      batteriesOk: stats.batteriesOk,
      batteriesCritical: stats.batteriesOver8Years,
      totalACs: stats.totalACs,
      acsOk: stats.acsOk,
      acsNok: stats.acsNok,
      sitesWithGMG: stats.sitesWithGMG,
      zeladoriaOkCount: stats.zeladoriaOk,
      lastUpdate: filtered[0]?.created_date || "N/A"
    };

    // Build chart data
    stats.ufDistribution = Object.entries(ufMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);

    stats.vistoriasPorMes = Object.entries(monthMap)
      .map(([month, count]) => ({ month, count }))
      .slice(-6);

    // Daily evolution (last 14 days) - sort by date ascending (left to right = oldest to newest)
    const sortDayKey = (a: string, b: string) => {
      // Parse dd/MM format and compare
      const [dayA, monthA] = a.split('/').map(Number);
      const [dayB, monthB] = b.split('/').map(Number);
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    };

    stats.vistoriasPorDia = Object.entries(dayMap)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => sortDayKey(a.day, b.day))
      .slice(-14);

    // Daily by technician (flatten) - sorted by date ascending
    stats.vistoriasPorDiaTecnico = Object.entries(dayTechnicianMap)
      .flatMap(([day, techs]) => 
        Object.entries(techs).map(([technicianId, data]) => ({
          day,
          technician: data.name,
          technicianId,
          count: data.count
        }))
      )
      .sort((a, b) => sortDayKey(a.day, b.day));

    // Daily by UF (flatten) - sorted by date ascending
    stats.vistoriasPorDiaUf = Object.entries(dayUfMap)
      .flatMap(([day, ufs]) => 
        Object.entries(ufs).map(([uf, count]) => ({
          day,
          uf,
          count
        }))
      )
      .sort((a, b) => sortDayKey(a.day, b.day));

    stats.batteryStateChart = [
      { name: "BOA", value: batteryStates.ok, color: "#22c55e" },
      { name: "Estufada", value: batteryStates.estufada, color: "#f59e0b" },
      { name: "Vazando", value: batteryStates.vazando, color: "#3b82f6" },
      { name: "Trincada", value: batteryStates.trincada, color: "#ef4444" },
      { name: "Sem Carga", value: batteryStates.semCarga, color: "#8b5cf6" },
    ].filter(item => item.value > 0);

    stats.batteryAgeChart = [
      { name: "<5 anos", value: batteryAges.ok, color: "#22c55e" },
      { name: "5-8 anos", value: batteryAges.warning, color: "#f59e0b" },
      { name: ">8 anos", value: batteryAges.critical, color: "#ef4444" },
    ].filter(item => item.value > 0);

    stats.energiaStatus = [
      { name: "Com GMG", value: stats.sitesWithGMG, color: "#22c55e" },
      { name: "Sem GMG", value: stats.sitesWithoutGMG, color: "#f59e0b" },
    ].filter(item => item.value > 0);

    stats.climatizacaoStatus = [
      { name: "ACs OK", value: stats.acsOkCount, color: "#22c55e" },
      { name: "ACs NOK", value: stats.acsNokCount, color: "#ef4444" },
      { name: "Fan OK", value: stats.fanOkCount, color: "#3b82f6" },
      { name: "Fan NOK", value: stats.fanNokCount, color: "#f97316" },
    ].filter(item => item.value > 0);

    stats.climatizacaoChart = [
      { name: "Ar Condicionado", value: stats.acTotal, color: "#3b82f6" },
      { name: "Fan", value: stats.fanTotal, color: "#22c55e" },
      { name: "N/A", value: stats.naTotal, color: "#6b7280" },
    ].filter(item => item.value > 0);

    // Build technician ranking by user_id
    stats.technicianRanking = Object.entries(technicianMap)
      .map(([id, data]) => {
        // Find main UF (most frequent)
        const mainUf = Object.entries(data.ufs).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
        return { id, name: data.name, count: data.count, mainUf };
      })
      .sort((a, b) => b.count - a.count);
    
    const uniqueTechnicians = stats.technicianRanking.length;
    stats.mediaPorTecnico = uniqueTechnicians > 0 
      ? stats.totalSites / uniqueTechnicians 
      : 0;

    // Apply status filter
    let finalSites = siteInfoList;
    let finalBatteries = batteryInfoList;
    let finalACs = acInfoList;
    let finalClimatizacao = climatizacaoList;
    
    if (filters.status === "ok") {
      finalSites = siteInfoList.filter(s => !s.hasProblems);
      finalBatteries = batteryInfoList.filter(b => b.estado === "BOA");
      finalACs = acInfoList.filter(a => a.status === "OK");
    } else if (filters.status === "nok") {
      finalSites = siteInfoList.filter(s => s.hasProblems);
      finalBatteries = batteryInfoList.filter(b => b.estado !== "BOA");
      finalACs = acInfoList.filter(a => a.status === "NOK");
    }

    return {
      stats,
      sites: finalSites,
      batteries: finalBatteries,
      acs: finalACs,
      climatizacao: finalClimatizacao,
    };
  }, [reports, filters]);
}
