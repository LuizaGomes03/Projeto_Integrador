import jwt from 'jsonwebtoken'
 
/**
 * Verifica o JWT enviado no header Authorization.
 * Uso: router.get('/rota', authMiddleware, handler)
 * Popula req.usuario com { id, nome, email, tipo }
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
 
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação ausente.' })
  }
 
  const token = authHeader.split(' ')[1]
 
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = payload
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Token expirado. Faça login novamente.' })
    }
    return res.status(401).json({ erro: 'Token inválido.' })
  }
}
 
/**
 * Restringe acesso a professores.
 * Deve ser usado APÓS authMiddleware.
 */
export function apenasProfessor(req, res, next) {
  if (req.usuario?.tipo !== 'professor') {
    return res.status(403).json({ erro: 'Acesso restrito a professores.' })
  }
  next()
}
 