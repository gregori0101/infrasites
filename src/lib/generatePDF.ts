import jsPDF from 'jspdf';
import { ChecklistData } from '@/types/checklist';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export async function generatePDF(data: ChecklistData): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  const primaryColor: [number, number, number] = [0, 93, 170]; // Vivo Blue
  const accentColor: [number, number, number] = [255, 107, 53]; // Vivo Orange

  const addHeader = () => {
    // Vivo purple gradient header
    doc.setFillColor(102, 0, 153); // Vivo Purple
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Vivo Logo text (simulated)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('vivo', margin, 14);
    
    // Orange accent dot
    doc.setFillColor(255, 107, 53);
    doc.circle(margin + 25, 10, 3, 'F');
    
    doc.setFontSize(12);
    doc.text('CHECKLIST SITES TELECOM', margin + 35, 14);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.siglaSite} - ${data.uf}`, pageWidth - margin, 15, { align: 'right' });
    y = 35;
  };

  const checkNewPage = (neededSpace: number = 30) => {
    if (y + neededSpace > pageHeight - margin) {
      doc.addPage();
      addHeader();
    }
  };

  const addSectionTitle = (title: string) => {
    checkNewPage(20);
    doc.setFillColor(...accentColor);
    doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 3, y + 5.5);
    y += 12;
    doc.setTextColor(0, 0, 0);
  };

  const addSubSectionTitle = (title: string) => {
    checkNewPage(15);
    doc.setFillColor(220, 220, 220);
    doc.rect(margin, y, pageWidth - 2 * margin, 6, 'F');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 3, y + 4.5);
    y += 10;
    doc.setTextColor(0, 0, 0);
  };

  const addField = (label: string, value: string | number | boolean | null | undefined) => {
    checkNewPage(10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(label + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const displayValue = value === null || value === undefined ? '-' : 
                         typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : 
                         String(value);
    doc.text(displayValue, margin + 50, y);
    y += 6;
  };

  const addPhoto = async (photo: string | null, label: string) => {
    if (!photo) return;
    checkNewPage(55);
    
    try {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(label, margin, y);
      y += 3;
      
      const imgWidth = 60;
      const imgHeight = 45;
      doc.addImage(photo, 'JPEG', margin, y, imgWidth, imgHeight);
      y += imgHeight + 5;
    } catch (error) {
      console.error('Error adding image:', error);
      y += 5;
    }
  };

  const addPhotosGrid = async (photos: (string | null)[], labels: string[]) => {
    const validPhotos = photos.filter((p, i) => p && labels[i]).map((p, i) => ({ photo: p, label: labels[i] }));
    if (validPhotos.length === 0) return;

    for (let i = 0; i < validPhotos.length; i += 2) {
      checkNewPage(55);
      
      // First photo
      if (validPhotos[i]) {
        try {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(validPhotos[i].label, margin, y);
          doc.addImage(validPhotos[i].photo!, 'JPEG', margin, y + 3, 55, 40);
        } catch (e) {
          console.error('Error adding image:', e);
        }
      }
      
      // Second photo (side by side)
      if (validPhotos[i + 1]) {
        try {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(validPhotos[i + 1].label, margin + 65, y);
          doc.addImage(validPhotos[i + 1].photo!, 'JPEG', margin + 65, y + 3, 55, 40);
        } catch (e) {
          console.error('Error adding image:', e);
        }
      }
      
      y += 48;
    }
  };

  // === COVER PAGE ===
  addHeader();
  
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, pageWidth - 2 * margin, 50, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(data.siglaSite || 'N/A', pageWidth / 2, y + 20, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(`Estado: ${data.uf}`, pageWidth / 2, y + 30, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, y + 40, { align: 'center' });
  y += 60;

  // Site Info
  addSectionTitle('Dados do Site');
  addField('Sigla SCIENCE SITE', data.siglaSite);
  addField('UF', data.uf);
  addField('Quantidade de Gabinetes', data.qtdGabinetes);
  addField('Abrigo Selecionado', data.abrigoSelecionado);
  addField('Técnico', data.tecnico);

  await addPhoto(data.fotoPanoramica, 'Foto Panorâmica do Site');

  // === GABINETES ===
  for (let i = 0; i < data.gabinetes.length; i++) {
    const gab = data.gabinetes[i];
    doc.addPage();
    addHeader();

    addSectionTitle(`Gabinete ${i + 1} - Informações Gerais`);
    addField('Tipo', gab.tipo);
    addField('Com Proteção', gab.comProtecao);
    addField('Tecnologias de Acesso', gab.tecnologiasAcesso.join(', ') || '-');
    addField('Tecnologias de Transporte', gab.tecnologiasTransporte.join(', ') || '-');

    // FCC
    addSectionTitle(`Gabinete ${i + 1} - FCC`);
    addField('Fabricante', gab.fcc.fabricante);
    addField('Tensão DC', gab.fcc.tensaoDC);
    addField('Consumo DC (W)', gab.fcc.consumoDC);
    addField('URs Suportadas', gab.fcc.qtdURSuportadas);
    addField('Gerenciada SG Infra', gab.fcc.gerenciadaSG);
    addField('Gerenciável', gab.fcc.gerenciavel);
    
    await addPhoto(gab.fcc.fotoPanoramica, 'FCC Panorâmica');
    await addPhoto(gab.fcc.fotoPainel, 'FCC Painel de Instrumentos');

    // Baterias
    checkNewPage(40);
    addSectionTitle(`Gabinete ${i + 1} - Baterias`);
    addField('Número de Bancos', gab.baterias.numBancos);
    addField('Bancos Interligados', gab.baterias.bancosInterligados);
    
    gab.baterias.bancos.forEach((banco, idx) => {
      checkNewPage(35);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...accentColor);
      doc.text(`Banco ${idx + 1}:`, margin, y);
      y += 5;
      doc.setTextColor(0, 0, 0);
      addField('  Tipo', banco.tipo);
      addField('  Fabricante', banco.fabricante);
      addField('  Capacidade (Ah)', banco.capacidadeAh);
      addField('  Data Fabricação', banco.dataFabricacao || '-');
      addField('  Estado', banco.estado);
    });

    await addPhoto(gab.baterias.fotoBanco, 'Foto Banco de Baterias');

    // Climatização
    checkNewPage(50);
    addSectionTitle(`Gabinete ${i + 1} - Climatização`);
    addField('Tipo', gab.climatizacao.tipo);
    addField('Fan OK', gab.climatizacao.fanOK);
    addField('PLC Lead-Lag', gab.climatizacao.plcLeadLag);
    addField('Alarmística', gab.climatizacao.alarmistica);

    if (gab.climatizacao.acs.length > 0) {
      gab.climatizacao.acs.forEach((ac, idx) => {
        addField(`  AC ${idx + 1} - Modelo`, ac.modelo);
        addField(`  AC ${idx + 1} - Funcionamento`, ac.funcionamento);
      });
    }

    await addPhoto(gab.climatizacao.fotoAR1, 'Ar Condicionado 1');
    await addPhoto(gab.climatizacao.fotoAR2, 'Ar Condicionado 2');
    await addPhoto(gab.climatizacao.fotoCondensador, 'Condensador');
    await addPhoto(gab.climatizacao.fotoEvaporador, 'Evaporador');

    // Equipamentos
    checkNewPage(60);
    addSectionTitle(`Gabinete ${i + 1} - Equipamentos`);
    await addPhoto(gab.fotoTransmissao, 'Equipamentos de Transmissão');
    await addPhoto(gab.fotoAcesso, 'Equipamentos de Acesso');
  }

  // === SEÇÃO FIBRA ===
  doc.addPage();
  addHeader();

  addSectionTitle('Fibra Óptica');
  
  // Acesso da Fibra
  addSubSectionTitle('Acesso da Fibra');
  addField('Número de Abordagens', data.fibra.numAbordagens);
  
  // Abordagem 1
  addField('Abordagem 1 - Tipo', data.fibra.abordagem1.tipo);
  if (data.fibra.abordagem1.tipo === 'SUBTERRÂNEA') {
    addField('Abordagem 1 - Subida Lateral OK', data.fibra.abordagem1.subidaLateralOK);
    
    // Fotos caixas subterrâneas
    if (data.fibra.abordagem1.fotoCaixasSubterraneas && data.fibra.abordagem1.fotoCaixasSubterraneas.length > 0) {
      for (let i = 0; i < data.fibra.abordagem1.fotoCaixasSubterraneas.length; i++) {
        await addPhoto(data.fibra.abordagem1.fotoCaixasSubterraneas[i], `Abordagem 1 - Caixa Subterrânea ${i + 1}`);
      }
    }
    
    // Fotos subida lateral NOK
    if (!data.fibra.abordagem1.subidaLateralOK && data.fibra.abordagem1.fotoSubidaLateral && data.fibra.abordagem1.fotoSubidaLateral.length > 0) {
      for (let i = 0; i < data.fibra.abordagem1.fotoSubidaLateral.length; i++) {
        await addPhoto(data.fibra.abordagem1.fotoSubidaLateral[i], `Abordagem 1 - Subida Lateral NOK ${i + 1}`);
      }
    }
  }

  // Abordagem 2 (se existir)
  if (data.fibra.numAbordagens === 2 && data.fibra.abordagem2) {
    addField('Abordagem 2 - Tipo', data.fibra.abordagem2.tipo);
    if (data.fibra.abordagem2.tipo === 'SUBTERRÂNEA') {
      addField('Abordagem 2 - Subida Lateral OK', data.fibra.abordagem2.subidaLateralOK);
      
      if (data.fibra.abordagem2.fotoCaixasSubterraneas && data.fibra.abordagem2.fotoCaixasSubterraneas.length > 0) {
        for (let i = 0; i < data.fibra.abordagem2.fotoCaixasSubterraneas.length; i++) {
          await addPhoto(data.fibra.abordagem2.fotoCaixasSubterraneas[i], `Abordagem 2 - Caixa Subterrânea ${i + 1}`);
        }
      }
      
      if (!data.fibra.abordagem2.subidaLateralOK && data.fibra.abordagem2.fotoSubidaLateral && data.fibra.abordagem2.fotoSubidaLateral.length > 0) {
        for (let i = 0; i < data.fibra.abordagem2.fotoSubidaLateral.length; i++) {
          await addPhoto(data.fibra.abordagem2.fotoSubidaLateral[i], `Abordagem 2 - Subida Lateral NOK ${i + 1}`);
        }
      }
    }
    addField('Convergência', data.fibra.convergencia);
  }

  // Foto geral abordagens
  await addPhoto(data.fibra.fotoGeralAbordagens, 'Foto Geral das Abordagens');

  // Caixas de Passagem
  checkNewPage(30);
  addSubSectionTitle('Caixas de Passagem');
  addField('Existem Caixas de Passagem', data.fibra.caixasPassagemExistem);
  if (data.fibra.caixasPassagemExistem) {
    addField('Padrão Correto', data.fibra.caixasPassagemPadrao);
    if (data.fibra.fotosCaixasPassagem && data.fibra.fotosCaixasPassagem.length > 0) {
      for (let i = 0; i < data.fibra.fotosCaixasPassagem.length; i++) {
        await addPhoto(data.fibra.fotosCaixasPassagem[i], `Caixa de Passagem ${i + 1}`);
      }
    }
  }

  // DGOs
  checkNewPage(30);
  addSubSectionTitle('DGOs');
  addField('Quantidade de DGOs', data.fibra.numDGOs);

  for (let i = 0; i < data.fibra.dgos.length; i++) {
    const dgo = data.fibra.dgos[i];
    checkNewPage(60);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text(`DGO ${i + 1}:`, margin, y);
    y += 5;
    doc.setTextColor(0, 0, 0);
    
    addField('  Capacidade', dgo.capacidade);
    addField('  Formatos', dgo.formatos.join(', ') || '-');
    addField('  Estado Físico', dgo.estadoFisico);
    addField('  Organização Cordões', dgo.organizacaoCordoes);
    
    await addPhoto(dgo.fotoExterno, `DGO ${i + 1} - Foto Externa`);
    
    if (dgo.organizacaoCordoes === 'NOK' && dgo.fotoCordoes) {
      await addPhoto(dgo.fotoCordoes, `DGO ${i + 1} - Cordões NOK`);
    }
  }

  // Observações DGOs
  if (data.fibra.observacoesDGOs) {
    checkNewPage(20);
    addField('Observações DGOs', data.fibra.observacoesDGOs);
    await addPhoto(data.fibra.fotoObservacoesDGOs, 'Foto Observação DGOs');
  }

  // === SEÇÃO ENERGIA ===
  doc.addPage();
  addHeader();

  addSectionTitle('Energia');
  
  addField('Tipo de Quadro', data.energia.tipoQuadro);
  addField('Fabricante', data.energia.fabricante);
  addField('Potência (kVA)', data.energia.potenciaKVA);
  addField('Tensão de Entrada', data.energia.tensaoEntrada);
  addField('Transformador', data.energia.transformadorOK ? 'OK' : 'NOK');
  
  if (!data.energia.transformadorOK) {
    await addPhoto(data.energia.fotoTransformador, 'Transformador NOK');
  }
  await addPhoto(data.energia.fotoQuadroGeral, 'Quadro Geral');

  // Proteções
  checkNewPage(50);
  addSubSectionTitle('Proteções');
  addField('DR OK', data.energia.protecoes.drOK);
  addField('DPS OK', data.energia.protecoes.dpsOK);
  addField('Disjuntores OK', data.energia.protecoes.disjuntoresOK);
  addField('Termomagnéticos OK', data.energia.protecoes.termomagneticosOK);
  addField('Chave Geral OK', data.energia.protecoes.chaveGeralOK);

  // Cabos
  checkNewPage(30);
  addSubSectionTitle('Cabos');
  addField('Terminais Apertados', data.energia.cabos.terminaisApertados);
  addField('Isolação OK', data.energia.cabos.isolacaoOK);
  
  if (!data.energia.cabos.terminaisApertados || !data.energia.cabos.isolacaoOK) {
    await addPhoto(data.energia.cabos.fotoCabos, 'Cabos NOK');
  }

  // Placa
  checkNewPage(30);
  addSubSectionTitle('Placa');
  addField('Status', data.energia.placaStatus);
  
  if (data.energia.placaStatus !== 'OK') {
    await addPhoto(data.energia.fotoPlaca, 'Placa NOK');
  }

  // === GMG E TORRE ===
  doc.addPage();
  addHeader();

  addSectionTitle('GMG - Grupo Motor Gerador');
  addField('Informar GMG', data.gmg.informar);
  if (data.gmg.informar) {
    addField('Fabricante', data.gmg.fabricante);
    addField('Potência (kVA)', data.gmg.potencia);
    addField('Autonomia (h)', data.gmg.autonomia);
    addField('Status', data.gmg.status);
  }

  addSectionTitle('Torre e Zeladoria');
  addField('Ninhos na Torre', data.torre.ninhos);
  addField('Fibras Protegidas', data.torre.fibrasProtegidas);
  addField('Aterramento', data.torre.aterramento);
  addField('Zeladoria', data.torre.zeladoria);
  
  await addPhoto(data.torre.fotoNinhos, 'Foto Ninhos');

  // === OBSERVAÇÕES ===
  addSectionTitle('Observações');
  checkNewPage(30);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const splitObs = doc.splitTextToSize(data.observacoes || 'Sem observações', pageWidth - 2 * margin);
  doc.text(splitObs, margin, y);
  y += splitObs.length * 5 + 5;

  await addPhoto(data.fotoObservacao, 'Foto Observação');

  // === ASSINATURA ===
  if (data.assinaturaDigital) {
    checkNewPage(60);
    addSectionTitle('Assinatura Digital');
    try {
      doc.addImage(data.assinaturaDigital, 'PNG', margin, y, 60, 30);
      y += 35;
    } catch (e) {
      console.error('Error adding signature:', e);
    }
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Assinado por: ${data.tecnico}`, margin, y);
    y += 4;
    doc.text(`Data/Hora: ${format(new Date(data.dataHora || new Date()), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, margin, y);
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('Checklist Sites Telecom - Confidencial', pageWidth - margin, pageHeight - 10, { align: 'right' });
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
