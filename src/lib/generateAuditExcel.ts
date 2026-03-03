import * as XLSX from "xlsx";
import type { AuditOrder, AuditOrderItem } from "./auditoriaDatabase";
import { fetchAuditOrderItems } from "./auditoriaDatabase";

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluido: "Vistoriado",
};

const itemStatusLabels: Record<string, string> = {
  pendente: "Pendente",
  conforme: "Conforme",
  nao_conforme: "Não Conforme",
};

interface ExportOptions {
  orders: AuditOrder[];
  techEmails: Record<string, string>;
  auditResults: Record<string, "aprovado" | "reprovado" | null>;
}

function autoWidth(ws: XLSX.WorkSheet, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const colWidths = Object.keys(rows[0]).map((key) => {
    const maxLen = Math.max(key.length, ...rows.map((r) => String(r[key] || "").length));
    return { wch: Math.min(maxLen + 2, 40) };
  });
  ws["!cols"] = colWidths;
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
  autoWidth(ws, rows);

  XLSX.writeFile(wb, `auditorias_os_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function generateFullAuditExcel({ orders, techEmails, auditResults }: ExportOptions) {
  // Build orders rows
  const orderRows = orders.map((o) => ({
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
    Notas: o.notes || "—",
    Criação: new Date(o.created_at).toLocaleDateString("pt-BR"),
    Conclusão: o.completed_at ? new Date(o.completed_at).toLocaleDateString("pt-BR") : "—",
  }));

  // Fetch all items
  const allItems: { order: AuditOrder; item: AuditOrderItem }[] = [];
  await Promise.all(
    orders.map(async (order) => {
      try {
        const items = await fetchAuditOrderItems(order.id);
        items.forEach((item) => allItems.push({ order, item }));
      } catch (err) {
        console.error(`Erro ao buscar itens da OS ${order.os_number}:`, err);
      }
    })
  );

  const itemRows = allItems.map(({ order, item }) => ({
    "Nº OS": order.os_number,
    Site: order.site_code,
    Descrição: item.descricao,
    Unidade: item.unidade,
    Quantidade: item.quantidade,
    "Qtd Auditada": item.quantidade_auditada ?? "—",
    Status: itemStatusLabels[item.status] || item.status,
    Observação: item.observacao || "—",
    "Data Auditoria": item.audited_at ? new Date(item.audited_at).toLocaleDateString("pt-BR") : "—",
  }));

  const wb = XLSX.utils.book_new();

  const wsOrders = XLSX.utils.json_to_sheet(orderRows);
  autoWidth(wsOrders, orderRows);
  XLSX.utils.book_append_sheet(wb, wsOrders, "Auditorias");

  if (itemRows.length > 0) {
    const wsItems = XLSX.utils.json_to_sheet(itemRows);
    autoWidth(wsItems, itemRows);
    XLSX.utils.book_append_sheet(wb, wsItems, "Itens");
  }

  XLSX.writeFile(wb, `auditorias_completo_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
