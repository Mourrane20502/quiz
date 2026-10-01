import { useCallback } from 'react'
import { Clock, Crown, Medal, Trophy } from 'lucide-react'
import api from '../api.js'
import { usePolling } from '../hooks.js'
import { formatDateTime, formatDuration, formatPercent } from '../format.js'
import { Avatar, Card, EmptyState, LiveIndicator, PageHeader, ProgressBar } from '../components/ui.jsx'

const PODIUM = [
  { place: 2, height: 'h-28', ring: 'ring-slate-300', badge: 'from-slate-300 to-slate-400', order: 'order-1' },
  { place: 1, height: 'h-36', ring: 'ring-amber-400', badge: 'from-amber-300 to-amber-500', order: 'order-2' },
  { place: 3, height: 'h-20', ring: 'ring-orange-400', badge: 'from-orange-300 to-orange-500', order: 'order-3' },
]

function Podium({ rows }) {
  return (
    <Card className="mb-4 overflow-hidden bg-gradient-to-b from-navy to-[#14306b] text-white ring-0" delay={60}>
      <div className="mx-auto flex max-w-2xl items-end justify-center gap-3 pt-4 sm:gap-6">
        {PODIUM.map(({ place, height, ring, badge, order }) => {
          const p = rows[place - 1]
          return (
            <div key={place} className={`flex w-1/3 flex-col items-center ${order}`}>
              {p ? (
                <div className="flex flex-col items-center animate-fade-up" style={{ animationDelay: `${place * 120}ms` }}>
                  {place === 1 && <Crown className="mb-1 h-7 w-7 text-amber-300" />}
                  <div className={`rounded-full ring-4 ${ring}`}>
                    <Avatar src={p.avatar} name={p.fullName} size={place === 1 ? 'h-20 w-20' : 'h-16 w-16'} />
                  </div>
                  <p className="mt-2 max-w-full truncate text-center text-sm font-semibold">{p.fullName}</p>
                  <p className="text-xs text-white/60">{formatDuration(p.timeMs)}</p>
                </div>
              ) : (
                <div className="h-24" />
              )}
              <div
                className={`mt-3 flex w-full ${height} flex-col items-center justify-start rounded-t-2xl bg-white/10 pt-3 ring-1 ring-white/10 backdrop-blur`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${badge} font-bold text-white shadow`}>
                  {place}
                </span>
                {p && (
                  <span className="mt-2 text-xl font-bold">
                    {p.score}
                    <span className="text-xs font-medium text-white/60">/{p.total}</span>
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function Leaderboard() {
  const fetcher = useCallback(() => api.get('/participants/leaderboard').then((r) => r.data), [])
  const { data, loading, updatedAt } = usePolling(fetcher, 10000)

  return (
    <>
      <PageHeader title="Classement" subtitle="Classé par score, puis par temps de réponse total le plus court">
        <LiveIndicator updatedAt={updatedAt} />
      </PageHeader>

      {loading && !data ? (
        <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/70" />
      ) : !data?.length ? (
        <Card>
          <EmptyState icon={Trophy} title="Aucun participant n’a encore terminé" text="Le classement se remplira automatiquement." />
        </Card>
      ) : (
        <>
          <Podium rows={data} />

          <Card className="overflow-hidden p-0" delay={180}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="w-16 px-5 py-3">Rang</th>
                    <th className="px-5 py-3">Participant</th>
                    <th className="px-5 py-3">Score</th>
                    <th className="min-w-40 px-5 py-3">Réussite</th>
                    <th className="px-5 py-3">Temps total</th>
                    <th className="px-5 py-3">Terminé le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((p, i) => {
                    const ratio = p.total ? p.score / p.total : 0
                    return (
                      <tr key={p.id} className="transition hover:bg-slate-50/80 animate-fade-up" style={{ animationDelay: `${Math.min(i, 20) * 25}ms` }}>
                        <td className="px-5 py-3">
                          {p.rank <= 3 ? (
                            <Medal className={`h-5 w-5 ${['text-amber-500', 'text-slate-400', 'text-orange-500'][p.rank - 1]}`} />
                          ) : (
                            <span className="font-semibold text-slate-500">#{p.rank}</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar src={p.avatar} name={p.fullName} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-800">{p.fullName}</p>
                              <p className="truncate text-xs text-slate-500">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 font-bold text-navy">
                          {p.score}
                          <span className="font-medium text-slate-400">/{p.total}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <ProgressBar
                              value={ratio}
                              className={ratio >= 0.7 ? 'bg-morocco-green' : ratio >= 0.4 ? 'bg-gold' : 'bg-morocco-red'}
                            />
                            <span className="w-10 text-right text-xs font-semibold text-slate-600">{formatPercent(ratio)}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {formatDuration(p.timeMs)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDateTime(p.completedAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </>
  )
}

export default Leaderboard
