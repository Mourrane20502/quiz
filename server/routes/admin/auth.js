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

router.put('/password', requireAdmin, async (req, res, next) => {
  const currentPassword = req.body?.currentPassword ?? ''
  const newPassword = req.body?.newPassword ?? ''
  const key = `password:${req.admin.id}`

  const errors = {}
  if (!currentPassword) errors.currentPassword = 'Le mot de passe actuel est requis.'
  if (newPassword.length < 8) errors.newPassword = 'Le nouveau mot de passe doit contenir au moins 8 caractères.'
  else if (newPassword.length > 72) errors.newPassword = 'Le mot de passe ne doit pas dépasser 72 caractères.'
  else if (newPassword === currentPassword) errors.newPassword = 'Le nouveau mot de passe doit être différent de l’actuel.'
  if (Object.keys(errors).length) {
    return res.status(422).json({ message: 'Veuillez corriger les champs indiqués.', errors })
  }
  if (isLocked(key)) {
    return res.status(429).json({ message: 'Trop de tentatives. Réessayez dans quelques minutes.' })
  }

  try {
    const [rows] = await pool.query('SELECT password_hash FROM admins WHERE id = ?', [req.admin.id])
    if (!rows.length) return res.status(401).json({ message: 'Compte introuvable.' })

    if (!(await bcrypt.compare(currentPassword, rows[0].password_hash))) {
      recordFailure(key)
      return res.status(422).json({
        message: 'Le mot de passe actuel est incorrect.',
        errors: { currentPassword: 'Mot de passe actuel incorrect.' },
      })
    }

    failures.delete(key)
    const hash = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?', [hash, req.admin.id])
    res.json({ message: 'Mot de passe modifié avec succès.' })
  } catch (err) {
    next(err)
  }
})

export default router
