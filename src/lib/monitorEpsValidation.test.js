import { test, expect } from 'bun:test';
import { monitorEpsEntrySchema } from './monitorEpsValidation';

test('EPS requires both name and surname', () => {
  expect(monitorEpsEntrySchema.safeParse({ fullName: 'Gregori', password: 'test-password' }).success).toBe(false);
  expect(monitorEpsEntrySchema.safeParse({ fullName: 'Gregori José', password: 'test-password' }).success).toBe(true);
});