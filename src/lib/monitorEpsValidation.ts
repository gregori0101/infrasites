import { z } from 'zod';

export const monitorEpsEntrySchema = z.object({
  fullName: z.string().trim().min(3).max(120).regex(/^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)+$/u, 'Informe nome e sobrenome.'),
  password: z.string().min(1, 'Informe a senha de acesso.').max(128),
});