import { z } from 'zod';
export const categorySchema = z.object({ name:z.string().trim().min(2,'O nome deve ter pelo menos 2 caracteres.').max(60,'O nome deve ter no máximo 60 caracteres.') });
export const dishSchema = z.object({
  name:z.string().trim().min(2,'Informe o nome do prato.').max(80),
  description:z.string().trim().max(240).optional().default(''),
  price:z.coerce.number().finite().positive('O preço deve ser maior que zero.'),
  available:z.boolean().optional().default(true),
});
