import * as XLSX from "xlsx";
import type { AuditOrder } from "./auditoriaDatabase";

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluido: "Vistoriado",
};

interface ExportOptions {
  orders: AuditOrder[];
  techEmails: Record<string, string>;
  auditResults: Record<string, "aprovado" | "reprovado" | null>;
}

export function generateAuditExcel({ orders, techEmails, auditResults }: ExportOptions) {
  const rows = orders.map((o) => ({
    "Nº OS": o.os_number,
    Site: o.site_code,
    Motivo: o.motivo,
    Técnico: techEmails[o.technician_id] || o.technician_id.slice(0, 8),
    Status: statusLabels[o.status] || o.status,
    Resultado:
      auditResults[o.id] === "aprovado"
        ? "Aprovado"
        : auditResults[o.id] === "reprovado"
        ? "Reprovado"
        : "—",
    Prazo: o.deadline ? new Date(o.deadline).toLocaleDateString("pt-BR") : "—",
    Criação: new Date(o.created_at).toLocaleDateString("pt-BR"),
    Conclusão: o.completed_at ? new Date(o.completed_at).toLocaleDateString("pt-BR") : "—",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Auditorias");

  // Auto-width columns
  const colWidths = Object.keys(rows[0] || {}).map((key) => {
    const maxLen = Math.max(key.length, ...rows.map((r) => String((r as any)[key] || "").length));
    return { wch: Math.min(maxLen + 2, 40) };
  });
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, `auditorias_os_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
