import { z } from 'npm:zod@3';

export const entrySchema = z.object({
  fullName: z.string().trim().min(3).max(120).regex(/^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)+$/u, 'Informe nome e sobrenome.'),
  password: z.string().min(1).max(128),
});

export function validMonitorPath(path: string) {
  return path.length <= 2048 && path.startsWith('/') && !path.startsWith('//') && !/[\\\r\n]/.test(path);
}