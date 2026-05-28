import { Link, useParams } from 'react-router'
import { useAttemptDetail } from '../../hooks/useAttempts'
import { useTestDetail } from '../../hooks/useTests'

export function CompletedTestDetail() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const id = Number(attemptId)

  const { data: attempt, isLoading, error } = useAttemptDetail(id)
  const { data: test } = useTestDetail(attempt?.test_id ?? 0)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-xl">
        <div className="h-8 w-40 bg-white/10 rounded-lg animate-pulse" />
        <div className="h-40 bg-white/10 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (error || !attempt) {
    return <div className="py-12 text-center opacity-60">Attempt not found.</div>
  }

  const pct = attempt.percentage != null ? Math.round(attempt.percentage) : null
  const passed = pct != null && pct >= 60
  const date = attempt.completed_at ?? attempt.created_at

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <Link to="/solver/history" className="text-sm opacity-50 hover:opacity-80 transition-opacity">
        ← Back to history
      </Link>

      {/* Summary card */}
      <div className="bg-white/10 dark:bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">{test?.title ?? `Test #${attempt.test_id}`}</h1>
            {date && (
              <p className="text-sm opacity-50 mt-0.5">{new Date(date).toLocaleString()}</p>
            )}
          </div>
          {pct != null && (
            <div className={`px-4 py-2 rounded-xl text-lg font-bold shrink-0 ${passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {pct}%
            </div>
          )}
        </div>

        {attempt.score != null && attempt.max_score != null && (
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
            <Stat label="Score" value={`${attempt.score} / ${attempt.max_score}`} />
            <Stat label="Percentage" value={`${pct ?? '—'}%`} />
            <Stat label="Result" value={attempt.status === 'completed' ? (passed ? 'Passed ✓' : 'Failed ✗') : attempt.status} />
          </div>
        )}
      </div>

      {/* Answers */}
      {attempt.user_answers.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Your Answers</h2>
          {attempt.user_answers.map((ans, i) => {
            const raw = ans as Record<string, unknown>
            const questionId = raw.question_id as number | undefined
            const question = test?.questions.find(q => q.id === questionId)

            return (
              <div key={i} className="bg-white/10 dark:bg-white/5 rounded-xl border border-white/10 px-4 py-3 flex flex-col gap-1">
                <p className="text-sm font-medium">
                  {question?.title ?? `Question #${questionId ?? i + 1}`}
                </p>
                <pre className="text-xs opacity-50 font-sans whitespace-pre-wrap break-words">
                  {JSON.stringify(raw.data ?? ans, null, 2)}
                </pre>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs opacity-40">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}
