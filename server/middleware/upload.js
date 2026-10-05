import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import multer from 'multer'

export const UPLOADS_ROOT = path.join(import.meta.dirname, '..', 'uploads')
export const UPLOAD_DIR = path.join(UPLOADS_ROOT, 'avatars')
export const LOGO_DIR = path.join(UPLOADS_ROOT, 'logos')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })
fs.mkdirSync(LOGO_DIR, { recursive: true })

export const avatarUrl = (filename) => (filename ? `/uploads/avatars/${filename}` : null)
export const logoUrl = (filename) => (filename ? `/uploads/logos/${filename}` : null)

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

const imageStorage = (destination) =>
  multer.diskStorage({
    destination,
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ALLOWED_TYPES[file.mimetype]}`)
    },
  })

// SVG is excluded on purpose: it can embed scripts that run when the file is opened directly.
const imageUpload = ({ destination, field, maxBytes }) =>
  multer({
    storage: imageStorage(destination),
    limits: { fileSize: maxBytes },
    fileFilter: (req, file, cb) => {
      if (ALLOWED_TYPES[file.mimetype]) cb(null, true)
      else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', field))
    },
  }).single(field)

export const uploadAvatar = imageUpload({ destination: UPLOAD_DIR, field: 'avatar', maxBytes: 3 * 1024 * 1024 })
export const uploadLogo = imageUpload({ destination: LOGO_DIR, field: 'logo', maxBytes: 2 * 1024 * 1024 })
