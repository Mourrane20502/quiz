import { useCountUp } from '../hooks.js'
import { STATUS } from '../format.js'

export function Card({ className = '', children, delay = 0 }) {
  return (
    <div
      className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 animate-fade-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-navy/5 text-navy">
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 animate-fade-up sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

export function AnimatedNumber({ value, decimals = 0, suffix = '' }) {
  const current = useCountUp(value ?? 0)
  if (value === null || value === undefined) return <span>—</span>
  return (
    <span className="tabular-nums">
      {current.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}

const TONES = {
  navy: 'from-navy to-[#1c3d82] text-white',
  gold: 'from-gold to-gold-light text-white',
  green: 'from-morocco-green to-emerald-500 text-white',
  red: 'from-morocco-red to-rose-500 text-white',
}

export function StatCard({ label, value, decimals, suffix, hint, icon: Icon, tone = 'navy', delay = 0, pulse = false }) {
  return (
    <Card delay={delay} className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
          </p>
        </div>
        <span className={`relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ${TONES[tone]}`}>
          {pulse && <span className="absolute inset-0 animate-ping rounded-xl bg-current opacity-20" />}
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {hint && <p className="mt-3 text-xs text-slate-500">{hint}</p>}
      <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${TONES[tone]}`} />
    </Card>
  )
}

export function Avatar({ src, name, size = 'h-9 w-9' }) {
  const initials = (name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  if (src) return <img src={src} alt={name} className={`${size} shrink-0 rounded-full object-cover ring-2 ring-white`} />
  return (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy to-[#1c3d82] text-xs font-bold text-white ring-2 ring-white`}>
      {initials}
    </span>
  )
}

export function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.registered
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${s.className}`}>
      {s.label}
    </span>
  )
}

export function ProgressBar({ value, max = 1, className = 'bg-navy' }) {
  const pct = max ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full transition-all duration-700 ${className}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <p className="mt-3 font-semibold text-slate-700">{title}</p>
      {text && <p className="mt-1 max-w-xs text-sm text-slate-500">{text}</p>}
    </div>
  )
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
  const variants = {
    primary: 'bg-navy text-white hover:bg-navy-dark shadow-sm',
    secondary: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
    danger: 'bg-morocco-red text-white hover:bg-red-700 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100',
  }
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition disabled:opacity-50 ${
        checked ? 'bg-morocco-green' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  )
}

export function LiveIndicator({ updatedAt, label = 'Temps réel' }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      {label}
      {updatedAt && <span className="text-slate-400">· {updatedAt.toLocaleTimeString('fr-FR')}</span>}
    </span>
  )
}
