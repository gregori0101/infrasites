import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Reparo } from '@/fiber-guardian/types/database';
import { getCausaLabel, getConclusaoLabel, getCategoriaLabel, getStatusLabel, getTipoRedeLabel } from './constants';

function loadImageAsDataUrl(url: string): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.85), width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function generateReparoPDF(reparo: Reparo): Promise<void> {
  const pdf = new jsPDF();
  const pageW = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 20;

  const checkPage = (needed: number) => {
    if (y + needed > 275) { pdf.addPage(); y = 20; }
  };

  // Title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relatorio de Reparo', pageW / 2, y, { align: 'center' });
  y += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, pageW / 2, y, { align: 'center' });
  y += 12;

  // Info section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Informacoes Gerais', margin, y);
  y += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const info: [string, string][] = [
    ['TA', reparo.ta_titulo],
    ['Status', getStatusLabel(reparo.status)],
    ['Causa', getCausaLabel(reparo.causa)],
    ['Categoria', getCategoriaLabel(reparo.categoria)],
    ['Conclusao', getConclusaoLabel(reparo.conclusao_ta)],
    ['Tecnico', reparo.profiles?.nome || '-'],
    ['Criado em', format(new Date(reparo.criado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })],
  ];
  if (reparo.trecho) info.push(['Trecho', reparo.trecho]);
  if (reparo.tipo_rede) info.push(['Tipo Rede', getTipoRedeLabel(reparo.tipo_rede)]);
  if (reparo.tecnicos_reparo) info.push(['Tecnicos', reparo.tecnicos_reparo]);
  info.push(['Caixa Bomba', reparo.caixa_bomba ? 'Sim' : 'Nao']);

  info.forEach(([label, value]) => {
    checkPage(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${label}: `, margin, y);
    const labelW = pdf.getTextWidth(`${label}: `);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, margin + labelW, y);
    y += 7;
  });

  if (reparo.latitude && reparo.longitude) {
    checkPage(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Coordenadas: ', margin, y);
    const lw = pdf.getTextWidth('Coordenadas: ');
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${reparo.latitude.toFixed(5)}, ${reparo.longitude.toFixed(5)}`, margin + lw, y);
    y += 7;
  }

  // Observations
  const obs = [
    { label: 'Observacoes', text: reparo.observacoes },
    { label: 'Prevencao', text: reparo.observacao_prevencao },
    { label: 'Definitivo', text: reparo.observacao_definitivo },
  ].filter(o => o.text);

  if (obs.length > 0) {
    y += 5;
    checkPage(15);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Observacoes', margin, y);
    y += 8;
    pdf.setFontSize(10);

    obs.forEach(o => {
      checkPage(15);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${o.label}:`, margin, y);
      y += 6;
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(o.text!, contentW);
      lines.forEach((line: string) => {
        checkPage(6);
        pdf.text(line, margin, y);
        y += 6;
      });
      y += 3;
    });
  }

  // Photos
  if (reparo.fotos_reparo && reparo.fotos_reparo.length > 0) {
    y += 5;
    checkPage(20);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Fotos (${reparo.fotos_reparo.length})`, margin, y);
    y += 8;

    for (const foto of reparo.fotos_reparo) {
      try {
        const { dataUrl, width, height } = await loadImageAsDataUrl(foto.caminho_arquivo);
        const maxW = contentW / 2;
        const maxH = 60;
        const ratio = Math.min(maxW / width, maxH / height);
        const imgW = width * ratio;
        const imgH = height * ratio;

        checkPage(imgH + 12);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(foto.titulo || foto.tipo_foto, margin, y);
        y += 4;
        pdf.addImage(dataUrl, 'JPEG', margin, y, imgW, imgH);
        y += imgH + 8;
      } catch {
        checkPage(8);
        pdf.setFontSize(9);
        pdf.text(`[Foto nao carregada: ${foto.titulo || foto.tipo_foto}]`, margin, y);
        y += 7;
      }
    }
  }

  pdf.save(`reparo-${reparo.ta_titulo}-${format(new Date(), 'yyyyMMdd')}.pdf`);
}
