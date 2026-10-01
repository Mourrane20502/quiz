export const formatPercent = (ratio, digits = 0) =>
  ratio === null || ratio === undefined ? '—' : `${(ratio * 100).toFixed(digits)}%`

export const formatSeconds = (ms, digits = 1) =>
  ms === null || ms === undefined ? '—' : `${(ms / 1000).toFixed(digits)} s`

export const formatDuration = (ms) => {
  if (ms === null || ms === undefined) return '—'
  const total = Math.round(ms / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return minutes ? `${minutes} min ${String(seconds).padStart(2, '0')} s` : `${seconds} s`
}

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '—'

export const timeAgo = (value) => {
  if (!value) return ''
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return `il y a ${seconds} s`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  return `il y a ${Math.round(hours / 24)} j`
}

export const STATUS = {
  completed: { label: 'Terminé', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  in_progress: { label: 'En cours', className: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  registered: { label: 'Inscrit', className: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
}
