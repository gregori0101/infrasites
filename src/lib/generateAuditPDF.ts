import jsPDF from 'jspdf';
import { type AuditOrder, type AuditOrderItem } from './auditoriaDatabase';

// Vivo Brand Colors (same as generatePDF.ts)
const VIVO_PURPLE: [number, number, number] = [102, 0, 153];
const VIVO_PURPLE_DARK: [number, number, number] = [75, 0, 115];
const VIVO_ORANGE: [number, number, number] = [255, 107, 53];
const GRAY_DARK: [number, number, number] = [51, 51, 51];
const GRAY_MEDIUM: [number, number, number] = [102, 102, 102];
const GRAY_LIGHT: [number, number, number] = [245, 245, 245];
const WHITE: [number, number, number] = [255, 255, 255];
const SUCCESS: [number, number, number] = [34, 197, 94];
const DANGER: [number, number, number] = [239, 68, 68];

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  concluido: 'Concluido',
  conforme: 'Conforme',
  nao_conforme: 'Nao Conforme',
};

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateAuditPDF(
  order: AuditOrder,
  items: AuditOrderItem[],
  techEmail: string
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;
  let pageNum = 1;

  // ===== HELPERS =====

  const checkPage = (needed: number) => {
    if (y + needed > pageHeight - 20) {
      addFooter();
      doc.addPage();
      pageNum++;
      addHeader();
      y = 30;
    }
  };

  const addHeader = () => {
    doc.setFillColor(...VIVO_PURPLE);
    doc.rect(0, 0, pageWidth, 22, 'F');
    doc.setFillColor(...VIVO_PURPLE_DARK);
    doc.rect(0, 0, pageWidth, 8, 'F');

    doc.setTextColor(...WHITE);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('vivo', margin, 13);

    doc.setFillColor(...VIVO_ORANGE);
    doc.circle(margin + 22, 9, 2.5, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATORIO DE AUDITORIA', pageWidth / 2, 10, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`OS ${order.os_number} - ${order.site_code}`, pageWidth / 2, 17, { align: 'center' });
  };

  const addFooter = () => {
    const footerY = pageHeight - 10;
    doc.setFillColor(...GRAY_LIGHT);
    doc.rect(0, footerY - 4, pageWidth, 14, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    doc.setFontSize(7);
    doc.setTextColor(...GRAY_MEDIUM);
    doc.setFont('helvetica', 'normal');
    const now = new Date();
    doc.text(`Gerado em ${now.toLocaleDateString('pt-BR')} as ${now.toLocaleTimeString('pt-BR')}`, margin, footerY);
    doc.text(`Pagina ${pageNum}`, pageWidth - margin, footerY, { align: 'right' });
  };

  const sectionTitle = (title: string) => {
    checkPage(14);
    doc.setFillColor(...VIVO_PURPLE);
    doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 4, y + 5.5);
    y += 12;
  };

  const fieldRow = (label: string, value: string, x: number, width: number) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY_MEDIUM);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY_DARK);
    doc.text(value || '-', x, y + 5);
  };

  // ===== CONTENT =====

  addHeader();
  y = 28;

  // --- Dados da OS ---
  sectionTitle('DADOS DA ORDEM DE SERVICO');

  const col1 = margin + 4;
  const col2 = margin + contentWidth / 2 + 4;

  // Row 1
  checkPage(16);
  doc.setFillColor(...GRAY_LIGHT);
  doc.roundedRect(margin, y - 4, contentWidth, 28, 1.5, 1.5, 'F');

  fieldRow('Numero da OS', order.os_number, col1, contentWidth / 2);
  fieldRow('Sigla do Site', order.site_code, col2, contentWidth / 2);
  y += 12;

  fieldRow('Tecnico', techEmail, col1, contentWidth / 2);
  fieldRow('Status', statusLabels[order.status] || order.status, col2, contentWidth / 2);
  y += 16;

  checkPage(16);
  doc.setFillColor(...GRAY_LIGHT);
  doc.roundedRect(margin, y - 4, contentWidth, 28, 1.5, 1.5, 'F');

  fieldRow('Motivo', order.motivo, col1, contentWidth);
  y += 12;

  const deadline = order.deadline ? new Date(order.deadline).toLocaleDateString('pt-BR') : '-';
  const createdAt = new Date(order.created_at).toLocaleDateString('pt-BR');
  const completedAt = order.completed_at ? new Date(order.completed_at).toLocaleDateString('pt-BR') : '-';

  fieldRow('Prazo', deadline, col1, contentWidth / 3);
  fieldRow('Criacao', createdAt, margin + contentWidth / 3 + 4, contentWidth / 3);
  fieldRow('Conclusao', completedAt, margin + (2 * contentWidth) / 3 + 4, contentWidth / 3);
  y += 16;

  // --- Tabela de Itens ---
  sectionTitle('ITENS AUDITADOS');

  // Table header
  const colWidths = [10, 52, 16, 22, 22, 26, 38];
  const colHeaders = ['#', 'Descricao', 'Unid.', 'Previsto', 'Auditado', 'Status', 'Observacao'];
  const colX: number[] = [];
  let cx = margin;
  for (const w of colWidths) {
    colX.push(cx);
    cx += w;
  }

  checkPage(12);
  doc.setFillColor(...VIVO_PURPLE);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  for (let i = 0; i < colHeaders.length; i++) {
    doc.text(colHeaders[i], colX[i] + 2, y + 5);
  }
  y += 8;

  // Table rows
  items.forEach((item, idx) => {
    checkPage(10);
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(...GRAY_LIGHT);
      doc.rect(margin, y - 1, contentWidth, 8, 'F');
    }

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY_DARK);

    const statusText = statusLabels[item.status] || item.status;
    const isConforme = item.status === 'conforme';
    const isNaoConforme = item.status === 'nao_conforme';

    const vals = [
      String(idx + 1),
      (item.descricao || '').substring(0, 30),
      item.unidade || '-',
      String(item.quantidade ?? '-'),
      String(item.quantidade_auditada ?? '-'),
      statusText,
      (item.observacao || '-').substring(0, 22),
    ];

    for (let i = 0; i < vals.length; i++) {
      if (i === 5) {
        // Color-code status
        if (isConforme) doc.setTextColor(...SUCCESS);
        else if (isNaoConforme) doc.setTextColor(...DANGER);
        else doc.setTextColor(...GRAY_MEDIUM);
      } else {
        doc.setTextColor(...GRAY_DARK);
      }
      doc.text(vals[i], colX[i] + 2, y + 4);
    }
    y += 8;
  });

  y += 4;

  // --- Resumo ---
  sectionTitle('RESUMO');

  const conformes = items.filter(i => i.status === 'conforme').length;
  const naoConformes = items.filter(i => i.status === 'nao_conforme').length;
  const pendentes = items.filter(i => i.status === 'pendente').length;

  checkPage(20);
  doc.setFillColor(...GRAY_LIGHT);
  doc.roundedRect(margin, y - 2, contentWidth, 14, 1.5, 1.5, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  doc.setTextColor(...GRAY_DARK);
  doc.text(`Total: ${items.length}`, col1, y + 6);

  doc.setTextColor(...SUCCESS);
  doc.text(`Conformes: ${conformes}`, margin + contentWidth / 4, y + 6);

  doc.setTextColor(...DANGER);
  doc.text(`Nao Conformes: ${naoConformes}`, margin + contentWidth / 2, y + 6);

  doc.setTextColor(...GRAY_MEDIUM);
  doc.text(`Pendentes: ${pendentes}`, margin + (3 * contentWidth) / 4, y + 6);

  y += 18;

  // --- Fotos de Evidencia (lado a lado, 2 por linha) ---
  const photosItems = items.filter(i => i.foto_url);
  if (photosItems.length > 0) {
    sectionTitle('EVIDENCIAS FOTOGRAFICAS');

    const imgW = (contentWidth - 6) / 2; // 2 columns with 6mm gap
    const imgH = imgW * 0.75;
    const labelH = 10;
    const blockH = imgH + labelH + 4;

    for (let i = 0; i < photosItems.length; i += 2) {
      checkPage(blockH + 4);

      for (let col = 0; col < 2 && i + col < photosItems.length; col++) {
        const item = photosItems[i + col];
        const xPos = margin + col * (imgW + 6);
        const imgData = await loadImageAsBase64(item.foto_url!);

        // Item label
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...GRAY_DARK);
        const label = (item.descricao || '').substring(0, 40);
        doc.text(label, xPos + 1, y + 3);

        const statusText = statusLabels[item.status] || item.status;
        const isConforme = item.status === 'conforme';
        if (isConforme) doc.setTextColor(...SUCCESS);
        else if (item.status === 'nao_conforme') doc.setTextColor(...DANGER);
        else doc.setTextColor(...GRAY_MEDIUM);
        doc.setFont('helvetica', 'normal');
        doc.text(statusText, xPos + 1, y + 7);

        if (imgData) {
          try {
            doc.addImage(imgData, 'JPEG', xPos, y + labelH, imgW, imgH);
          } catch {
            doc.setFontSize(7);
            doc.setTextColor(...GRAY_MEDIUM);
            doc.text('[Imagem nao disponivel]', xPos + 2, y + labelH + 10);
          }
        } else {
          doc.setFontSize(7);
          doc.setTextColor(...GRAY_MEDIUM);
          doc.text('[Imagem nao disponivel]', xPos + 2, y + labelH + 10);
        }
      }

      y += blockH;
    }
  }

  // Final footer
  addFooter();

  // Download
  doc.save(`Auditoria_OS_${order.os_number}_${order.site_code}.pdf`);
}
