import { Router } from 'express'
import pool from '../../config/db.js'
import { parseOptions, refreshAttemptTotals, rescoreQuestion } from '../../services/scoring.js'

const router = Router()

const toQuestion = (r) => ({
  id: r.id,
  question: r.question,
  type: r.type,
  options: parseOptions(r.options),
  correctIndex: r.correct_index,
  timeLimit: r.time_limit,
  position: r.position,
  isActive: Boolean(r.is_active),
  answersCount: Number(r.answers_count ?? 0),
})

function validate(body) {
  const errors = {}
  const type = body.type === 'true_false' ? 'true_false' : 'mcq'
  const question = typeof body.question === 'string' ? body.question.trim() : ''
  const options =
    type === 'true_false'
      ? ['Vrai', 'Faux']
      : (Array.isArray(body.options) ? body.options : []).map((o) => String(o ?? '').trim()).filter(Boolean)
  const correctIndex = Number(body.correctIndex)
  const timeLimit = Number(body.timeLimit)

  if (question.length < 5) errors.question = 'La question doit contenir au moins 5 caractères.'
  if (options.length < 2 || options.length > 6) errors.options = 'Entre 2 et 6 réponses sont requises.'
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
    errors.correctIndex = 'Sélectionnez la bonne réponse.'
  }
  if (!Number.isInteger(timeLimit) || timeLimit < 5 || timeLimit > 120) {
    errors.timeLimit = 'Le temps doit être compris entre 5 et 120 secondes.'
  }

  return { errors, value: { question, type, options, correctIndex, timeLimit } }
}

async function findQuestion(id) {
  const [rows] = await pool.query(
    `SELECT q.*, (SELECT COUNT(*) FROM attempt_answers aa WHERE aa.question_id = q.id) AS answers_count
     FROM questions q WHERE q.id = ?`,
    [id],
  )
  return rows[0] ? toQuestion(rows[0]) : null
}

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT q.*, (SELECT COUNT(*) FROM attempt_answers aa WHERE aa.question_id = q.id) AS answers_count
       FROM questions q ORDER BY q.position, q.id`,
    )
    res.json(rows.map(toQuestion))
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  const { errors, value } = validate(req.body ?? {})
  if (Object.keys(errors).length) return res.status(422).json({ message: 'Formulaire invalide.', errors })

  try {
    const [[{ nextPosition }]] = await pool.query('SELECT COALESCE(MAX(position), 0) + 1 AS nextPosition FROM questions')
    const [result] = await pool.query(
      'INSERT INTO questions (question, type, options, correct_index, time_limit, position) VALUES (?, ?, ?, ?, ?, ?)',
      [value.question, value.type, JSON.stringify(value.options), value.correctIndex, value.timeLimit, nextPosition],
    )
    res.status(201).json(await findQuestion(result.insertId))
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  const { errors, value } = validate(req.body ?? {})
  if (Object.keys(errors).length) return res.status(422).json({ message: 'Formulaire invalide.', errors })

  try {
    const current = await findQuestion(req.params.id)
    if (!current) return res.status(404).json({ message: 'Question introuvable.' })

    await pool.query(
      'UPDATE questions SET question = ?, type = ?, options = ?, correct_index = ?, time_limit = ? WHERE id = ?',
      [value.question, value.type, JSON.stringify(value.options), value.correctIndex, value.timeLimit, current.id],
    )

    const answersChanged =
      current.correctIndex !== value.correctIndex || current.options.length !== value.options.length
    if (answersChanged && current.answersCount > 0) {
      if (value.options.length < current.options.length) {
        await pool.query(
          'UPDATE attempt_answers SET selected_index = NULL WHERE question_id = ? AND selected_index >= ?',
          [current.id, value.options.length],
        )
      }
      await rescoreQuestion(current.id)
    }

    res.json(await findQuestion(current.id))
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const [result] = await pool.query('UPDATE questions SET is_active = 1 - is_active WHERE id = ?', [req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Question introuvable.' })
    res.json(await findQuestion(req.params.id))
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/move', async (req, res, next) => {
  try {
    const direction = req.body?.direction === 'up' ? 'up' : 'down'
    const [rows] = await pool.query('SELECT id, position FROM questions ORDER BY position, id')
    const index = rows.findIndex((r) => r.id === Number(req.params.id))
    const swapWith = direction === 'up' ? index - 1 : index + 1
    if (index === -1) return res.status(404).json({ message: 'Question introuvable.' })
    if (swapWith < 0 || swapWith >= rows.length) return res.json({ ok: true })

    ;[rows[index], rows[swapWith]] = [rows[swapWith], rows[index]]
    await Promise.all(rows.map((r, i) => pool.query('UPDATE questions SET position = ? WHERE id = ?', [i + 1, r.id])))
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM questions WHERE id = ?', [req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Question introuvable.' })
    await refreshAttemptTotals()
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
