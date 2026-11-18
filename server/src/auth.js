import jwt from 'jsonwebtoken';

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
    if (req.admin.role !== 'admin') return res.status(403).json({ message: 'Acesso administrativo necessário.' });
    return next();
  } catch {
    return res.status(401).json({ message: 'Sessão inválida ou expirada. Entre novamente.' });
  }
}
