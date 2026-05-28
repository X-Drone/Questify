import { useNavigate, useParams, Link } from 'react-router'
import { useTestDetail } from '../../hooks/useTests'
import { useStartAttempt } from '../../hooks/useAttempts'

export function TestDetailView() {
  const { testId } = useParams<{ testId: string }>()
  const id = Number(testId)
  const navigate = useNavigate()

  const { data: test, isLoading, error } = useTestDetail(id)
  const startAttempt = useStartAttempt()

  async function handleStart() {
    const { attempt_id } = await startAttempt.mutateAsync(id)
    navigate(`/solver/tests/${id}/pass`, { state: { attemptId: attempt_id } })
  }

  if (isLoading) {
    return (
      <div className="max-w-xl flex flex-col gap-4">
        <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />
        <div className="h-52 bg-white/10 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (error || !test) {
    return <div className="py-12 text-center opacity-60">Test not found.</div>
  }

  return (
    <div className="max-w-xl flex flex-col gap-5">
      <Link to="/solver" className="text-sm opacity-50 hover:opacity-80 transition-opacity">
        ← Back to tests
      </Link>

      <div className="bg-white/10 dark:bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">{test.title}</h1>
          {test.description && (
            <p className="text-sm opacity-60 mt-2 leading-relaxed">{test.description}</p>
          )}
        </div>

        {test.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {test.tags.map(tag => (
              <span key={tag} className="text-xs bg-white/10 px-2 py-0.5 rounded-md opacity-70">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm opacity-50 border-t border-white/10 pt-3">
          <span>{test.questions.length} question{test.questions.length !== 1 ? 's' : ''}</span>
          {test.published_at && (
            <span>Published {new Date(test.published_at).toLocaleDateString()}</span>
          )}
        </div>

        <button
          onClick={handleStart}
          disabled={startAttempt.isPending || test.questions.length === 0}
          className="mt-1 w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-base"
        >
          {startAttempt.isPending ? 'Starting…' : 'Start Test'}
        </button>

        {test.questions.length === 0 && (
          <p className="text-xs text-center opacity-40">This test has no questions yet.</p>
        )}
      </div>
    </div>
  )
}
