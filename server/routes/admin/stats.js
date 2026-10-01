import { Router } from 'express'
import pool, { isQuizActive } from '../../config/db.js'
import { avatarUrl } from '../../middleware/upload.js'
import { parseOptions } from '../../services/scoring.js'

const router = Router()

export const LIVE_WINDOW_MINUTES = 5

router.get('/', async (req, res, next) => {
  try {
    const [[totals]] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM participants) AS participants,
         (SELECT COUNT(*) FROM quiz_attempts WHERE status = 'completed') AS completed,
         (SELECT COUNT(*) FROM quiz_attempts
            WHERE status = 'in_progress' AND last_activity_at >= NOW() - INTERVAL ? MINUTE) AS live,
         (SELECT AVG(score) FROM quiz_attempts WHERE status = 'completed') AS avgScore,
         (SELECT AVG(score / NULLIF(total_questions, 0)) FROM quiz_attempts WHERE status = 'completed') AS avgRatio,
         (SELECT AVG(total_time_ms / NULLIF(answered_count, 0)) FROM quiz_attempts WHERE status = 'completed') AS avgResponseMs,
         (SELECT COUNT(*) FROM questions WHERE is_active = 1) AS activeQuestions`,
      [LIVE_WINDOW_MINUTES],
    )

    const [[answers]] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         COALESCE(SUM(is_correct = 1), 0) AS correct,
         COALESCE(SUM(is_correct = 0 AND selected_index IS NOT NULL), 0) AS wrong,
         COALESCE(SUM(selected_index IS NULL), 0) AS timeout
       FROM attempt_answers`,
    )

    const [timeline] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:00') AS slot, COUNT(*) AS count
       FROM participants
       WHERE created_at >= NOW() - INTERVAL 24 HOUR
       GROUP BY slot ORDER BY slot`,
    )

    const [distribution] = await pool.query(
      `SELECT score, COUNT(*) AS count FROM quiz_attempts WHERE status = 'completed' GROUP BY score ORDER BY score`,
    )

    const [top] = await pool.query(
      `SELECT p.id, p.full_name, p.avatar, a.score, a.total_questions, a.total_time_ms
       FROM quiz_attempts a JOIN participants p ON p.id = a.participant_id
       WHERE a.status = 'completed'
       ORDER BY a.score DESC, a.total_time_ms ASC, a.completed_at ASC
       LIMIT 5`,
    )

    const [live] = await pool.query(
      `SELECT p.id, p.full_name, p.avatar, a.answered_count, a.total_questions, a.score, a.last_activity_at
       FROM quiz_attempts a JOIN participants p ON p.id = a.participant_id
       WHERE a.status = 'in_progress' AND a.last_activity_at >= NOW() - INTERVAL ? MINUTE
       ORDER BY a.last_activity_at DESC
       LIMIT 20`,
      [LIVE_WINDOW_MINUTES],
    )

    const [recent] = await pool.query(
      `SELECT p.id, p.full_name, p.avatar, p.created_at, a.status, a.score, a.total_questions
       FROM participants p LEFT JOIN quiz_attempts a ON a.participant_id = p.id
       ORDER BY p.created_at DESC LIMIT 6`,
    )

    const maxScore = totals.activeQuestions
    const scoreDistribution = Array.from({ length: maxScore + 1 }, (_, score) => ({
      score,
      count: Number(distribution.find((d) => d.score === score)?.count ?? 0),
    }))

    res.json({
      quizActive: await isQuizActive(),
      totals: {
        participants: Number(totals.participants),
        completed: Number(totals.completed),
        live: Number(totals.live),
        avgScore: totals.avgScore === null ? null : Number(totals.avgScore),
        avgRatio: totals.avgRatio === null ? null : Number(totals.avgRatio),
        avgResponseMs: totals.avgResponseMs === null ? null : Number(totals.avgResponseMs),
        activeQuestions: Number(totals.activeQuestions),
      },
      answers: {
        total: Number(answers.total),
        correct: Number(answers.correct),
        wrong: Number(answers.wrong),
        timeout: Number(answers.timeout),
      },
      timeline: timeline.map((t) => ({ slot: t.slot, count: Number(t.count) })),
      scoreDistribution,
      top: top.map((t) => ({
        id: t.id,
        fullName: t.full_name,
        avatar: avatarUrl(t.avatar),
        score: t.score,
        total: t.total_questions,
        timeMs: t.total_time_ms,
      })),
      live: live.map((l) => ({
        id: l.id,
        fullName: l.full_name,
        avatar: avatarUrl(l.avatar),
        answered: l.answered_count,
        total: l.total_questions,
        lastActivityAt: l.last_activity_at,
      })),
      recent: recent.map((r) => ({
        id: r.id,
        fullName: r.full_name,
        avatar: avatarUrl(r.avatar),
        createdAt: r.created_at,
        status: r.status ?? 'registered',
        score: r.score,
        total: r.total_questions,
      })),
    })
  } catch (err) {
    next(err)
  }
})

router.get('/questions', async (req, res, next) => {
  try {
    const [questions] = await pool.query(
      'SELECT id, question, type, options, correct_index, position, is_active FROM questions ORDER BY position, id',
    )
    const [agg] = await pool.query(
      `SELECT question_id,
              COUNT(*) AS total,
              SUM(is_correct = 1) AS correct,
              SUM(is_correct = 0 AND selected_index IS NOT NULL) AS wrong,
              SUM(selected_index IS NULL) AS timeout,
              AVG(response_time_ms) AS avg_ms
       FROM attempt_answers GROUP BY question_id`,
    )
    const [choices] = await pool.query(
      `SELECT question_id, selected_index, COUNT(*) AS count
       FROM attempt_answers WHERE selected_index IS NOT NULL
       GROUP BY question_id, selected_index`,
    )

    res.json(
      questions.map((q, i) => {
        const a = agg.find((x) => x.question_id === q.id)
        const total = Number(a?.total ?? 0)
        const correct = Number(a?.correct ?? 0)
        const options = parseOptions(q.options)
        return {
          id: q.id,
          number: i + 1,
          question: q.question,
          type: q.type,
          isActive: Boolean(q.is_active),
          correctIndex: q.correct_index,
          total,
          correct,
          wrong: Number(a?.wrong ?? 0),
          timeout: Number(a?.timeout ?? 0),
          successRate: total ? correct / total : null,
          avgResponseMs: a?.avg_ms === null || a?.avg_ms === undefined ? null : Number(a.avg_ms),
          options: options.map((label, index) => ({
            label,
            count: Number(choices.find((c) => c.question_id === q.id && c.selected_index === index)?.count ?? 0),
            isCorrect: index === q.correct_index,
          })),
        }
      }),
    )
  } catch (err) {
    next(err)
  }
})

export default router
