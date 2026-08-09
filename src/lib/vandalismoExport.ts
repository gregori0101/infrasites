import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { format } from 'date-fns';
import { getVistoriaVandalismo, VandalismoVistoriaResumo } from '@/lib/vandalismoDatabase';
import { generateVandalismoPDF } from '@/lib/generateVandalismoPDF';
import { resolveStorageUrl } from '@/lib/storageUrl';
import { VANDALISMO_ITENS } from '@/types/vandalismo';

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Full consolidated spreadsheet of all vandalism cases. */
export function generateVandalismoExcel(vistorias: VandalismoVistoriaResumo[]): Blob {
  const rows = vistorias.map((v) => {
    const base: Record<string, string | number> = {
      'Sigla do Site': v.site_code,
      Estado: v.estado ?? '-',
      Município: v.municipio ?? '-',
      Data: format(new Date(v.created_at), 'dd/MM/yyyy HH:mm'),
      Técnico: v.tecnico ?? '-',
      Operadora: v.operadora ?? '-',
      Descrição: v.descricao,
      'BO Anexado': v.bo_url ? 'SIM' : 'NÃO',
      'Total de Vandalismos Anteriores do Site': v.totalAnterior ?? 0,
      'Total de Itens': v.totalItens,
      'Total de Vulnerabilidades': v.vulneraveis,
      'Índice de Vulnerabilidade (%)': Number(v.indiceVulnerabilidade.toFixed(1)),
      Latitude: v.latitude ?? '',
      Longitude: v.longitude ?? '',
    };
    for (const def of VANDALISMO_ITENS) {
      const item = v.itens.find((i) => i.item_key === def.key);
      base[def.rotulo] = item ? (item.vulneravel ? 'VULNERÁVEL' : 'OK') : 'N/A';
    }
    return base;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = Object.keys(rows[0] ?? { A: '' }).map(() => ({ wch: 22 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vandalismo');
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function downloadCasePDF(id: string, siteCode: string) {
  const completa = await getVistoriaVandalismo(id);
  if (!completa) throw new Error('Vistoria não encontrada');
  const blob = await generateVandalismoPDF(completa);
  downloadBlob(blob, `Vandalismo_${siteCode}_${format(new Date(completa.created_at), 'yyyy-MM-dd')}.pdf`);
}

async function fetchBO(boUrl: string): Promise<Blob | null> {
  const resolved = (await resolveStorageUrl(boUrl)) ?? boUrl;
  try {
    const res = await fetch(resolved);
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

export async function downloadBO(boUrl: string, boNome: string | null) {
  const blob = await fetchBO(boUrl);
  if (!blob) throw new Error('Não foi possível baixar o BO');
  downloadBlob(blob, boNome || 'boletim-ocorrencia');
}

/** Build a ZIP with PDFs (and BOs) for the selected cases. */
export async function downloadCasesZip(
  vistorias: VandalismoVistoriaResumo[],
  onProgress?: (done: number, total: number) => void,
) {
  const zip = new JSZip();
  let done = 0;
  for (const v of vistorias) {
    try {
      const completa = await getVistoriaVandalismo(v.id);
      if (completa) {
        const pdf = await generateVandalismoPDF(completa);
        const folder = zip.folder(`${v.site_code}_${format(new Date(v.created_at), 'yyyy-MM-dd')}_${v.id.slice(0, 6)}`)!;
        folder.file(`Relatorio_${v.site_code}.pdf`, pdf);
        if (completa.bo_url) {
          const bo = await fetchBO(completa.bo_url);
          if (bo) folder.file(completa.bo_nome || `BO_${v.site_code}`, bo);
        }
      }
    } catch (err) {
      console.warn('[vandalismoExport] falha no caso', v.id, err);
    }
    done += 1;
    onProgress?.(done, vistorias.length);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, `Vandalismo_Relatorios_${format(new Date(), 'yyyy-MM-dd_HHmm')}.zip`);
}
