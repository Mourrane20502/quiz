import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import multer from 'multer'

export const UPLOADS_ROOT = path.join(import.meta.dirname, '..', 'uploads')
export const UPLOAD_DIR = path.join(UPLOADS_ROOT, 'avatars')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

export const avatarUrl = (filename) => (filename ? `/uploads/avatars/${filename}` : null)

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ALLOWED_TYPES[file.mimetype]}`)
  },
})

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) cb(null, true)
    else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'avatar'))
  },
}).single('avatar')
