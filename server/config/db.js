import fs from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'
import seedQuestions from '../data/questions.js'
import { normalizePhone } from '../utils/phone.js'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'quiz',
  waitForConnections: true,
  connectionLimit: 10,
})

const SCHEMA_PATH = path.join(import.meta.dirname, '..', 'db', 'schema.sql')

async function runSchema() {
  const sql = await fs.readFile(SCHEMA_PATH, 'utf8')
  const statements = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s && !/^(CREATE DATABASE|USE)\b/i.test(s))

  for (const statement of statements) await pool.query(statement)
}

async function columnExists(table, column) {
  const [rows] = await pool.query(
    'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [table, column],
  )
  return rows.length > 0
}

async function phoneIsUnique() {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'participants' AND COLUMN_NAME = 'phone' AND NON_UNIQUE = 0`,
  )
  return rows.length > 0
}

async function migrateEmailToSchool() {
  if (!(await columnExists('participants', 'school'))) {
    await pool.query("ALTER TABLE participants ADD COLUMN school VARCHAR(190) NOT NULL DEFAULT '' AFTER full_name")
  }
  if (await columnExists('participants', 'email')) {
    await pool.query('ALTER TABLE participants DROP COLUMN email')
  }
  if (await phoneIsUnique()) return

  const [rows] = await pool.query('SELECT id, phone FROM participants')
  for (const row of rows) {
    const phone = normalizePhone(row.phone)
    if (phone !== row.phone) await pool.query('UPDATE participants SET phone = ? WHERE id = ?', [phone, row.id])
  }

  try {
    await pool.query('ALTER TABLE participants ADD UNIQUE KEY uq_participants_phone (phone)')
  } catch (err) {
    if (err.code !== 'ER_DUP_ENTRY') throw err
    console.warn('Migration: duplicate phone numbers found, unique index on participants.phone not created')
  }
  console.log('Migrated participants: email column replaced by school')
}

async function seed() {
  const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM questions')
  if (count === 0) {
    const rows = seedQuestions.map((q, i) => [q.question, q.type, JSON.stringify(q.options), q.answer, q.timeLimit, i + 1])
    await pool.query(
      'INSERT INTO questions (question, type, options, correct_index, time_limit, position) VALUES ?',
      [rows],
    )
    console.log(`Seeded ${rows.length} questions`)
  }

  await pool.query("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('quiz_active', '1')")

  const [[{ admins }]] = await pool.query('SELECT COUNT(*) AS admins FROM admins')
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env
  if (admins === 0 && ADMIN_USERNAME && ADMIN_PASSWORD) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
    await pool.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [ADMIN_USERNAME, hash])
    console.log(`Created admin account "${ADMIN_USERNAME}"`)
  }
}

export async function initDb() {
  await runSchema()
  await migrateEmailToSchool()
  await seed()
}

export async function getSetting(key, fallback = null) {
  const [rows] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', [key])
  return rows.length ? rows[0].setting_value : fallback
}

export async function isQuizActive() {
  return (await getSetting('quiz_active', '1')) === '1'
}

export default pool
