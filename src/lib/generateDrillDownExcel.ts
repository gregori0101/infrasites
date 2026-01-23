import * as XLSX from "xlsx";
import { SiteInfo, BatteryInfo, ACInfo } from "@/components/dashboard/types";

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

  const rows = batteries.map((bat) => ({
    "Código do Site": bat.siteCode,
    "UF": bat.uf,
    "Gabinete": `G${bat.gabinete}`,
    "Banco": bat.banco,
    "Fabricante": bat.fabricante,
    "Tipo": bat.tipo,
    "Capacidade (Ah)": bat.capacidade,
    "Data Fabricação": bat.dataFabricacao,
    "Idade (anos)": bat.idade > 0 ? bat.idade : "N/A",
    "Estado": bat.estado,
    "Obsolescência": getObsolescenciaText(bat.obsolescencia),
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
