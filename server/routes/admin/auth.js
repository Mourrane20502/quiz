import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../../config/db.js'
import { requireAdmin, signAdminToken } from '../../middleware/auth.js'

const router = Router()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000
const failures = new Map()

function isLocked(key) {
  const entry = failures.get(key)
  if (!entry) return false
  if (Date.now() - entry.first > WINDOW_MS) {
    failures.delete(key)
    return false
  }
  return entry.count >= MAX_ATTEMPTS
}

function recordFailure(key) {
  const entry = failures.get(key)
  if (!entry || Date.now() - entry.first > WINDOW_MS) failures.set(key, { count: 1, first: Date.now() })
  else entry.count += 1
}

router.post('/login', async (req, res, next) => {
  const username = req.body?.username?.trim().toLowerCase()
  const password = req.body?.password ?? ''
  const key = `${req.ip}:${username}`

  if (!username || !password) { 
    return res.status(422).json({ message: 'E-mail et mot de passe requis.' })
  }
  if (isLocked(key)) {
    return res.status(429).json({ message: 'Trop de tentatives. Réessayez dans quelques minutes.' })
  }

  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username])
    const admin = rows[0]
    const valid = admin && (await bcrypt.compare(password, admin.password_hash))

    if (!valid) {
      recordFailure(key)
      return res.status(401).json({ message: 'E-mail ou mot de passe incorrect.' })
    }

    failures.delete(key)
    await pool.query('UPDATE admins SET last_login_at = NOW() WHERE id = ?', [admin.id])
    res.json({ token: signAdminToken(admin), admin: { id: admin.id, username: admin.username } })
  } catch (err) {
    next(err)
  }
})

router.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin })
})

export default router
