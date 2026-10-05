import pool from '../config/db.js'
import { CONTENT_DEFAULTS, CONTENT_FIELDS } from '../data/content.js'

export async function getContent() {
  const [rows] = await pool.query('SELECT content_key, content_value FROM site_content')
  const content = { ...CONTENT_DEFAULTS }
  for (const row of rows) {
    if (row.content_key in CONTENT_FIELDS) content[row.content_key] = row.content_value
  }
  return content
}
