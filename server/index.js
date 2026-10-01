import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { initDb } from './config/db.js'
import quizRoutes from './routes/quiz.js'
import participantRoutes from './routes/participants.js'
import adminRoutes from './routes/admin/index.js'
import { UPLOADS_ROOT } from './middleware/upload.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())
app.use(morgan('dev'))
app.use('/uploads', express.static(UPLOADS_ROOT))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/quiz', quizRoutes)
app.use('/api/participants', participantRoutes)
app.use('/api/admin', adminRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer.' })
})

try {
  await initDb()
  console.log('Connected to MySQL database')
} catch (err) {
  console.error('MySQL connection failed:', err.message)
  process.exit(1)
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
