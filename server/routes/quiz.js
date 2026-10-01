import { Router } from 'express'
import pool, { isQuizActive } from '../config/db.js'
import { getActiveQuestions, refreshAttemptTotals } from '../services/scoring.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const active = await isQuizActive()
    const questions = active ? await getActiveQuestions() : []
    res.json({ active, total: questions.length, questions })
  } catch (err) {
    next(err)
  }
})

async function findAttempt(token) {
  if (typeof token !== 'string' || token.length !== 64) return null
  const [rows] = await pool.query('SELECT * FROM quiz_attempts WHERE token = ?', [token])
  return rows[0] ?? null
}

async function saveAnswers(attempt, answers) {
  const questions = await getActiveQuestions({ withAnswers: true })
  const byId = new Map(questions.map((q) => [q.id, q]))

  const rows = []
  for (const a of answers) {
    const q = byId.get(Number(a?.questionId))
    if (!q) continue
    const selected = Number.isInteger(a.selectedIndex) && a.selectedIndex >= 0 && a.selectedIndex < q.options.length
      ? a.selectedIndex
      : null
    const maxMs = q.timeLimit * 1000
    const time = Math.min(Math.max(Number(a.responseTimeMs) || maxMs, 0), maxMs)
    rows.push([attempt.id, q.id, selected, selected !== null && selected === q.correctIndex ? 1 : 0, time])
  }

  if (rows.length) {
    await pool.query(
      'INSERT IGNORE INTO attempt_answers (attempt_id, question_id, selected_index, is_correct, response_time_ms) VALUES ?',
      [rows],
    )
  }
  await pool.query('UPDATE quiz_attempts SET last_activity_at = NOW() WHERE id = ?', [attempt.id])
  await refreshAttemptTotals([attempt.id])
}

router.post('/answer', async (req, res, next) => {
  try {
    const attempt = await findAttempt(req.body?.token)
    if (!attempt) return res.status(401).json({ message: 'Session de quiz invalide.' })
    if (attempt.status === 'completed') return res.status(409).json({ message: 'Quiz déjà terminé.' })

    await saveAnswers(attempt, [req.body])
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.post('/finish', async (req, res, next) => {
  try {
    const attempt = await findAttempt(req.body?.token)
    if (!attempt) return res.status(401).json({ message: 'Session de quiz invalide.' })
    if (attempt.status === 'completed') return res.json({ ok: true })

    const answers = Array.isArray(req.body.answers) ? req.body.answers : []
    await saveAnswers(attempt, answers)
    await pool.query("UPDATE quiz_attempts SET status = 'completed', completed_at = NOW() WHERE id = ?", [attempt.id])
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
