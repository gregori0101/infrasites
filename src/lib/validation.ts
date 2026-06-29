/**
 * Lightweight input validators for filter parameters used in DB queries.
 * Throws Error with a user-friendly message on invalid input.
 */

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

export interface ReportFilterParams {
  siteCode?: string;
  stateUf?: string;
  startDate?: string;
  endDate?: string;
  operadora?: string;
}

export function validateSiteCode(v: string | undefined, { allowPartial = false } = {}): void {
  if (!v) return;
  if (typeof v !== 'string' || v.length === 0 || v.length > 50) {
    throw new Error('Código de site inválido');
  }
  // Allow alphanumeric, dashes, underscores, spaces, % for ilike
  const re = allowPartial ? /^[A-Za-z0-9 _\-%.]{1,50}$/ : /^[A-Za-z0-9 _\-.]{1,50}$/;
  if (!re.test(v)) throw new Error('Código de site contém caracteres inválidos');
}

export function validateUf(v: string | undefined): void {
  if (!v) return;
  if (!/^[A-Z]{2}$/.test(v)) throw new Error('UF deve ter 2 letras maiúsculas');
}

export function validateIsoDate(v: string | undefined, label = 'data'): void {
  if (!v) return;
  if (typeof v !== 'string' || v.length > 40 || !ISO_DATE_RE.test(v) || Number.isNaN(Date.parse(v))) {
    throw new Error(`Formato de ${label} inválido`);
  }
}

export function validateOperadora(v: string | undefined): void {
  if (!v) return;
  if (!['VIVO', 'TEL', 'all'].includes(v)) throw new Error('Operadora inválida');
}

export function validateUuid(v: string | undefined, label = 'id'): void {
  if (!v) return;
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v)) {
    throw new Error(`${label} inválido`);
  }
}

export function validateReportFilters(f: ReportFilterParams | undefined): void {
  if (!f) return;
  validateSiteCode(f.siteCode, { allowPartial: true });
  validateUf(f.stateUf);
  validateIsoDate(f.startDate, 'data inicial');
  validateIsoDate(f.endDate, 'data final');
  validateOperadora(f.operadora);
}
