import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { createClient } from '@supabase/supabase-js';

// Opt-in integration tests against the suspended platform. No existing row is targeted.
const integration = process.env.RUN_INSPECTION_FREEZE_TESTS === '1' ? describe : describe.skip;
integration('Suspended inspection writes are denied by the hosted database', () => {
  function client(authenticated) {
    const env = Object.fromEntries(readFileSync('.env', 'utf8').split('\n')
      .filter(line => line.includes('='))
      .map(line => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')];
      }));
    const session = authenticated
      ? JSON.parse(readFileSync(`${homedir()}/.cache/lovable-auth/session.json`, 'utf8')).session
      : null;
    return createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: session ? { headers: { Authorization: `Bearer ${session.access_token}` } } : {},
    });
  }

  for (const table of ['reports', 'vandalismo_vistorias', 'vandalismo_itens', 'vandalismo_fotos']) {
    test(`${table}: anonymous and authenticated accounts cannot create, edit or delete`, async () => {
      for (const authenticated of [false, true]) {
        const db = client(authenticated);
        const missingId = '00000000-0000-0000-0000-000000000000';
        const results = [
          await db.from(table).insert({ id: missingId }),
          await db.from(table).update({ id: missingId }).eq('id', missingId),
          await db.from(table).delete().eq('id', missingId),
        ];
        for (const { error } of results) {
          expect(error?.code).toBe('42501');
        }
      }
    });
  }
});