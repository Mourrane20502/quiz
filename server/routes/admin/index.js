import { Router } from 'express'
import { requireAdmin } from '../../middleware/auth.js'
import authRoutes from './auth.js'
import statsRoutes from './stats.js'
import participantRoutes from './participants.js'
import questionRoutes from './questions.js'
import settingsRoutes from './settings.js'
import contentRoutes from './content.js'

const router = Router()

router.use('/', authRoutes)
router.use('/stats', requireAdmin, statsRoutes)
router.use('/participants', requireAdmin, participantRoutes)
router.use('/questions', requireAdmin, questionRoutes)
router.use('/settings', requireAdmin, settingsRoutes)
router.use('/content', requireAdmin, contentRoutes)

export default router
