import { Router } from 'express'
import pool from '../../config/db.js'
import { CONTENT_DEFAULTS, CONTENT_FIELDS } from '../../data/content.js'
import { getContent } from '../../services/content.js'

const router = Router()

const LIMITS = Object.fromEntries(Object.entries(CONTENT_FIELDS).map(([key, field]) => [key, field.max]))
const payload = async () => ({ content: await getContent(), defaults: CONTENT_DEFAULTS, limits: LIMITS })

router.get('/', async (req, res, next) => {
  try {
    res.json(await payload())
  } catch (err) {
    next(err)
  }
})

router.put('/', async (req, res, next) => {
  const input = req.body?.content
  if (!input || typeof input !== 'object') return res.status(422).json({ message: 'Contenu invalide.' })

  const errors = {}
  const updates = []
  for (const [key, raw] of Object.entries(input)) {
    const field = CONTENT_FIELDS[key]
    if (!field) continue
    const value = typeof raw === 'string' ? raw.trim() : ''
    if (!value) errors[key] = 'Ce champ est obligatoire.'
    else if (value.length > field.max) errors[key] = `${field.max} caractères maximum.`
    else updates.push([key, value])
  }
  if (Object.keys(errors).length) {
    return res.status(422).json({ message: 'Veuillez corriger les champs indiqués.', errors })
  }

  try {
    for (const [key, value] of updates) {
      if (value === CONTENT_DEFAULTS[key]) {
        await pool.query('DELETE FROM site_content WHERE content_key = ?', [key])
      } else {
        await pool.query(
          `INSERT INTO site_content (content_key, content_value) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE content_value = VALUES(content_value)`,
          [key, value],
        )
      }
    }
    res.json(await payload())
  } catch (err) {
    next(err)
  }
})

export default router
