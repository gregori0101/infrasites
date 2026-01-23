import * as XLSX from "xlsx";
import { SiteInfo, BatteryInfo, ACInfo, GabineteInfo } from "@/components/dashboard/types";

/**
 * Generate Excel file for Sites data
 */
export function generateSitesExcel(sites: SiteInfo[], title: string): Blob {
  const workbook = XLSX.utils.book_new();

  const rows = sites.map((site) => ({
    "Código do Site": site.siteCode,
    "UF": site.uf,
    "Técnico": site.technician,
    "Data": site.date,
    "Hora": site.time,
    "Total Gabinetes": site.totalCabinets,
    "Status": site.hasProblems ? "NOK" : "OK",
    "Possui GMG": site.gmgExists ? "Sim" : "Não",
    "Problemas de Bateria": site.batteryIssues,
    "Problemas de AC": site.acIssues,
    "Problemas Climatização": site.climatizacaoIssues,
    "Zeladoria OK": site.zeladoriaOk ? "Sim" : "Não",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  const cols = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, 15),
  }));
  worksheet["!cols"] = cols;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sites");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Generate Excel file for Batteries data
 */
export function generateBatteriesExcel(
  batteries: BatteryInfo[],
  title: string
): Blob {
  const workbook = XLSX.utils.book_new();

  const getObsolescenciaText = (obs: "ok" | "warning" | "critical") => {
    if (obs === "ok") return "OK";
    if (obs === "warning") return "Médio Risco";
    return "Alto Risco";
  };

  const getObsolescenciaTipoText = (obs: "ok" | "medio" | "alto") => {
    if (obs === "ok") return "OK";
    if (obs === "medio") return "Médio Risco";
    return "Alto Risco";
  };

  const getAutonomyRiskText = (risk: "ok" | "medio" | "alto" | "critico") => {
    if (risk === "ok") return "OK";
    if (risk === "medio") return "Médio Risco";
    if (risk === "alto") return "Alto Risco";
    return "Crítico";
  };

  const getTipoClassificadoText = (tipo: "chumbo" | "litio" | "outro") => {
    if (tipo === "chumbo") return "Chumbo";
    if (tipo === "litio") return "Lítio";
    return "Outro";
  };

  const rows = batteries.map((bat) => ({
    "Código do Site": bat.siteCode,
    "UF": bat.uf,
    "Gabinete": `G${bat.gabinete}`,
    "Banco": bat.banco,
    "Fabricante": bat.fabricante,
    "Tipo": bat.tipo,
    "Classificação": getTipoClassificadoText(bat.tipoClassificado),
    "Capacidade (Ah)": bat.capacidade,
    "Data Fabricação": bat.dataFabricacao,
    "Idade (anos)": bat.idade > 0 ? bat.idade : "N/A",
    "Estado": bat.estado,
    "Obsolescência (Geral)": getObsolescenciaText(bat.obsolescencia),
    "Obsolescência (por Tipo)": getObsolescenciaTipoText(bat.obsolescenciaTipo),
    "Risco Autonomia": getAutonomyRiskText(bat.autonomyRisk),
    "Requer Troca": bat.needsReplacement ? "Sim" : "Não",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  const cols = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, 15),
  }));
  worksheet["!cols"] = cols;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Baterias");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Generate Excel file for ACs data
 */
export function generateACsExcel(acs: ACInfo[], title: string): Blob {
  const workbook = XLSX.utils.book_new();

  const rows = acs.map((ac) => ({
    "Código do Site": ac.siteCode,
    "UF": ac.uf,
    "Gabinete": ac.gabinete,
    "AC #": ac.acNum,
    "Modelo": ac.modelo,
    "Status": ac.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  const cols = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, 15),
  }));
  worksheet["!cols"] = cols;

  XLSX.utils.book_append_sheet(workbook, worksheet, "ACs");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Generate Excel file for Gabinetes data
 */
export function generateGabinetesExcel(
  gabinetes: GabineteInfo[],
  title: string
): Blob {
  const workbook = XLSX.utils.book_new();

  const getAutonomyRiskText = (risk: "ok" | "medio" | "alto" | "critico") => {
    if (risk === "ok") return "OK";
    if (risk === "medio") return "Médio Risco";
    if (risk === "alto") return "Alto Risco";
    return "Crítico";
  };

  const getObsolescenciaRiskText = (risk: "ok" | "medio" | "alto" | "sem_banco") => {
    if (risk === "ok") return "OK";
    if (risk === "medio") return "Médio Risco";
    if (risk === "alto") return "Alto Risco";
    return "Sem Banco";
  };

  const rows = gabinetes.map((gab) => ({
    "Código do Site": gab.siteCode,
    "UF": gab.uf,
    "Gabinete": `G${gab.gabinete}`,
    "Risco Autonomia": getAutonomyRiskText(gab.autonomyRisk),
    "Autonomia (horas)": gab.autonomyHours.toFixed(1),
    "Risco Obsolescência": getObsolescenciaRiskText(gab.obsolescenciaRisk),
    "Possui GMG": gab.hasGMG ? "Sim" : "Não",
    "Total Baterias": gab.totalBatteries,
    "Tipos de Bateria": gab.batteryTypes.join(", ") || "N/A",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  const cols = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, 15),
  }));
  worksheet["!cols"] = cols;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Gabinetes");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Download an Excel blob with a filename
 */
export function downloadDrillDownExcel(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
