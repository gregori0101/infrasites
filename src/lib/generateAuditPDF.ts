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

// Helper to parse foto_url which can be a single URL string or JSON array
function parsePhotos(fotoUrl: string | null): string[] {
  if (!fotoUrl) return [];
  try {
    const parsed = JSON.parse(fotoUrl);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Not JSON, treat as single URL
  }
  return [fotoUrl];
}

async function loadImageAsBase64(url: string): Promise<{ data: string; width: number; height: number; format: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject();
      reader.readAsDataURL(blob);
    });
    // Detect format from data URL
    let format = 'JPEG';
    if (dataUrl.startsWith('data:image/png')) format = 'PNG';
    else if (dataUrl.startsWith('data:image/webp')) format = 'PNG'; // jsPDF doesn't support webp, convert via canvas

    // Get real dimensions via canvas (also normalizes webp/other formats)
    const imgResult = await new Promise<{ data: string; width: number; height: number; format: string } | null>((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        // Draw to canvas to normalize the image (handles rotation, webp, etc.)
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve({ data: dataUrl, width: img.naturalWidth, height: img.naturalHeight, format }); return; }
        ctx.drawImage(img, 0, 0);
        const normalizedData = canvas.toDataURL('image/jpeg', 0.85);
        resolve({ data: normalizedData, width: img.naturalWidth, height: img.naturalHeight, format: 'JPEG' });
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
    return imgResult;
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
  const colWidths = [8, 42, 14, 18, 18, 24, 62];
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
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');

    const statusText = statusLabels[item.status] || item.status;
    const isConforme = item.status === 'conforme';
    const isNaoConforme = item.status === 'nao_conforme';

    // Wrap description and observation text
    const descLines = doc.splitTextToSize(item.descricao || '-', colWidths[1] - 4);
    const obsText = item.observacao || '-';
    const obsLines = doc.splitTextToSize(obsText, colWidths[6] - 4);
    const rowH = Math.max(8, Math.max(descLines.length, obsLines.length) * 3.5 + 2);

    checkPage(rowH);
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(...GRAY_LIGHT);
      doc.rect(margin, y - 1, contentWidth, rowH, 'F');
    }

    // Column values (single-line columns)
    doc.setTextColor(...GRAY_DARK);
    doc.text(String(idx + 1), colX[0] + 2, y + 4);

    // Description with wrapping
    doc.setTextColor(...GRAY_DARK);
    doc.text(descLines, colX[1] + 2, y + 4);

    // Unit, Previsto, Auditado
    doc.setTextColor(...GRAY_DARK);
    doc.text(item.unidade || '-', colX[2] + 2, y + 4);
    doc.text(String(item.quantidade ?? '-'), colX[3] + 2, y + 4);
    doc.text(String(item.quantidade_auditada ?? '-'), colX[4] + 2, y + 4);

    // Status with color
    if (isConforme) doc.setTextColor(...SUCCESS);
    else if (isNaoConforme) doc.setTextColor(...DANGER);
    else doc.setTextColor(...GRAY_MEDIUM);
    doc.text(statusText, colX[5] + 2, y + 4);

    // Observation column with wrapping
    doc.setTextColor(...GRAY_DARK);
    doc.text(obsLines, colX[6] + 2, y + 4);

    y += rowH;
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

  // --- Status APROVADO / REPROVADO ---
  const isAprovado = naoConformes === 0 && pendentes === 0 && items.length > 0;
  const resultLabel = isAprovado ? 'APROVADO' : 'REPROVADO';
  const resultColor: [number, number, number] = isAprovado ? SUCCESS : DANGER;

  checkPage(20);
  doc.setFillColor(...resultColor);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(resultLabel, pageWidth / 2, y + 11, { align: 'center' });
  y += 22;

  // --- Fotos de Evidencia (lado a lado, 2 por linha) ---
  // Collect all photos from all items into a flat list with metadata
  const allPhotos: { url: string; itemNum: number; descricao: string; status: string; unidade: string; quantidade: number; quantidade_auditada: number | null; observacao: string | null }[] = [];
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const photos = parsePhotos(item.foto_url);
    for (let pi = 0; pi < photos.length; pi++) {
      allPhotos.push({
        url: photos[pi],
        itemNum: idx + 1,
        descricao: photos.length > 1 ? `${item.descricao} (${pi + 1}/${photos.length})` : item.descricao,
        status: item.status,
        unidade: item.unidade,
        quantidade: item.quantidade,
        quantidade_auditada: item.quantidade_auditada,
        observacao: item.observacao,
      });
    }
  }

  if (allPhotos.length > 0) {
    sectionTitle('EVIDENCIAS FOTOGRAFICAS');

    const imgW = (contentWidth - 6) / 2;
    const maxImgH = imgW * 1.2;
    const labelH = 24; // increased to fit extra info

    for (let i = 0; i < allPhotos.length; i += 2) {
      // Pre-load both images to calculate real heights
      const pair: { photo: typeof allPhotos[0]; imgData: Awaited<ReturnType<typeof loadImageAsBase64>> }[] = [];
      for (let col = 0; col < 2 && i + col < allPhotos.length; col++) {
        const photo = allPhotos[i + col];
        const imgData = await loadImageAsBase64(photo.url);
        pair.push({ photo, imgData });
      }

      // Calculate fitted heights preserving aspect ratio
      const fittedHeights = pair.map(({ imgData }) => {
        if (!imgData) return maxImgH;
        const ratio = imgData.height / imgData.width;
        return Math.min(imgW * ratio, maxImgH);
      });
      const rowImgH = Math.max(...fittedHeights);
      const blockH = rowImgH + labelH + 4;

      checkPage(blockH + 4);

      for (let col = 0; col < pair.length; col++) {
        const { photo, imgData } = pair[col];
        const xPos = margin + col * (imgW + 6);

        // Line 1: Description (bold)
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...GRAY_DARK);
        const descLabel = doc.splitTextToSize(`#${photo.itemNum} - ${photo.descricao || '-'}`, imgW - 4);
        doc.text(descLabel[0] || '-', xPos + 1, y + 3);

        // Line 2: Unidade | Previsto | Auditado
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...GRAY_MEDIUM);
        const detailLine = `${photo.unidade || '-'} | Prev: ${photo.quantidade ?? '-'} | Aud: ${photo.quantidade_auditada ?? '-'}`;
        doc.text(detailLine, xPos + 1, y + 7);

        // Line 3: Status
        const statusText = statusLabels[photo.status] || photo.status;
        if (photo.status === 'conforme') doc.setTextColor(...SUCCESS);
        else if (photo.status === 'nao_conforme') doc.setTextColor(...DANGER);
        else doc.setTextColor(...GRAY_MEDIUM);
        doc.setFont('helvetica', 'bold');
        doc.text(statusText, xPos + 1, y + 11);

        // Line 4: Observation (if any)
        if (photo.observacao) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(6);
          doc.setTextColor(...GRAY_DARK);
          const obsLines = doc.splitTextToSize(photo.observacao, imgW - 4);
          doc.text(obsLines.slice(0, 3).join('\n'), xPos + 1, y + 15);
        }

        if (imgData) {
          try {
            const ratio = imgData.height / imgData.width;
            let drawW = imgW;
            let drawH = imgW * ratio;
            if (drawH > maxImgH) {
              drawH = maxImgH;
              drawW = maxImgH / ratio;
            }
            doc.addImage(imgData.data, imgData.format, xPos, y + labelH, drawW, drawH);
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
