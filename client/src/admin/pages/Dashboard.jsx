import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, ArrowRight, CheckCircle2, Clock, Radio, Trophy, UserPlus, Users } from 'lucide-react'
import api from '../api.js'
import { usePolling } from '../hooks.js'
import { formatDuration, formatPercent, formatSeconds, timeAgo } from '../format.js'
import {
  AnimatedNumber,
  Avatar,
  Card,
  CardHeader,
  EmptyState,
  LiveIndicator,
  PageHeader,
  ProgressBar,
  StatCard,
  StatusBadge,
} from '../components/ui.jsx'

const COLORS = { correct: '#006233', wrong: '#c1272d', timeout: '#b8893b', navy: '#0b1f4b' }
const MEDALS = ['bg-gradient-to-br from-amber-300 to-amber-500', 'bg-gradient-to-br from-slate-300 to-slate-400', 'bg-gradient-to-br from-orange-300 to-orange-500']

function buildTimeline(rows) {
  const counts = new Map(rows.map((r) => [r.slot, r.count]))
  const now = new Date()
  now.setMinutes(0, 0, 0)
  return Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now.getTime() - (23 - i) * 3600 * 1000)
    const pad = (n) => String(n).padStart(2, '0')
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:00`
    return { label: `${pad(d.getHours())}h`, count: counts.get(key) ?? 0 }
  })
}

function ChartTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-navy px-3 py-2 text-xs text-white shadow-lg">
      <p className="font-semibold">{label}</p>
      <p className="text-white/80">
        {payload[0].value} {suffix}
      </p>
    </div>
  )
}

function Dashboard() {
  const fetcher = useCallback(() => api.get('/stats').then((r) => r.data), [])
  const { data, updatedAt, loading } = usePolling(fetcher, 5000)

  const timeline = useMemo(() => buildTimeline(data?.timeline ?? []), [data])
  const answers = data?.answers
  const pie = answers
    ? [
        { name: 'Bonnes', value: answers.correct, color: COLORS.correct },
        { name: 'Mauvaises', value: answers.wrong, color: COLORS.wrong },
        { name: 'Temps écoulé', value: answers.timeout, color: COLORS.timeout },
      ]
    : []
  const rate = (n) => (answers?.total ? n / answers.total : null)

  if (loading && !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/70" />
        ))}
      </div>
    )
  }

  const t = data?.totals ?? {}

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Vue d’ensemble du quiz de la Journée Talents">
        <LiveIndicator updatedAt={updatedAt} />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total participants"
          value={t.participants}
          icon={Users}
          tone="navy"
          hint={`${t.completed ?? 0} ont terminé le quiz`}
        />
        <StatCard
          label="En temps réel"
          value={t.live}
          icon={Radio}
          tone="red"
          pulse={t.live > 0}
          hint="Actifs dans les 5 dernières minutes"
          delay={60}
        />
        <StatCard
          label="Score moyen"
          value={t.avgScore}
          decimals={1}
          suffix={` / ${t.activeQuestions ?? 0}`}
          icon={Trophy}
          tone="gold"
          hint={`Taux de réussite moyen : ${formatPercent(t.avgRatio)}`}
          delay={120}
        />
        <StatCard
          label="Bonnes réponses"
          value={rate(answers?.correct ?? 0) === null ? null : rate(answers.correct) * 100}
          decimals={1}
          suffix="%"
          icon={CheckCircle2}
          tone="green"
          hint={`Temps moyen par question : ${formatSeconds(t.avgResponseMs)}`}
          delay={180}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={200}>
          <CardHeader title="Inscriptions" subtitle="Nouveaux participants sur les dernières 24 heures" icon={UserPlus} />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.navy} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COLORS.navy} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} interval={2} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip suffix="inscription(s)" />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS.navy}
                  strokeWidth={2.5}
                  fill="url(#areaFill)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={260}>
          <CardHeader title="Taux de réponses" subtitle={`${answers?.total ?? 0} réponses enregistrées`} icon={Activity} />
          {answers?.total ? (
            <>
              <div className="relative h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pie}
                      dataKey="value"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                      stroke="none"
                      animationDuration={1200}
                    >
                      {pie.map((p) => (
                        <Cell key={p.name} fill={p.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">
                    <AnimatedNumber value={rate(answers.correct) * 100} suffix="%" />
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500">réussite</span>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5">
                {pie.map((p) => (
                  <li key={p.name} className="flex items-center gap-3 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                    <span className="flex-1 text-slate-600">{p.name}</span>
                    <span className="font-semibold text-slate-900">{p.value}</span>
                    <span className="w-14 text-right text-xs text-slate-500">{formatPercent(rate(p.value), 1)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState icon={Activity} title="Aucune réponse" text="Les statistiques apparaîtront dès les premières réponses." />
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={300}>
          <CardHeader title="Répartition des scores" subtitle="Nombre de participants par score obtenu" icon={Trophy} />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.scoreDistribution ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="score" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} content={<ChartTooltip suffix="participant(s)" />} labelFormatter={(l) => `Score ${l}`} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1200}>
                  {(data?.scoreDistribution ?? []).map((d) => {
                    const ratio = t.activeQuestions ? d.score / t.activeQuestions : 0
                    const color = ratio >= 0.7 ? COLORS.correct : ratio >= 0.4 ? COLORS.timeout : COLORS.wrong
                    return <Cell key={d.score} fill={color} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={360}>
          <CardHeader
            title="Participants en direct"
            subtitle="Progression en cours"
            icon={Radio}
            action={
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-morocco-red">
                {data?.live.length ?? 0}
              </span>
            }
          />
          {data?.live.length ? (
            <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {data.live.map((p) => (
                <li key={p.id} className="flex items-center gap-3 animate-fade-up">
                  <Avatar src={p.avatar} name={p.fullName} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">{p.fullName}</p>
                      <span className="shrink-0 text-xs font-semibold text-slate-500">
                        {p.answered}/{p.total}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar value={p.answered} max={p.total} className="bg-gradient-to-r from-morocco-red via-gold to-morocco-green" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Radio} title="Personne en ligne" text="Les participants en train de jouer apparaîtront ici." />
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card delay={400}>
          <CardHeader
            title="Top 5"
            subtitle="Meilleurs scores (départage au temps)"
            icon={Trophy}
            action={
              <Link to="/admin/classement" className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-gold">
                Classement complet <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {data?.top.length ? (
            <ol className="space-y-2">
              {data.top.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      MEDALS[i] ? `${MEDALS[i]} text-white shadow` : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <Avatar src={p.avatar} name={p.fullName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{p.fullName}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" /> {formatDuration(p.timeMs)}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-navy">
                    {p.score}
                    <span className="text-xs font-medium text-slate-400">/{p.total}</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState icon={Trophy} title="Pas encore de classement" text="Le classement s’affichera dès qu’un participant aura terminé." />
          )}
        </Card>

        <Card delay={460}>
          <CardHeader
            title="Dernières inscriptions"
            subtitle="Les participants les plus récents"
            icon={UserPlus}
            action={
              <Link to="/admin/participants" className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-gold">
                Voir tout <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {data?.recent.length ? (
            <ul className="divide-y divide-slate-100">
              {data.recent.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <Avatar src={p.avatar} name={p.fullName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{p.fullName}</p>
                    <p className="text-xs text-slate-500">{timeAgo(p.createdAt)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Users} title="Aucun participant" text="Partagez le QR code pour lancer les inscriptions." />
          )}
        </Card>
      </div>
    </>
  )
}

export default Dashboard
