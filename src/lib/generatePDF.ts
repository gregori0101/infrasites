import jsPDF from 'jspdf';
import { ChecklistData } from '@/types/checklist';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Vivo Brand Colors
const VIVO_PURPLE: [number, number, number] = [102, 0, 153];
const VIVO_PURPLE_DARK: [number, number, number] = [75, 0, 115];
const VIVO_ORANGE: [number, number, number] = [255, 107, 53];
const VIVO_BLUE: [number, number, number] = [0, 51, 102];
const GRAY_DARK: [number, number, number] = [51, 51, 51];
const GRAY_MEDIUM: [number, number, number] = [102, 102, 102];
const GRAY_LIGHT: [number, number, number] = [245, 245, 245];
const WHITE: [number, number, number] = [255, 255, 255];
const SUCCESS: [number, number, number] = [34, 197, 94];
const WARNING: [number, number, number] = [234, 179, 8];
const DANGER: [number, number, number] = [239, 68, 68];

export async function generatePDF(data: ChecklistData): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // ===== HELPER FUNCTIONS =====

  const addHeader = () => {
    // Purple gradient header
    doc.setFillColor(...VIVO_PURPLE);
    doc.rect(0, 0, pageWidth, 22, 'F');
    
    // Subtle gradient effect
    doc.setFillColor(...VIVO_PURPLE_DARK);
    doc.rect(0, 0, pageWidth, 8, 'F');

    // Vivo Logo text
    doc.setTextColor(...WHITE);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('vivo', margin, 13);

    // Orange accent dot
    doc.setFillColor(...VIVO_ORANGE);
    doc.circle(margin + 22, 9, 2.5, 'F');

    // Title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('CHECKLIST TÉCNICO DE SITES', margin + 30, 13);

    // Site info on right
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.siglaSite || 'N/A'} | ${data.uf}`, pageWidth - margin, 13, { align: 'right' });

    y = 28;
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFillColor(...GRAY_LIGHT);
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
    
    doc.setFontSize(7);
    doc.setTextColor(...GRAY_MEDIUM);
    doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, margin, pageHeight - 5);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
    doc.text('VIVO - Checklist Técnico', pageWidth / 2, pageHeight - 5, { align: 'center' });
  };

  const checkNewPage = (neededSpace: number = 30) => {
    if (y + neededSpace > pageHeight - 18) {
      doc.addPage();
      addHeader();
      return true;
    }
    return false;
  };

  const addSectionTitle = (title: string, icon?: string) => {
    checkNewPage(20);
    
    // Section background with gradient effect
    doc.setFillColor(...VIVO_ORANGE);
    doc.roundedRect(margin, y, contentWidth, 9, 1, 1, 'F');
    
    // Title text
    doc.setTextColor(...WHITE);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text((icon ? icon + ' ' : '') + title.toUpperCase(), margin + 4, y + 6);
    
    y += 13;
    doc.setTextColor(...GRAY_DARK);
  };

  const addSubSectionTitle = (title: string) => {
    checkNewPage(15);
    
    doc.setFillColor(...VIVO_BLUE);
    doc.roundedRect(margin, y, contentWidth, 7, 0.5, 0.5, 'F');
    
    doc.setTextColor(...WHITE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 3, y + 5);
    
    y += 10;
    doc.setTextColor(...GRAY_DARK);
  };

  const addInfoCard = (title: string, items: { label: string; value: string | number | boolean | null | undefined }[]) => {
    const cardHeight = 6 + items.length * 5 + 3;
    checkNewPage(cardHeight);

    // Card background
    doc.setFillColor(...GRAY_LIGHT);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'F');
    
    // Card border
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'S');

    // Card title
    doc.setFillColor(...VIVO_PURPLE);
    doc.roundedRect(margin, y, contentWidth, 6, 2, 2, 'F');
    doc.rect(margin, y + 3, contentWidth, 3, 'F'); // Fill bottom corners
    
    doc.setTextColor(...WHITE);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 3, y + 4.2);

    y += 8;

    // Card items
    items.forEach(item => {
      doc.setFontSize(8);
      doc.setTextColor(...GRAY_MEDIUM);
      doc.setFont('helvetica', 'normal');
      doc.text(item.label + ':', margin + 3, y);
      
      doc.setTextColor(...GRAY_DARK);
      doc.setFont('helvetica', 'bold');
      const displayValue = item.value === null || item.value === undefined ? '-' :
        typeof item.value === 'boolean' ? (item.value ? 'Sim' : 'Não') :
        String(item.value);
      doc.text(displayValue, margin + 50, y);
      y += 5;
    });

    y += 4;
  };

  const addFieldRow = (label: string, value: string | number | boolean | null | undefined, status?: 'ok' | 'warning' | 'error') => {
    checkNewPage(7);
    
    // Alternating row background
    const rowIndex = Math.floor(y / 6) % 2;
    if (rowIndex === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y - 3, contentWidth, 6, 'F');
    }

    doc.setFontSize(8);
    doc.setTextColor(...GRAY_MEDIUM);
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin + 2, y);

    const displayValue = value === null || value === undefined ? '-' :
      typeof value === 'boolean' ? (value ? 'Sim' : 'Não') :
      String(value);

    // Status indicator
    if (status) {
      const statusColor = status === 'ok' ? SUCCESS : status === 'warning' ? WARNING : DANGER;
      doc.setFillColor(...statusColor);
      doc.circle(margin + 70, y - 1, 1.5, 'F');
    }

    doc.setTextColor(...GRAY_DARK);
    doc.setFont('helvetica', 'bold');
    doc.text(displayValue, margin + (status ? 75 : 65), y);
    
    y += 5;
  };

  const addStatusBadge = (status: string, x: number, yPos: number) => {
    const isOK = status.toUpperCase() === 'OK' || status === 'Sim' || status === 'true';
    const isNA = status.toUpperCase() === 'NA' || status === '-';
    
    const bgColor = isOK ? SUCCESS : isNA ? GRAY_MEDIUM : DANGER;
    const text = isOK ? 'OK' : isNA ? 'N/A' : 'NOK';
    
    doc.setFillColor(...bgColor);
    doc.roundedRect(x, yPos - 3, 12, 5, 1, 1, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(text, x + 6, yPos, { align: 'center' });
  };

  const getImageFormat = (dataUrlOrMime: string): 'JPEG' | 'PNG' => {
    const s = dataUrlOrMime.toLowerCase();
    if (s.includes('png')) return 'PNG';
    return 'JPEG';
  };

  const toDataUrl = async (input: string): Promise<{ dataUrl: string; format: 'JPEG' | 'PNG' } | null> => {
    if (!input) return null;
    
    try {
      // Already a data URL
      if (input.startsWith('data:image/')) {
        return { dataUrl: input, format: getImageFormat(input) };
      }

      // Remote URL (from storage)
      const res = await fetch(input, { mode: 'cors' });
      if (!res.ok) {
        console.error('Failed to fetch image:', res.status);
        return null;
      }
      
      const blob = await res.blob();
      const mime = blob.type || 'image/jpeg';

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      return { dataUrl, format: getImageFormat(mime) };
    } catch (error) {
      console.error('Error converting to data URL:', error);
      return null;
    }
  };

  const addPhoto = async (photo: string | null | undefined, label: string, width: number = 55, height: number = 40) => {
    if (!photo) return;
    
    checkNewPage(height + 10);

    try {
      const imgData = await toDataUrl(photo);
      if (!imgData) {
        console.warn('Could not load image:', label);
        return;
      }

      // Photo frame
      doc.setFillColor(...WHITE);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, width + 4, height + 10, 2, 2, 'FD');

      // Label
      doc.setFontSize(7);
      doc.setTextColor(...GRAY_MEDIUM);
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin + 2, y + 4);

      // Image
      doc.addImage(imgData.dataUrl, imgData.format, margin + 2, y + 6, width, height);
      
      y += height + 14;
    } catch (error) {
      console.error('Error adding image:', label, error);
    }
  };

  const addPhotoGrid = async (photos: { photo: string | null | undefined; label: string }[]) => {
    const validPhotos = photos.filter(p => p.photo);
    if (validPhotos.length === 0) return;

    const photoWidth = 55;
    const photoHeight = 40;
    const gap = 5;
    const cols = 3;

    for (let i = 0; i < validPhotos.length; i += cols) {
      checkNewPage(photoHeight + 15);

      const rowPhotos = validPhotos.slice(i, i + cols);
      
      for (let j = 0; j < rowPhotos.length; j++) {
        const xPos = margin + j * (photoWidth + gap);
        const { photo, label } = rowPhotos[j];
        
        try {
          const imgData = await toDataUrl(photo!);
          if (!imgData) continue;

          // Photo frame
          doc.setFillColor(...WHITE);
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.2);
          doc.roundedRect(xPos, y, photoWidth, photoHeight + 8, 1, 1, 'FD');

          // Label
          doc.setFontSize(6);
          doc.setTextColor(...GRAY_MEDIUM);
          doc.setFont('helvetica', 'bold');
          const labelLines = doc.splitTextToSize(label, photoWidth - 2);
          doc.text(labelLines[0], xPos + 1, y + 3);

          // Image
          doc.addImage(imgData.dataUrl, imgData.format, xPos + 1, y + 5, photoWidth - 2, photoHeight);
        } catch (e) {
          console.error('Error adding grid image:', label, e);
        }
      }
      
      y += photoHeight + 12;
    }
  };

  // ===== COVER PAGE =====
  // Full page cover
  doc.setFillColor(...VIVO_PURPLE);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Decorative elements
  doc.setFillColor(...VIVO_PURPLE_DARK);
  doc.circle(pageWidth + 30, 50, 80, 'F');
  doc.setFillColor(...VIVO_ORANGE);
  doc.circle(-20, pageHeight - 40, 60, 'F');

  // Logo
  doc.setTextColor(...WHITE);
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.text('vivo', pageWidth / 2 - 10, 60, { align: 'center' });
  doc.setFillColor(...VIVO_ORANGE);
  doc.circle(pageWidth / 2 + 38, 48, 6, 'F');

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CHECKLIST TÉCNICO', pageWidth / 2, 90, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório de Vistoria de Site', pageWidth / 2, 100, { align: 'center' });

  // Site info card
  doc.setFillColor(...WHITE);
  doc.roundedRect(margin + 15, 120, contentWidth - 30, 55, 4, 4, 'F');
  
  doc.setTextColor(...VIVO_PURPLE);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(data.siglaSite || 'N/A', pageWidth / 2, 142, { align: 'center' });
  
  doc.setTextColor(...GRAY_MEDIUM);
  doc.setFontSize(12);
  doc.text(`Estado: ${data.uf}`, pageWidth / 2, 155, { align: 'center' });
  doc.text(`Gabinetes: ${data.qtdGabinetes}`, pageWidth / 2, 165, { align: 'center' });

  // Technician info
  doc.setFillColor(255, 255, 255, 0.1);
  doc.setTextColor(...WHITE);
  doc.setFontSize(11);
  doc.text('TÉCNICO RESPONSÁVEL', pageWidth / 2, 200, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.tecnico || 'Não informado', pageWidth / 2, 212, { align: 'center' });

  // Date info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = data.dataHora ? format(new Date(data.dataHora), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }) : '-';
  doc.text(dateStr, pageWidth / 2, 230, { align: 'center' });

  // Footer
  doc.setFontSize(8);
  doc.text('Documento gerado automaticamente pelo sistema de checklist Vivo', pageWidth / 2, pageHeight - 15, { align: 'center' });

  // ===== SITE OVERVIEW PAGE =====
  doc.addPage();
  addHeader();

  addSectionTitle('DADOS DO SITE', '📍');
  
  addInfoCard('Informações Gerais', [
    { label: 'Sigla SCIENCE', value: data.siglaSite },
    { label: 'Estado (UF)', value: data.uf },
    { label: 'Tipo de Abrigo', value: data.abrigoSelecionado },
    { label: 'Qtd. Gabinetes', value: data.qtdGabinetes },
    { label: 'Técnico', value: data.tecnico },
    { label: 'Data/Hora', value: data.dataHora ? format(new Date(data.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : '-' },
  ]);

  if (data.fotoPanoramica) {
    await addPhoto(data.fotoPanoramica, 'FOTO PANORÂMICA DO SITE', 80, 55);
  }

  // ===== GABINETES =====
  for (let i = 0; i < data.gabinetes.length; i++) {
    const gab = data.gabinetes[i];
    
    doc.addPage();
    addHeader();

    addSectionTitle(`GABINETE ${i + 1}`, '🏢');

    // Gabinete Info
    addInfoCard(`Gabinete ${i + 1} - Informações`, [
      { label: 'Tipo', value: gab.tipo },
      { label: 'Com Proteção', value: gab.comProtecao },
      { label: 'Tecnologias Acesso', value: gab.tecnologiasAcesso.join(', ') || '-' },
      { label: 'Tecnologias Transporte', value: gab.tecnologiasTransporte.join(', ') || '-' },
    ]);

    // FCC Section
    addSubSectionTitle('FCC - Fonte de Corrente Contínua');
    addFieldRow('Fabricante', gab.fcc.fabricante);
    addFieldRow('Tensão DC', gab.fcc.tensaoDC);
    addFieldRow('Consumo DC (W)', gab.fcc.consumoDC);
    addFieldRow('URs Suportadas', gab.fcc.qtdURSuportadas);
    addFieldRow('Gerenciada SG Infra', gab.fcc.gerenciadaSG, gab.fcc.gerenciadaSG ? 'ok' : 'warning');
    addFieldRow('Gerenciável', gab.fcc.gerenciavel, gab.fcc.gerenciavel ? 'ok' : 'warning');

    await addPhotoGrid([
      { photo: gab.fcc.fotoPanoramica, label: 'FCC Panorâmica' },
      { photo: gab.fcc.fotoPainel, label: 'Painel de Instrumentos' },
    ]);

    // Batteries Section
    checkNewPage(40);
    addSubSectionTitle('BATERIAS');
    addFieldRow('Número de Bancos', gab.baterias.numBancos);
    addFieldRow('Bancos Interligados', gab.baterias.bancosInterligados, gab.baterias.bancosInterligados ? 'ok' : 'warning');

    for (let b = 0; b < gab.baterias.bancos.length; b++) {
      const banco = gab.baterias.bancos[b];
      checkNewPage(35);
      
      y += 2;
      doc.setFillColor(...GRAY_LIGHT);
      doc.roundedRect(margin, y, contentWidth, 28, 1, 1, 'F');
      
      doc.setTextColor(...VIVO_PURPLE);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`Banco ${b + 1}`, margin + 3, y + 5);
      
      y += 7;
      doc.setTextColor(...GRAY_DARK);
      addFieldRow('  Tipo', banco.tipo);
      addFieldRow('  Fabricante', banco.fabricante);
      addFieldRow('  Capacidade (Ah)', banco.capacidadeAh);
      addFieldRow('  Data Fabricação', banco.dataFabricacao || '-');
      addFieldRow('  Estado', banco.estado, banco.estado === 'OK' ? 'ok' : 'error');
    }

    await addPhoto(gab.baterias.fotoBanco, 'Foto Banco de Baterias');

    // Climate Section
    checkNewPage(50);
    addSubSectionTitle('CLIMATIZAÇÃO');
    addFieldRow('Tipo', gab.climatizacao.tipo);
    addFieldRow('Fan OK', gab.climatizacao.fanOK, gab.climatizacao.fanOK ? 'ok' : 'error');
    addFieldRow('PLC Lead-Lag', gab.climatizacao.plcLeadLag, gab.climatizacao.plcLeadLag === 'OK' ? 'ok' : 'warning');
    addFieldRow('Alarmística', gab.climatizacao.alarmistica);

    if (gab.climatizacao.acs.length > 0) {
      y += 3;
      doc.setTextColor(...VIVO_BLUE);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Ar Condicionados:', margin + 2, y);
      y += 4;
      
      gab.climatizacao.acs.forEach((ac, idx) => {
        addFieldRow(`  AC ${idx + 1} - Modelo`, ac.modelo);
        addFieldRow(`  AC ${idx + 1} - Status`, ac.funcionamento, ac.funcionamento === 'OK' ? 'ok' : 'error');
      });
    }

    await addPhotoGrid([
      { photo: gab.climatizacao.fotoAR1, label: 'AR 1' },
      { photo: gab.climatizacao.fotoAR2, label: 'AR 2' },
      { photo: gab.climatizacao.fotoAR3, label: 'AR 3' },
      { photo: gab.climatizacao.fotoAR4, label: 'AR 4' },
      { photo: gab.climatizacao.fotoCondensador, label: 'Condensador' },
      { photo: gab.climatizacao.fotoEvaporador, label: 'Evaporador' },
      { photo: gab.climatizacao.fotoControlador, label: 'Controlador' },
    ]);

    // Equipment Section
    checkNewPage(60);
    addSubSectionTitle('EQUIPAMENTOS');
    await addPhotoGrid([
      { photo: gab.fotoTransmissao, label: 'Equipamentos de Transmissão' },
      { photo: gab.fotoAcesso, label: 'Equipamentos de Acesso' },
    ]);
  }

  // ===== FIBER SECTION =====
  doc.addPage();
  addHeader();

  addSectionTitle('FIBRA ÓPTICA', '🔌');

  addSubSectionTitle('Acesso da Fibra');
  addFieldRow('Número de Abordagens', data.fibra.numAbordagens);

  // Abordagem 1
  y += 2;
  doc.setFillColor(...GRAY_LIGHT);
  doc.roundedRect(margin, y, contentWidth, 18, 1, 1, 'F');
  doc.setTextColor(...VIVO_PURPLE);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Abordagem 1', margin + 3, y + 5);
  y += 7;
  addFieldRow('  Tipo', data.fibra.abordagem1.tipo);
  if (data.fibra.abordagem1.tipo === 'SUBTERRÂNEA') {
    addFieldRow('  Subida Lateral OK', data.fibra.abordagem1.subidaLateralOK, data.fibra.abordagem1.subidaLateralOK ? 'ok' : 'error');
  }
  y += 3;

  // Photos abordagem 1
  if (data.fibra.abordagem1.fotoCaixasSubterraneas?.length > 0) {
    await addPhotoGrid(
      data.fibra.abordagem1.fotoCaixasSubterraneas.map((p, idx) => ({
        photo: p,
        label: `Caixa Subterrânea ${idx + 1}`
      }))
    );
  }
  if (!data.fibra.abordagem1.subidaLateralOK && data.fibra.abordagem1.fotoSubidaLateral?.length > 0) {
    await addPhotoGrid(
      data.fibra.abordagem1.fotoSubidaLateral.map((p, idx) => ({
        photo: p,
        label: `Subida Lateral NOK ${idx + 1}`
      }))
    );
  }

  // Abordagem 2
  if (data.fibra.numAbordagens >= 2 && data.fibra.abordagem2) {
    checkNewPage(25);
    y += 2;
    doc.setFillColor(...GRAY_LIGHT);
    doc.roundedRect(margin, y, contentWidth, 18, 1, 1, 'F');
    doc.setTextColor(...VIVO_PURPLE);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Abordagem 2', margin + 3, y + 5);
    y += 7;
    addFieldRow('  Tipo', data.fibra.abordagem2.tipo);
    if (data.fibra.abordagem2.tipo === 'SUBTERRÂNEA') {
      addFieldRow('  Subida Lateral OK', data.fibra.abordagem2.subidaLateralOK, data.fibra.abordagem2.subidaLateralOK ? 'ok' : 'error');
    }
    addFieldRow('Convergência', data.fibra.convergencia || '-');
    y += 3;

    if (data.fibra.abordagem2.fotoCaixasSubterraneas?.length > 0) {
      await addPhotoGrid(
        data.fibra.abordagem2.fotoCaixasSubterraneas.map((p, idx) => ({
          photo: p,
          label: `Abord. 2 - Caixa ${idx + 1}`
        }))
      );
    }
  }

  await addPhoto(data.fibra.fotoGeralAbordagens, 'Foto Geral das Abordagens');

  // Caixas de Passagem
  checkNewPage(30);
  addSubSectionTitle('Caixas de Passagem');
  addFieldRow('Existem Caixas de Passagem', data.fibra.caixasPassagemExistem);
  if (data.fibra.caixasPassagemExistem) {
    addFieldRow('Padrão Correto', data.fibra.caixasPassagemPadrao, data.fibra.caixasPassagemPadrao ? 'ok' : 'error');
    if (data.fibra.fotosCaixasPassagem?.length > 0) {
      await addPhotoGrid(
        data.fibra.fotosCaixasPassagem.map((p, idx) => ({
          photo: p,
          label: `Caixa de Passagem ${idx + 1}`
        }))
      );
    }
  }

  // DGOs
  checkNewPage(30);
  addSubSectionTitle('DGOs - Distribuidores Gerais Ópticos');
  addFieldRow('Quantidade de DGOs', data.fibra.numDGOs);

  for (let i = 0; i < data.fibra.dgos.length; i++) {
    const dgo = data.fibra.dgos[i];
    checkNewPage(45);

    y += 3;
    doc.setFillColor(...GRAY_LIGHT);
    doc.roundedRect(margin, y, contentWidth, 30, 1, 1, 'F');
    doc.setTextColor(...VIVO_ORANGE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`DGO ${i + 1}`, margin + 3, y + 6);
    y += 8;
    
    addFieldRow('  Capacidade', dgo.capacidade);
    addFieldRow('  Formatos', dgo.formatos.join(', ') || '-');
    addFieldRow('  Estado Físico', dgo.estadoFisico, dgo.estadoFisico === 'OK' ? 'ok' : 'error');
    addFieldRow('  Organização Cordões', dgo.organizacaoCordoes, dgo.organizacaoCordoes === 'OK' ? 'ok' : 'error');

    await addPhotoGrid([
      { photo: dgo.fotoExterno, label: `DGO ${i + 1} - Externo` },
      { photo: dgo.fotoCordoes, label: `DGO ${i + 1} - Cordões` },
    ]);
  }

  // DGO Observations
  if (data.fibra.observacoesDGOs) {
    checkNewPage(25);
    doc.setFillColor(255, 250, 240);
    doc.roundedRect(margin, y, contentWidth, 15, 1, 1, 'F');
    doc.setTextColor(...VIVO_ORANGE);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações DGOs:', margin + 3, y + 5);
    doc.setTextColor(...GRAY_DARK);
    doc.setFont('helvetica', 'normal');
    const obsLines = doc.splitTextToSize(data.fibra.observacoesDGOs, contentWidth - 6);
    doc.text(obsLines.slice(0, 2), margin + 3, y + 10);
    y += 18;
    await addPhoto(data.fibra.fotoObservacoesDGOs, 'Foto Observação DGOs');
  }

  // ===== ENERGY SECTION =====
  doc.addPage();
  addHeader();

  addSectionTitle('ENERGIA', '⚡');

  addInfoCard('Quadro de Energia', [
    { label: 'Tipo de Quadro', value: data.energia.tipoQuadro },
    { label: 'Fabricante', value: data.energia.fabricante },
    { label: 'Potência (kVA)', value: data.energia.potenciaKVA },
    { label: 'Tensão de Entrada', value: data.energia.tensaoEntrada },
    { label: 'Transformador', value: data.energia.transformadorOK ? 'OK' : 'NOK' },
  ]);

  await addPhotoGrid([
    { photo: data.energia.fotoQuadroGeral, label: 'Quadro Geral' },
    { photo: data.energia.fotoTransformador, label: 'Transformador' },
  ]);

  // Proteções
  checkNewPage(40);
  addSubSectionTitle('Proteções');
  addFieldRow('DR', data.energia.protecoes.drOK, data.energia.protecoes.drOK ? 'ok' : 'error');
  addFieldRow('DPS', data.energia.protecoes.dpsOK, data.energia.protecoes.dpsOK ? 'ok' : 'error');
  addFieldRow('Disjuntores', data.energia.protecoes.disjuntoresOK, data.energia.protecoes.disjuntoresOK ? 'ok' : 'error');
  addFieldRow('Termomagnéticos', data.energia.protecoes.termomagneticosOK, data.energia.protecoes.termomagneticosOK ? 'ok' : 'error');
  addFieldRow('Chave Geral', data.energia.protecoes.chaveGeralOK, data.energia.protecoes.chaveGeralOK ? 'ok' : 'error');

  // Cabos
  checkNewPage(25);
  addSubSectionTitle('Cabos');
  addFieldRow('Terminais Apertados', data.energia.cabos.terminaisApertados, data.energia.cabos.terminaisApertados ? 'ok' : 'error');
  addFieldRow('Isolação OK', data.energia.cabos.isolacaoOK, data.energia.cabos.isolacaoOK ? 'ok' : 'error');
  await addPhoto(data.energia.cabos.fotoCabos, 'Foto Cabos');

  // Placa
  checkNewPage(25);
  addSubSectionTitle('Placa');
  addFieldRow('Status', data.energia.placaStatus, data.energia.placaStatus === 'OK' ? 'ok' : 'error');
  await addPhoto(data.energia.fotoPlaca, 'Foto Placa');

  // ===== GMG & TOWER =====
  doc.addPage();
  addHeader();

  addSectionTitle('GMG - GRUPO MOTOR GERADOR', '🔋');
  addFieldRow('Possui GMG', data.gmg.informar, data.gmg.informar ? 'ok' : 'warning');
  if (data.gmg.informar) {
    addFieldRow('Fabricante', data.gmg.fabricante);
    addFieldRow('Potência (kVA)', data.gmg.potencia);
    addFieldRow('Autonomia (h)', data.gmg.autonomia);
    addFieldRow('Status', data.gmg.status, data.gmg.status === 'OK' ? 'ok' : 'error');
  }

  y += 10;
  addSectionTitle('TORRE E ZELADORIA', '🗼');
  addFieldRow('Ninhos na Torre', data.torre.ninhos, data.torre.ninhos ? 'error' : 'ok');
  addFieldRow('Fibras Protegidas', data.torre.fibrasProtegidas, data.torre.fibrasProtegidas ? 'ok' : 'error');
  addFieldRow('Aterramento', data.torre.aterramento, data.torre.aterramento === 'OK' ? 'ok' : 'error');
  addFieldRow('Zeladoria', data.torre.zeladoria, data.torre.zeladoria === 'OK' ? 'ok' : 'error');

  if (data.torre.ninhos && data.torre.fotoNinhos) {
    await addPhoto(data.torre.fotoNinhos, 'Foto Ninhos na Torre');
  }

  // ===== OBSERVATIONS =====
  doc.addPage();
  addHeader();

  addSectionTitle('OBSERVAÇÕES GERAIS', '📝');

  if (data.observacoes) {
    doc.setFillColor(...GRAY_LIGHT);
    const obsText = data.observacoes || 'Sem observações';
    const splitObs = doc.splitTextToSize(obsText, contentWidth - 10);
    const obsHeight = Math.min(splitObs.length * 5 + 10, 80);
    doc.roundedRect(margin, y, contentWidth, obsHeight, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(...GRAY_DARK);
    doc.setFont('helvetica', 'normal');
    doc.text(splitObs, margin + 5, y + 8);
    y += obsHeight + 5;
  } else {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY_MEDIUM);
    doc.text('Nenhuma observação registrada.', margin, y);
    y += 10;
  }

  await addPhoto(data.fotoObservacao, 'Foto Observação');

  // ===== SIGNATURE =====
  if (data.assinaturaDigital) {
    checkNewPage(70);
    addSectionTitle('ASSINATURA DIGITAL', '✍️');

    doc.setFillColor(...WHITE);
    doc.setDrawColor(...VIVO_PURPLE);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, 80, 45, 2, 2, 'FD');

    try {
      const sigData = await toDataUrl(data.assinaturaDigital);
      if (sigData) {
        doc.addImage(sigData.dataUrl, 'PNG', margin + 5, y + 5, 70, 30);
      }
    } catch (e) {
      console.error('Error adding signature:', e);
    }

    doc.setFontSize(8);
    doc.setTextColor(...GRAY_MEDIUM);
    doc.text(`Assinado por: ${data.tecnico}`, margin + 5, y + 40);
    y += 50;

    doc.setFillColor(...GRAY_LIGHT);
    doc.roundedRect(margin, y, contentWidth, 12, 1, 1, 'F');
    doc.setFontSize(7);
    doc.text(`Data/Hora: ${format(new Date(data.dataHora || new Date()), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, margin + 3, y + 5);
    doc.text(`Documento ID: ${data.id}`, margin + 3, y + 9);
  }

  // ===== ADD FOOTERS =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
