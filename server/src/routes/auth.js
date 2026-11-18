import { Router } from 'express';
import { createHash, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();
const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

function safeEqual(left, right) {
  const a = createHash('sha256').update(String(left ?? '')).digest();
  const b = createHash('sha256').update(String(right ?? '')).digest();
  return timingSafeEqual(a, b);
}

router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Informe usuário e senha.' });

  const { username, password } = parsed.data;
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.JWT_SECRET;
  if (!expectedUsername || !expectedPassword || !secret) {
    return res.status(503).json({ message: 'Login administrativo ainda não foi configurado no servidor.' });
  }
  if (!safeEqual(username, expectedUsername) || !safeEqual(password, expectedPassword)) {
    return res.status(401).json({ message: 'Usuário ou senha incorretos.' });
  }

  const token = jwt.sign({ role: 'admin', sub: expectedUsername }, secret, {
    algorithm: 'HS256',
    expiresIn: '8h',
    issuer: 'casa-do-sabor-api',
    audience: 'casa-do-sabor-admin',
  });
  return res.json({ token, expiresIn: 28800 });
});

export default router;
