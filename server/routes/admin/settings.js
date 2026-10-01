import { Router } from 'express'
import pool, { isQuizActive } from '../../config/db.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    res.json({ quizActive: await isQuizActive() })
  } catch (err) {
    next(err)
  }
})

router.put('/', async (req, res, next) => {
  if (typeof req.body?.quizActive !== 'boolean') {
    return res.status(422).json({ message: 'Valeur invalide pour quizActive.' })
  }

  try {
    await pool.query(
      `INSERT INTO settings (setting_key, setting_value) VALUES ('quiz_active', ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [req.body.quizActive ? '1' : '0'],
    )
    res.json({ quizActive: req.body.quizActive })
  } catch (err) {
    next(err)
  }
})

export default router
