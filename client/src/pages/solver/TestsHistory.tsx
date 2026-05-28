import { Link } from 'react-router'
import { useAttemptHistory } from '../../hooks/useAttempts'
import type { AttemptHistoryResponse } from '../../api/types'

export function TestsHistory() {
  const { data: attempts, isLoading, error } = useAttemptHistory()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-white/10 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="py-12 text-center opacity-60">Failed to load history.</div>
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Attempt History</h1>

      {attempts?.length === 0 ? (
        <div className="py-16 text-center opacity-50 flex flex-col gap-3">
          <span className="text-4xl">📭</span>
          <p>No attempts yet.</p>
          <Link to="/solver" className="text-indigo-400 hover:text-indigo-300 text-sm">
            Find a test to take →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {attempts?.map(attempt => (
            <AttemptRow key={attempt.id} attempt={attempt} />
          ))}
        </div>
      )}
    </div>
  )
}

function AttemptRow({ attempt }: { attempt: AttemptHistoryResponse }) {
  const pct = attempt.percentage != null ? Math.round(attempt.percentage) : null
  const passed = pct != null && pct >= 60
  const date = attempt.completed_at ?? attempt.created_at

  return (
    <Link
      to={`/solver/history/${attempt.id}`}
      className="bg-white/10 dark:bg-white/5 rounded-2xl border border-white/10 px-5 py-4 flex items-center gap-4 hover:bg-white/15 transition-colors"
    >
      {/* Score badge */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
        attempt.status === 'completed'
          ? passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          : 'bg-white/10 opacity-50'
      }`}>
        {pct != null ? `${pct}%` : '—'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Test #{attempt.test_id}</p>
        <p className="text-xs opacity-50">
          {attempt.score != null && attempt.max_score != null
            ? `${attempt.score} / ${attempt.max_score} points · `
            : ''}
          {date ? new Date(date).toLocaleString() : 'In progress'}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={attempt.status} passed={passed} />
        <span className="text-xs opacity-30">→</span>
      </div>
    </Link>
  )
}

function StatusBadge({ status, passed }: { status: string; passed: boolean }) {
  if (status !== 'completed') {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 opacity-60">
        {status}
      </span>
    )
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
      {passed ? 'Passed' : 'Failed'}
    </span>
  )
}
