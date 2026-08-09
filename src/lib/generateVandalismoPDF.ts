import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { VandalismoVistoriaCompleta } from '@/types/vandalismo';
import { resolveStorageUrl } from '@/lib/storageUrl';
import { supabase } from '@/integrations/supabase/client';

const PURPLE: [number, number, number] = [102, 0, 153];
const PURPLE_DARK: [number, number, number] = [75, 0, 115];
const ORANGE: [number, number, number] = [255, 107, 53];
const WHITE: [number, number, number] = [255, 255, 255];
const GRAY_DARK: [number, number, number] = [51, 51, 51];
const GRAY_MEDIUM: [number, number, number] = [102, 102, 102];
const GRAY_LIGHT: [number, number, number] = [245, 245, 245];
const SUCCESS: [number, number, number] = [22, 163, 74];
const DANGER: [number, number, number] = [220, 38, 38];

async function toDataUrl(input: string): Promise<{ dataUrl: string; format: 'JPEG' | 'PNG' } | null> {
  if (!input) return null;
  try {
    if (input.startsWith('data:image/')) {
      return { dataUrl: input, format: input.includes('png') ? 'PNG' : 'JPEG' };
    }
    const resolved = (await resolveStorageUrl(input)) ?? input;
    const res = await fetch(resolved, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return null;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return { dataUrl, format: blob.type.includes('png') ? 'PNG' : 'JPEG' };
  } catch {
    return null;
  }
}

export async function generateVandalismoPDF(data: VandalismoVistoriaCompleta): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  const addHeader = () => {
    doc.setFillColor(...PURPLE);
    doc.rect(0, 0, pageWidth, 22, 'F');
    doc.setFillColor(...PURPLE_DARK);
    doc.rect(0, 0, pageWidth, 8, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('vivo', margin, 13);
    doc.setFillColor(...ORANGE);
    doc.circle(margin + 22, 9, 2.5, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('RELATORIO DE VANDALISMO E VULNERABILIDADES', margin + 30, 13);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.site_code}`, pageWidth - margin, 13, { align: 'right' });
    y = 28;
  };

  const checkNewPage = (needed: number) => {
    if (y + needed > pageHeight - 15) {
      doc.addPage();
      addHeader();
    }
  };

  const sectionTitle = (title: string) => {
    checkNewPage(14);
    doc.setFillColor(...PURPLE);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 3, y + 4.8);
    y += 11;
  };

  const field = (label: string, value: string) => {
    checkNewPage(8);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY_MEDIUM);
    doc.text(`${label}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY_DARK);
    const lines = doc.splitTextToSize(value || '-', contentWidth - 40);
    doc.text(lines, margin + 38, y);
    y += Math.max(5, lines.length * 4.2) + 1.5;
  };

  const photoGrid = async (urls: string[], labelPrefix: string) => {
    const perRow = 3;
    const gap = 4;
    const w = (contentWidth - gap * (perRow - 1)) / perRow;
    const h = w * 0.75;

    for (let i = 0; i < urls.length; i += perRow) {
      const row = urls.slice(i, i + perRow);
      const images = await Promise.all(row.map((u) => toDataUrl(u)));
      checkNewPage(h + 10);
      row.forEach((_, idx) => {
        const img = images[idx];
        const x = margin + idx * (w + gap);
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(...GRAY_LIGHT);
        doc.roundedRect(x, y, w, h + 6, 1.5, 1.5, 'FD');
        doc.setFontSize(6);
        doc.setTextColor(...GRAY_MEDIUM);
        doc.text(`${labelPrefix} ${i + idx + 1}`, x + 1.5, y + 4);
        if (img) {
          try {
            doc.addImage(img.dataUrl, img.format, x + 1.5, y + 5, w - 3, h - 1);
          } catch {
            /* ignore broken image */
          }
        }
      });
      y += h + 10;
    }
  };

  addHeader();

  // Identification
  sectionTitle('Identificacao da vistoria');
  field('BO', data.bo_url ? 'Anexado' : 'Não anexado');
  field('Site', data.site_code);
  field('Estado', data.estado ?? '-');
  field('Operadora', data.operadora ?? '-');
  field('Tecnico', data.tecnico ?? '-');
  field('Data', format(new Date(data.created_at), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR }));
  
  // Fetch previous occurrences for the PDF
  const { data: previousData } = await supabase
    .from('vandalismo_vistorias')
    .select('id', { count: 'exact' })
    .eq('site_code', data.site_code)
    .lt('created_at', data.created_at);
  
  field('Vandalismos Anteriores', (previousData?.length || 0).toString());

  if (data.endereco) field('Endereco', data.endereco);
  if (data.latitude != null && data.longitude != null) {
    field('Coordenadas', `${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`);
  }
  field('BO', data.bo_url ? 'Anexado' : 'Não anexado');
  if (data.bo_url) field('Documento', data.bo_nome || 'Arquivo de BO');

  // Description
  sectionTitle('Descricao do vandalismo / furto');
  checkNewPage(12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_DARK);
  const descLines = doc.splitTextToSize(data.descricao || '-', contentWidth);
  descLines.forEach((line: string) => {
    checkNewPage(6);
    doc.text(line, margin, y);
    y += 4.6;
  });
  y += 4;

  // Occurrence photos
  const fotosOcorrido = data.fotos.filter((f) => f.categoria === 'ocorrido').map((f) => f.url);
  if (fotosOcorrido.length > 0) {
    sectionTitle(`Fotos do ocorrido (${fotosOcorrido.length})`);
    await photoGrid(fotosOcorrido, 'Foto');
  }

  // Vulnerability summary
  const vulneraveis = data.itens.filter((i) => i.vulneravel);
  sectionTitle('Resumo de vulnerabilidades');
  checkNewPage(10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DANGER);
  doc.text(`Vulneraveis: ${vulneraveis.length}`, margin, y);
  doc.setTextColor(...SUCCESS);
  doc.text(`Nao vulneraveis: ${data.itens.length - vulneraveis.length}`, margin + 50, y);
  y += 8;

  // Items
  for (const item of data.itens) {
    checkNewPage(16);
    doc.setFillColor(...GRAY_LIGHT);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY_DARK);
    doc.text(item.rotulo, margin + 2, y + 4.8);

    if (item.item_key === 'placa_site') {
      y += 2;
    } else {
      const badgeColor = item.vulneravel ? DANGER : SUCCESS;
      const badgeText = item.vulneravel ? 'VULNERAVEL' : 'NAO VULNERAVEL';
      doc.setFillColor(...badgeColor);
      doc.roundedRect(pageWidth - margin - 32, y + 1.2, 30, 4.6, 1, 1, 'F');
      doc.setTextColor(...WHITE);
      doc.setFontSize(6);
      doc.text(badgeText, pageWidth - margin - 17, y + 4.4, { align: 'center' });
      y += 10;
    }

    if (item.observacao && item.observacao.trim()) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...GRAY_DARK);
      const linhas = doc.splitTextToSize(`Obs.: ${item.observacao.trim()}`, contentWidth - 4);
      checkNewPage(linhas.length * 4 + 4);
      doc.text(linhas, margin + 2, y);
      y += linhas.length * 4 + 3;
    }

    if (item.fotos.length > 0) {
      await photoGrid(item.fotos, 'Foto');
    }
  }

  // Footer page numbers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...GRAY_MEDIUM);
    doc.text(`Pagina ${i} de ${pages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    doc.text('InfraSites - Check Vandalismo', margin, pageHeight - 7);
  }

  return doc.output('blob');
}
