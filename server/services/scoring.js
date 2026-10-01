import pool from '../config/db.js'

export function parseOptions(value) {
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function getActiveQuestions({ withAnswers = false } = {}) {
  const [rows] = await pool.query(
    'SELECT id, question, type, options, correct_index, time_limit FROM questions WHERE is_active = 1 ORDER BY position, id',
  )
  return rows.map((r) => ({
    id: r.id,
    question: r.question,
    type: r.type,
    options: parseOptions(r.options),
    timeLimit: r.time_limit,
    ...(withAnswers && { correctIndex: r.correct_index }),
  }))
}

export async function refreshAttemptTotals(attemptIds = null) {
  const where = attemptIds ? 'WHERE a.id IN (?)' : ''
  if (attemptIds && attemptIds.length === 0) return
  await pool.query(
    `UPDATE quiz_attempts a
     LEFT JOIN (
       SELECT attempt_id,
              SUM(is_correct) AS score,
              COUNT(*) AS answered,
              SUM(response_time_ms) AS total_time
       FROM attempt_answers
       GROUP BY attempt_id
     ) s ON s.attempt_id = a.id
     SET a.score = COALESCE(s.score, 0),
         a.answered_count = COALESCE(s.answered, 0),
         a.total_time_ms = COALESCE(s.total_time, 0)
     ${where}`,
    attemptIds ? [attemptIds] : [],
  )
}

export async function rescoreQuestion(questionId) {
  await pool.query(
    `UPDATE attempt_answers aa
     JOIN questions q ON q.id = aa.question_id
     SET aa.is_correct = (aa.selected_index IS NOT NULL AND aa.selected_index = q.correct_index)
     WHERE aa.question_id = ?`,
    [questionId],
  )
  await refreshAttemptTotals()
}
