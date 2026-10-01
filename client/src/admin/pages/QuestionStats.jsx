import { useCallback, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarChart3, CheckCircle2, Clock, Flame, Snowflake, Timer, XCircle } from 'lucide-react'
import api from '../api.js'
import { usePolling } from '../hooks.js'
import { formatPercent, formatSeconds } from '../format.js'
import { Card, CardHeader, EmptyState, LiveIndicator, PageHeader, StatCard } from '../components/ui.jsx'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const rateColor = (r) => (r === null ? '#cbd5e1' : r >= 0.7 ? '#006233' : r >= 0.4 ? '#b8893b' : '#c1272d')

function SuccessTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const q = payload[0].payload
  return (
    <div className="max-w-xs rounded-xl bg-navy px-3 py-2 text-xs text-white shadow-lg">
      <p className="font-semibold">Question {q.number}</p>
      <p className="mt-1 text-white/80">{q.question}</p>
      <p className="mt-1.5 font-semibold">
        {formatPercent(q.successRate)} de réussite · {q.total} réponse(s)
      </p>
    </div>
  )
}

function QuestionStats() {
  const fetcher = useCallback(() => api.get('/stats/questions').then((r) => r.data), [])
  const { data, loading, updatedAt } = usePolling(fetcher, 15000)

  const summary = useMemo(() => {
    const answered = (data ?? []).filter((q) => q.total > 0)
    if (!answered.length) return null
    const totals = answered.reduce(
      (acc, q) => ({ total: acc.total + q.total, correct: acc.correct + q.correct, ms: acc.ms + (q.avgResponseMs ?? 0) * q.total }),
      { total: 0, correct: 0, ms: 0 },
    )
    const sorted = [...answered].sort((a, b) => a.successRate - b.successRate)
    return {
      rate: totals.correct / totals.total,
      avgMs: totals.ms / totals.total,
      hardest: sorted[0],
      easiest: sorted[sorted.length - 1],
    }
  }, [data])

  const chart = (data ?? []).map((q) => ({ ...q, label: `Q${q.number}`, value: q.successRate === null ? 0 : q.successRate * 100 }))

  return (
    <>
      <PageHeader title="Statistiques par question" subtitle="Taux de réussite et répartition des réponses pour chaque question">
        <LiveIndicator updatedAt={updatedAt} />
      </PageHeader>

      {loading && !data ? (
        <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/70" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Réussite globale" value={summary ? summary.rate * 100 : null} decimals={1} suffix="%" icon={CheckCircle2} tone="green" />
            <StatCard label="Temps moyen" value={summary ? summary.avgMs / 1000 : null} decimals={1} suffix=" s" icon={Timer} tone="navy" delay={60} />
            <StatCard
              label="Question la plus difficile"
              value={summary ? summary.hardest.number : null}
              icon={Flame}
              tone="red"
              hint={summary ? `${formatPercent(summary.hardest.successRate)} de réussite` : 'Pas encore de données'}
              delay={120}
            />
            <StatCard
              label="Question la plus facile"
              value={summary ? summary.easiest.number : null}
              icon={Snowflake}
              tone="gold"
              hint={summary ? `${formatPercent(summary.easiest.successRate)} de réussite` : 'Pas encore de données'}
              delay={180}
            />
          </div>

          <Card className="mt-4" delay={220}>
            <CardHeader title="Taux de réussite par question" subtitle="Vert ≥ 70 % · Or ≥ 40 % · Rouge < 40 %" icon={BarChart3} />
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} content={<SuccessTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1200}>
                    {chart.map((q) => (
                      <Cell key={q.id} fill={rateColor(q.successRate)} fillOpacity={q.isActive ? 1 : 0.35} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {data?.map((q, i) => (
              <Card key={q.id} delay={260 + Math.min(i, 10) * 40} className={q.isActive ? '' : 'opacity-60'}>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-sm font-bold text-white">
                    {q.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug text-slate-900">{q.question}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-morocco-green" /> {q.correct} bonne(s)
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5 text-morocco-red" /> {q.wrong} mauvaise(s)
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gold" /> {q.timeout} temps écoulé
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" /> {formatSeconds(q.avgResponseMs)} en moyenne
                      </span>
                      {!q.isActive && <span className="font-semibold text-slate-600">Désactivée</span>}
                    </div>
                  </div>
                  <span className="shrink-0 text-xl font-bold" style={{ color: rateColor(q.successRate) }}>
                    {formatPercent(q.successRate)}
                  </span>
                </div>

                <ul className="mt-4 space-y-2">
                  {q.options.map((o, idx) => {
                    const pct = q.total ? (o.count / q.total) * 100 : 0
                    return (
                      <li key={idx}>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`flex items-center gap-2 ${o.isCorrect ? 'font-semibold text-morocco-green' : 'text-slate-600'}`}>
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                                o.isCorrect ? 'bg-morocco-green text-white' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {LETTERS[idx]}
                            </span>
                            {o.label}
                          </span>
                          <span className="text-slate-500">
                            {o.count} · {pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${o.isCorrect ? 'bg-morocco-green' : 'bg-slate-300'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </Card>
            ))}
          </div>

          {data?.length === 0 && (
            <Card className="mt-4">
              <EmptyState icon={BarChart3} title="Aucune question" />
            </Card>
          )}
        </>
      )}
    </>
  )
}

export default QuestionStats
