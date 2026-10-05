import fs from 'node:fs/promises'
import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import pool from '../../config/db.js'
import { CONTENT_DEFAULTS, CONTENT_FIELDS, LOGO_SLOTS, logoKey } from '../../data/content.js'
import { LOGO_DIR, uploadLogo } from '../../middleware/upload.js'
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

const removeLogoFile = (filename) => (filename ? fs.unlink(path.join(LOGO_DIR, filename)).catch(() => {}) : null)

async function currentLogoFile(slot) {
  const [rows] = await pool.query('SELECT content_value FROM site_content WHERE content_key = ?', [logoKey(slot)])
  return rows[0]?.content_value ?? null
}

function checkSlot(req, res, next) {
  if (LOGO_SLOTS.includes(req.params.slot)) return next()
  res.status(404).json({ message: 'Logo inconnu.' })
}

function handleLogoUpload(req, res, next) {
  uploadLogo(req, res, (err) => {
    if (!err) return next()
    const message =
      err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
        ? 'Le logo ne doit pas dépasser 2 Mo.'
        : 'Format non supporté (PNG, JPG ou WEBP).'
    res.status(400).json({ message })
  })
}

router.post('/logos/:slot', checkSlot, handleLogoUpload, async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu.' })
  try {
    const previous = await currentLogoFile(req.params.slot)
    await pool.query(
      `INSERT INTO site_content (content_key, content_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE content_value = VALUES(content_value)`,
      [logoKey(req.params.slot), req.file.filename],
    )
    await removeLogoFile(previous)
    res.json(await payload())
  } catch (err) {
    await removeLogoFile(req.file.filename)
    next(err)
  }
})

router.delete('/logos/:slot', checkSlot, async (req, res, next) => {
  try {
    const previous = await currentLogoFile(req.params.slot)
    await pool.query('DELETE FROM site_content WHERE content_key = ?', [logoKey(req.params.slot)])
    await removeLogoFile(previous)
    res.json(await payload())
  } catch (err) {
    next(err)
  }
})

export default router
