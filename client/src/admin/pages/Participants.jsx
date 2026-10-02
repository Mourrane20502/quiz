import { useCallback, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, FileSpreadsheet, FileText, Filter, RotateCcw, Search, Users } from 'lucide-react'
import api, { downloadFile, errorMessage } from '../api.js'
import { useDebounced, usePolling } from '../hooks.js'
import { formatDateTime, formatDuration } from '../format.js'
import { Avatar, Button, Card, EmptyState, LiveIndicator, PageHeader, StatusBadge } from '../components/ui.jsx'

const DEFAULT_FILTERS = { search: '', status: 'all', minScore: '', maxScore: '', sort: 'recent' }

const selectClass =
  'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15'

function Participants() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(null)
  const [exportError, setExportError] = useState('')
  const search = useDebounced(filters.search)

  const params = useMemo(() => {
    const p = { search, status: filters.status, sort: filters.sort, minScore: filters.minScore, maxScore: filters.maxScore }
    return Object.fromEntries(Object.entries(p).filter(([, v]) => v !== '' && v !== 'all'))
  }, [search, filters.status, filters.sort, filters.minScore, filters.maxScore])

  const fetcher = useCallback(
    () => api.get('/participants', { params: { ...params, page, limit: 15 } }).then((r) => r.data),
    [params, page],
  )
  const { data, loading, updatedAt } = usePolling(fetcher, 10000)

  const update = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }))
    setPage(1)
  }

  const reset = () => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  const exportAs = async (format) => {
    setExporting(format)
    setExportError('')
    try {
      await downloadFile('/participants/export', { ...params, format })
    } catch (err) {
      setExportError(errorMessage(err, 'Export impossible.'))
    } finally {
      setExporting(null)
    }
  }

  const hasFilters = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS)

  return (
    <>
      <PageHeader title="Liste des participants" subtitle={`${data?.total ?? 0} participant(s) correspondant aux filtres`}>
        <LiveIndicator updatedAt={updatedAt} label="Actualisation auto" />
        <Button variant="secondary" onClick={() => exportAs('csv')} disabled={!!exporting}>
          <FileText className="h-4 w-4" />
          {exporting === 'csv' ? 'Export…' : 'CSV'}
        </Button>
        <Button onClick={() => exportAs('xlsx')} disabled={!!exporting}>
          <FileSpreadsheet className="h-4 w-4" />
          {exporting === 'xlsx' ? 'Export…' : 'Excel'}
        </Button>
      </PageHeader>

      {exportError && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-morocco-red">{exportError}</p>}

      <Card className="mb-4" delay={60}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filters.search}
              onChange={update('search')}
              placeholder="Rechercher par nom, école ou téléphone…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm placeholder:text-slate-400 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select value={filters.status} onChange={update('status')} className={selectClass} aria-label="Statut">
              <option value="all">Tous les statuts</option>
              <option value="completed">Terminé</option>
              <option value="in_progress">En cours</option>
            </select>
            <input
              type="number"
              min="0"
              value={filters.minScore}
              onChange={update('minScore')}
              placeholder="Score min"
              className={`${selectClass} w-28`}
              aria-label="Score minimum"
            />
            <input
              type="number"
              min="0"
              value={filters.maxScore}
              onChange={update('maxScore')}
              placeholder="Score max"
              className={`${selectClass} w-28`}
              aria-label="Score maximum"
            />
            <select value={filters.sort} onChange={update('sort')} className={selectClass} aria-label="Tri">
              <option value="recent">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="score">Meilleur score</option>
              <option value="name">Nom (A → Z)</option>
            </select>
            {hasFilters && (
              <Button variant="ghost" onClick={reset} className="px-3">
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0" delay={120}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Participant</th>
                <th className="px-5 py-3">Téléphone</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Temps</th>
                <th className="px-5 py-3">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && !data
                ? Array.from({ length: 6 }, (_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-5 py-4">
                        <div className="h-6 animate-pulse rounded bg-slate-100" />
                      </td>
                    </tr>
                  ))
                : data?.rows.map((p, i) => (
                    <tr key={p.id} className="transition hover:bg-slate-50/80 animate-fade-up" style={{ animationDelay: `${i * 25}ms` }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={p.avatar} name={p.fullName} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">{p.fullName}</p>
                            <p className="truncate text-xs text-slate-500">{p.school}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">{p.phone}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={p.status} />
                        {p.status === 'in_progress' && (
                          <p className="mt-1 text-[11px] text-slate-400">
                            {p.answered}/{p.total} répondues
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        {p.status === 'completed' ? (
                          <span className="font-bold text-navy">
                            {p.score}
                            <span className="font-medium text-slate-400">/{p.total}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                        {p.status === 'completed' ? formatDuration(p.timeMs) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDateTime(p.createdAt)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {data && data.rows.length === 0 && (
          <EmptyState icon={Users} title="Aucun participant trouvé" text="Modifiez votre recherche ou vos filtres." />
        )}

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm">
            <span className="text-slate-500">
              Page {data.page} sur {data.pages}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" className="px-3 py-2" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                className="px-3 py-2"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  )
}

export default Participants
