import { Router } from 'express'
import pool, { isQuizActive } from '../config/db.js'
import { countAllQuestions, getActiveQuestions, refreshAttemptTotals } from '../services/scoring.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const active = await isQuizActive()
    const questions = active ? await getActiveQuestions() : []
    res.json({ active, total: await countAllQuestions(), questions })
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
  await refreshAttemptTotals([attempt.id])
}

// The quiz ends only once every question (active or not) has been answered, so the
// admin can unlock questions during the event while participants wait.
async function buildState(attempt) {
  const total = await countAllQuestions()
  const [answeredRows] = await pool.query('SELECT question_id FROM attempt_answers WHERE attempt_id = ?', [attempt.id])
  const answered = new Set(answeredRows.map((r) => r.question_id))

  if (attempt.status === 'completed') return { completed: true, total, answered: answered.size, questions: [] }

  if (total > 0 && answered.size >= total) {
    await pool.query(
      "UPDATE quiz_attempts SET status = 'completed', completed_at = NOW(), total_questions = ? WHERE id = ?",
      [total, attempt.id],
    )
    return { completed: true, total, answered: answered.size, questions: [] }
  }

  await pool.query('UPDATE quiz_attempts SET total_questions = ?, last_activity_at = NOW() WHERE id = ?', [
    total,
    attempt.id,
  ])
  const questions = (await isQuizActive()) ? (await getActiveQuestions()).filter((q) => !answered.has(q.id)) : []
  return { completed: false, total, answered: answered.size, questions }
}

router.post('/answer', async (req, res, next) => {
  try {
    const attempt = await findAttempt(req.body?.token)
    if (!attempt) return res.status(401).json({ message: 'Session de quiz invalide.' })
    if (attempt.status === 'completed') return res.status(409).json({ message: 'Quiz déjà terminé.' })

    await saveAnswers(attempt, [req.body])
    const { completed } = await buildState(attempt)
    res.json({ ok: true, completed })
  } catch (err) {
    next(err)
  }
})

router.post('/state', async (req, res, next) => {
  try {
    const attempt = await findAttempt(req.body?.token)
    if (!attempt) return res.status(401).json({ message: 'Session de quiz invalide.' })
    res.json(await buildState(attempt))
  } catch (err) {
    next(err)
  }
})

router.post('/sync', async (req, res, next) => {
  try {
    const attempt = await findAttempt(req.body?.token)
    if (!attempt) return res.status(401).json({ message: 'Session de quiz invalide.' })

    if (attempt.status !== 'completed') {
      const answers = Array.isArray(req.body.answers) ? req.body.answers : []
      await saveAnswers(attempt, answers)
    }
    res.json(await buildState(attempt))
  } catch (err) {
    next(err)
  }
})

export default router
