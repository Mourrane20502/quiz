import jwt from 'jsonwebtoken'

const TOKEN_TTL = '12h'

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not configured')
  return secret
}

export function signAdminToken(admin) {
  return jwt.sign({ sub: admin.id, username: admin.username }, getSecret(), { expiresIn: TOKEN_TTL })
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Authentification requise.' })

  try {
    const payload = jwt.verify(token, getSecret())
    req.admin = { id: payload.sub, username: payload.username }
    next()
  } catch {
    res.status(401).json({ message: 'Session expirée, veuillez vous reconnecter.' })
  }
}
