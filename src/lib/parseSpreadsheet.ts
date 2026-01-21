import * as XLSX from 'xlsx';

export interface SpreadsheetSite {
  site_code: string;
  uf: string;
  tipo: string;
}

export interface ParseResult {
  sites: SpreadsheetSite[];
  errors: string[];
}

const VALID_UFS = ['PA', 'AM', 'MA', 'RR', 'AP'];

export function parseSpreadsheet(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
        
        if (jsonData.length < 2) {
          resolve({ sites: [], errors: ['Planilha vazia ou sem dados'] });
          return;
        }

        // Find column indices
        const headers = (jsonData[0] as string[]).map(h => 
          String(h || '').toUpperCase().trim()
        );
        
        const siteIdx = headers.findIndex(h => h === 'SITE' || h === 'SIGLA' || h === 'SITE_CODE');
        const ufIdx = headers.findIndex(h => h === 'UF' || h === 'ESTADO');
        const tipoIdx = headers.findIndex(h => h === 'TIPO' || h === 'TYPE');

        const errors: string[] = [];

        if (siteIdx === -1) {
          errors.push('Coluna SITE não encontrada. Use "SITE" ou "SIGLA" como cabeçalho.');
        }
        if (ufIdx === -1) {
          errors.push('Coluna UF não encontrada. Use "UF" ou "ESTADO" como cabeçalho.');
        }
        if (tipoIdx === -1) {
          errors.push('Coluna TIPO não encontrada. Use "TIPO" como cabeçalho.');
        }

        if (errors.length > 0) {
          resolve({ sites: [], errors });
          return;
        }

        const sites: SpreadsheetSite[] = [];

        // Parse data rows
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as string[];
          const site_code = String(row[siteIdx] || '').toUpperCase().trim();
          const uf = String(row[ufIdx] || '').toUpperCase().trim();
          const tipo = String(row[tipoIdx] || '').trim();

          // Validate row
          if (!site_code) {
            errors.push(`Linha ${i + 1}: SITE vazio`);
            continue;
          }

          if (site_code.length !== 5) {
            errors.push(`Linha ${i + 1}: SITE "${site_code}" deve ter 5 caracteres`);
            continue;
          }

          if (!VALID_UFS.includes(uf)) {
            errors.push(`Linha ${i + 1}: UF "${uf}" inválida. Use: ${VALID_UFS.join(', ')}`);
            continue;
          }

          if (!tipo) {
            errors.push(`Linha ${i + 1}: TIPO vazio`);
            continue;
          }

          sites.push({ site_code, uf, tipo });
        }

        resolve({ sites, errors });
      } catch (error) {
        reject(new Error('Erro ao processar planilha: ' + (error as Error).message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsBinaryString(file);
  });
}

export function generateTemplateSpreadsheet(): Blob {
  const wb = XLSX.utils.book_new();
  
  const data = [
    ['SITE', 'UF', 'TIPO'],
    ['PACRE', 'PA', 'Indoor'],
    ['AMBEL', 'AM', 'Outdoor'],
    ['MAPRO', 'MA', 'Rooftop'],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 10 },
    { wch: 5 },
    { wch: 15 }
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Sites');
  
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
