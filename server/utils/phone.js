export function normalizePhone(value) {
  let phone = String(value ?? '').replace(/[\s.()-]/g, '')
  if (phone.startsWith('00')) phone = `+${phone.slice(2)}`
  else if (/^0[5-7]\d{8}$/.test(phone)) phone = `+212${phone.slice(1)}`
  return phone
}
