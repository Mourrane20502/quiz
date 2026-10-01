import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import pool, { isQuizActive } from '../config/db.js'
import { uploadAvatar, UPLOAD_DIR, avatarUrl } from '../middleware/upload.js'
import { getActiveQuestions } from '../services/scoring.js'

const router = Router()

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+?[0-9\s.-]{8,20}$/

const toPublic = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  avatar: avatarUrl(row.avatar),
})

function validate({ fullName, email, phone }) {
  const errors = {}
  if (!fullName || fullName.length < 3) errors.fullName = 'Le nom complet est requis (3 caractères min).'
  if (!email || !EMAIL_REGEX.test(email)) errors.email = 'Adresse e-mail invalide.'
  if (!phone || !PHONE_REGEX.test(phone)) errors.phone = 'Numéro de téléphone invalide.'
  return errors
}

async function removeFile(filename) {
  if (!filename) return
  await fs.unlink(path.join(UPLOAD_DIR, filename)).catch(() => {})
}

function handleUpload(req, res, next) {
  uploadAvatar(req, res, (err) => {
    if (!err) return next()
    const message =
      err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
        ? 'La photo ne doit pas dépasser 3 Mo.'
        : 'Format de photo non supporté (JPG, PNG ou WEBP).'
    res.status(400).json({ message, errors: { avatar: message } })
  })
}

router.post('/', handleUpload, async (req, res, next) => {
  const data = {
    fullName: req.body.fullName?.trim(),
    email: req.body.email?.trim().toLowerCase(),
    phone: req.body.phone?.trim(),
  }
  const avatar = req.file?.filename ?? null

  const reject = async (status, body) => {
    await removeFile(avatar)
    return res.status(status).json(body)
  }

  const errors = validate(data)
  if (Object.keys(errors).length) {
    return reject(422, { message: 'Veuillez corriger les champs indiqués.', errors })
  }

  try {
    if (!(await isQuizActive())) {
      return reject(403, { message: 'Le quiz n’est pas ouvert pour le moment.' })
    }

    const [existing] = await pool.query(
      `SELECT p.*, a.id AS attempt_id, a.status AS attempt_status, a.token
       FROM participants p LEFT JOIN quiz_attempts a ON a.participant_id = p.id
       WHERE p.email = ?`,
      [data.email],
    )
    const current = existing[0]

    if (current?.attempt_status === 'completed') {
      return reject(409, { message: 'Vous avez déjà participé au quiz avec cette adresse e-mail. Merci !' })
    }

    let participantId = current?.id
    if (current) {
      await pool.query(
        'UPDATE participants SET full_name = ?, phone = ?, avatar = COALESCE(?, avatar) WHERE id = ?',
        [data.fullName, data.phone, avatar, current.id],
      )
      if (avatar && current.avatar) await removeFile(current.avatar)
    } else {
      const [result] = await pool.query(
        'INSERT INTO participants (full_name, email, phone, avatar) VALUES (?, ?, ?, ?)',
        [data.fullName, data.email, data.phone, avatar],
      )
      participantId = result.insertId
    }

    let token = current?.token
    let answeredIds = []
    if (current?.attempt_id) {
      await pool.query('UPDATE quiz_attempts SET last_activity_at = NOW() WHERE id = ?', [current.attempt_id])
      const [answered] = await pool.query('SELECT question_id FROM attempt_answers WHERE attempt_id = ?', [
        current.attempt_id,
      ])
      answeredIds = answered.map((r) => r.question_id)
    } else {
      token = crypto.randomBytes(32).toString('hex')
      const questions = await getActiveQuestions()
      await pool.query('INSERT INTO quiz_attempts (participant_id, token, total_questions) VALUES (?, ?, ?)', [
        participantId,
        token,
        questions.length,
      ])
    }

    const [rows] = await pool.query('SELECT * FROM participants WHERE id = ?', [participantId])
    res.status(current ? 200 : 201).json({ participant: toPublic(rows[0]), attempt: { token, answeredIds } })
  } catch (err) {
    await removeFile(avatar)
    next(err)
  }
})

export default router
