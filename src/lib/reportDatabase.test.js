import { test, expect, mock } from 'bun:test';

let rows = [];
let ranges = [];
let failAt = null;
mock.module('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => {
      const query = {
        select: () => query,
        order: () => query,
        eq: () => query,
        ilike: () => query,
        gte: () => query,
        lte: () => query,
        range: async (from, to) => {
          ranges.push([from, to]);
          if (from === failAt) return { data: null, error: { message: 'offline' } };
          return { data: rows.slice(from, Math.min(to + 1, from + 1000)), error: null };
        },
      };
      return query;
    },
  },
}));

const { fetchReportsSummary, fetchReportsForDashboard, fetchReportsForExcel } = await import('./reportDatabase');
const { buildReportRow } = await import('./reportDatabase');
const { reportToChecklist } = await import('./reportToChecklist');
const { INITIAL_CHECKLIST } = await import('@/types/checklist');

test('PLC evidence survives database mapping and restores for editing', () => {
  const data = JSON.parse(JSON.stringify(INITIAL_CHECKLIST));
  data.id = 'draft';
  data.gabinetes[0].climatizacao.temPlcLeadLag = true;
  data.gabinetes[0].climatizacao.fotoPlcLeadLag = 'https://example.test/plc.jpg';
  const row = buildReportRow(data);
  expect(row.fotos_extras.gab1_plc_foto).toEqual(['https://example.test/plc.jpg']);
  expect(reportToChecklist(row).gabinetes[0].climatizacao.fotoPlcLeadLag).toBe('https://example.test/plc.jpg');
  data.gabinetes[0].climatizacao.fotoPlcLeadLag = null;
  expect(buildReportRow(data).fotos_extras).toBeNull();
});

for (const [name, fetchReports] of [
  ['dashboard', fetchReportsForDashboard],
  ['history', fetchReportsSummary],
  ['Excel', fetchReportsForExcel],
]) {
  test(`${name} returns every report beyond the 1000-row API cap`, async () => {
    rows = Array.from({ length: 2105 }, (_, i) => ({ id: String(i), site_code: `SITE_${i}` }));
    ranges = [];
    failAt = null;
    const result = await fetchReports();
    expect(result).toHaveLength(2105);
    expect(result[2104].id).toBe('2104');
    expect(new Set(result.map(row => row.id)).size).toBe(2105);
    expect(ranges.every(([from, to]) => to - from + 1 <= 1000)).toBe(true);
  });
}

test('dashboard rejects failed later pages instead of returning a partial total', async () => {
  rows = Array.from({ length: 1001 }, (_, i) => ({ id: String(i) }));
  ranges = [];
  failAt = 1000;
  await expect(fetchReportsForDashboard()).rejects.toThrow('offline');
  failAt = null;
});