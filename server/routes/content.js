import { Router } from 'express'
import { getContent } from '../services/content.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    res.json(await getContent())
  } catch (err) {
    next(err)
  }
})

export default router
