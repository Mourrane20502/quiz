import { Router } from 'express'
import ExcelJS from 'exceljs'
import pool from '../../config/db.js'
import { avatarUrl } from '../../middleware/upload.js'

const router = Router()

const SORTS = {
  recent: 'p.created_at DESC',
  oldest: 'p.created_at ASC',
  name: 'p.full_name ASC',
  score: 'a.score DESC, a.total_time_ms ASC',
}

const STATUS_LABELS = { completed: 'Terminé', in_progress: 'En cours', registered: 'Inscrit' }

function buildFilters(query) {
  const where = []
  const params = []

  const search = query.search?.trim()
  if (search) {
    where.push('(p.full_name LIKE ? OR p.school LIKE ? OR p.phone LIKE ?)')
    const like = `%${search}%`
    params.push(like, like, like)
  }

  if (query.status === 'completed') where.push("a.status = 'completed'")
  else if (query.status === 'in_progress') where.push("a.status = 'in_progress'")
  else if (query.status === 'registered') where.push('a.id IS NULL')

  const minScore = Number.parseInt(query.minScore, 10)
  const maxScore = Number.parseInt(query.maxScore, 10)
  if (Number.isFinite(minScore)) {
    where.push("a.status = 'completed' AND a.score >= ?")
    params.push(minScore)
  }
  if (Number.isFinite(maxScore)) {
    where.push("a.status = 'completed' AND a.score <= ?")
    params.push(maxScore)
  }

  return {
    clause: where.length ? `WHERE ${where.join(' AND ')}` : '',
    params,
    order: SORTS[query.sort] ?? SORTS.recent,
  }
}

const BASE_SELECT = `
  SELECT p.id, p.full_name, p.school, p.phone, p.avatar, p.created_at,
         a.status, a.score, a.total_questions, a.answered_count, a.total_time_ms, a.completed_at
  FROM participants p
  LEFT JOIN quiz_attempts a ON a.participant_id = p.id`

const toRow = (r) => ({
  id: r.id,
  fullName: r.full_name,
  school: r.school,
  phone: r.phone,
  avatar: avatarUrl(r.avatar),
  createdAt: r.created_at,
  status: r.status ?? 'registered',
  score: r.score,
  total: r.total_questions,
  answered: r.answered_count,
  timeMs: r.total_time_ms,
  completedAt: r.completed_at,
})

router.get('/', async (req, res, next) => {
  try {
    const { clause, params, order } = buildFilters(req.query)
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100)
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM participants p LEFT JOIN quiz_attempts a ON a.participant_id = p.id ${clause}`,
      params,
    )
    const [rows] = await pool.query(`${BASE_SELECT} ${clause} ORDER BY ${order} LIMIT ? OFFSET ?`, [
      ...params,
      limit,
      (page - 1) * limit,
    ])

    res.json({ rows: rows.map(toRow), total, page, limit, pages: Math.max(Math.ceil(total / limit), 1) })
  } catch (err) {
    next(err)
  }
})

router.get('/leaderboard', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `${BASE_SELECT} WHERE a.status = 'completed'
       ORDER BY a.score DESC, a.total_time_ms ASC, a.completed_at ASC`,
    )
    res.json(rows.map((r, i) => ({ rank: i + 1, ...toRow(r) })))
  } catch (err) {
    next(err)
  }
})

router.get('/export', async (req, res, next) => {
  try {
    const format = req.query.format === 'xlsx' ? 'xlsx' : 'csv'
    const { clause, params, order } = buildFilters(req.query)
    const [rows] = await pool.query(`${BASE_SELECT} ${clause} ORDER BY ${order}`, params)

    const columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nom et prénom', key: 'fullName', width: 28 },
      { header: 'École', key: 'school', width: 32 },
      { header: 'Téléphone', key: 'phone', width: 18 },
      { header: 'Statut', key: 'status', width: 12 },
      { header: 'Score', key: 'score', width: 8 },
      { header: 'Questions', key: 'total', width: 10 },
      { header: 'Réussite (%)', key: 'percent', width: 12 },
      { header: 'Temps total (s)', key: 'seconds', width: 14 },
      { header: 'Inscrit le', key: 'createdAt', width: 20 },
      { header: 'Terminé le', key: 'completedAt', width: 20 },
    ]

    const data = rows.map((r) => ({
      id: r.id,
      fullName: r.full_name,
      school: r.school,
      phone: r.phone,
      status: STATUS_LABELS[r.status ?? 'registered'],
      score: r.status === 'completed' ? r.score : '',
      total: r.total_questions ?? '',
      percent: r.status === 'completed' && r.total_questions ? Math.round((r.score / r.total_questions) * 100) : '',
      seconds: r.status === 'completed' ? Math.round(r.total_time_ms / 1000) : '',
      createdAt: r.created_at,
      completedAt: r.completed_at ?? '',
    }))

    const stamp = new Date().toISOString().slice(0, 10)
    const filename = `participants-quiz-${stamp}.${format}`

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet('Participants')
      sheet.columns = columns
      sheet.addRows(data)
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1F4B' } }
      sheet.views = [{ state: 'frozen', ySplit: 1 }]
      sheet.getColumn('createdAt').numFmt = 'dd/mm/yyyy hh:mm'
      sheet.getColumn('completedAt').numFmt = 'dd/mm/yyyy hh:mm'

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      await workbook.xlsx.write(res)
      return res.end()
    }

    const escape = (value) => {
      if (value instanceof Date) value = value.toLocaleString('fr-FR')
      const text = String(value ?? '')
      return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
    }
    const lines = [columns.map((c) => c.header), ...data.map((d) => columns.map((c) => d[c.key]))]
    const csv = '\uFEFF' + lines.map((line) => line.map(escape).join(';')).join('\r\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(csv)
  } catch (err) {
    next(err)
  }
})

export default router
