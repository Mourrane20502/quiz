import pool from '../config/db.js'
import { CONTENT_DEFAULTS, CONTENT_FIELDS, LOGO_SLOTS, logoKey } from '../data/content.js'
import { logoUrl } from '../middleware/upload.js'

export async function getContent() {
  const [rows] = await pool.query('SELECT content_key, content_value FROM site_content')
  const values = new Map(rows.map((row) => [row.content_key, row.content_value]))

  const content = { ...CONTENT_DEFAULTS }
  for (const key of Object.keys(CONTENT_FIELDS)) {
    if (values.has(key)) content[key] = values.get(key)
  }
  content.logos = Object.fromEntries(LOGO_SLOTS.map((slot) => [slot, logoUrl(values.get(logoKey(slot)))]))
  return content
}
