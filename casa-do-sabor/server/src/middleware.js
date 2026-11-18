export function notFound(req, res) {
  res.status(404).json({ message: 'Rota não encontrada.' });
}
export function errorHandler(error, req, res, next) {
  if (error?.name === 'ZodError') {
    return res.status(400).json({
      message: 'Verifique os dados informados.',
      errors: error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message }))
    });
  }
  if (error?.code === 'P2002') return res.status(409).json({ message: 'Já existe uma categoria com esse nome.' });
  if (error?.code === 'P2025') return res.status(404).json({ message: 'Registro não encontrado.' });
  console.error(error);
  return res.status(500).json({ message: 'Ocorreu um erro interno. Tente novamente.' });
}
