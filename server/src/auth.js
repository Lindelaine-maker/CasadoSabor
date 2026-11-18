import jwt from 'jsonwebtoken';
import { createHash, timingSafeEqual } from 'node:crypto';

function safeEqual(left, right) {
  const a = createHash('sha256').update(String(left ?? '')).digest();
  const b = createHash('sha256').update(String(right ?? '')).digest();
  return timingSafeEqual(a, b);
}

export function requireAdmin(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(503).json({ message: 'Autenticação administrativa não configurada no servidor.' });
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Faça login para realizar esta operação.' });
  }
  try {
    req.admin = jwt.verify(token, secret, { algorithms: ['HS256'], issuer: 'casa-do-sabor-api', audience: 'casa-do-sabor-admin' });
    return next();
  } catch {
    return res.status(401).json({ message: 'Sessão inválida ou expirada. Entre novamente.' });
  }
}
