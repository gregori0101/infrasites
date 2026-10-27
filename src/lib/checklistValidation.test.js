import { test, expect } from 'bun:test';
import { INITIAL_CHECKLIST } from '@/types/checklist';
import { validateChecklist, validateStep } from '@/hooks/use-validation';

const draft = () => JSON.parse(JSON.stringify(INITIAL_CHECKLIST));

test('submission cannot skip required site fields by jumping to finalization', () => {
  const data = draft();
  data.tecnico = 'Técnico Teste';
  const result = validateChecklist(data);
  expect(result.isValid).toBe(false);
  expect(result.step).toBe(0);
  expect(result.errors.some(e => e.field === 'fotoPanoramica')).toBe(true);
});

test('every cabinet is validated, not just the selected one', () => {
  const data = draft();
  data.siglaSite = 'MNS_G1I01';
  data.fotoPanoramica = 'https://example.test/photo.jpg';
  data.gabinetes[0].tipo = 'OUTRO';
  data.gabinetes[0].tecnologiasAcesso = ['4G'];
  data.gabinetes.push(draft().gabinetes[0]);
  const result = validateChecklist(data);
  expect(result.isValid).toBe(false);
  expect(result.step).toBe(1);
  expect(result.gabinete).toBe(1);
});

test('PLC SIM requires status and photo, while NA bypasses its validation', () => {
  const data = draft();
  data.gabinetes[0].climatizacao.temPlcLeadLag = true;
  expect(validateStep(data, 4, 0).errors.map(e => e.field)).toEqual(['climatizacao.plcLeadLagStatus', 'climatizacao.fotoPlcLeadLag']);
  data.gabinetes[0].climatizacao.plcLeadLagStatus = 'NOK';
  data.gabinetes[0].climatizacao.fotoPlcLeadLag = 'https://example.test/plc.jpg';
  expect(validateStep(data, 4, 0).isValid).toBe(true);
  data.gabinetes[0].climatizacao.fotoPlcLeadLag = null;
  data.secoesNaoAplicaveis.climatizacao = true;
  expect(validateStep(data, 4, 0).isValid).toBe(true);
});