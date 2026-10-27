import { test, expect, mock } from 'bun:test';
let paths = [];
mock.module('@/integrations/supabase/client', () => ({ supabase: { storage: { from: () => ({
  upload: async path => { paths.push(path); return { error: null }; },
  createSignedUrl: async path => ({ data: { signedUrl: `https://example.test/${path}` }, error: null }),
}) } } }));
mock.module('./imageCompression', () => ({
  isBase64DataURL: () => true,
  getBase64SizeKB: () => 1,
  compressToMaxSize: async value => value,
}));
const { uploadAllPhotos } = await import('./photoStorage');

test('PLC photo is uploaded and the source draft remains unchanged', async () => {
  const photo = 'data:image/jpeg;base64,YQ==';
  const data = { gabinetes: [{ climatizacao: { fotoPlcLeadLag: photo } }] };
  paths = [];
  const result = await uploadAllPhotos(data, 'MNS_G1I01');
  expect(paths).toHaveLength(1);
  expect(paths[0]).toContain('gabinete_1_plc_lead_lag');
  expect(result.gabinetes[0].climatizacao.fotoPlcLeadLag).toStartWith('https://');
  expect(data.gabinetes[0].climatizacao.fotoPlcLeadLag).toBe(photo);
});