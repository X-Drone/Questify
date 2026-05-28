import { useLocation, useNavigate, useParams, Link } from 'react-router'
import type { AttemptCompleteResponse } from '../../api/types'

export function CompletedTest() {
  const { testId } = useParams<{ testId: string }>()
  const { state } = useLocation()
  const navigate = useNavigate()

  const result: AttemptCompleteResponse | undefined = state?.result

  if (!result) {
    return (
      <div className="py-12 text-center opacity-60 flex flex-col gap-3">
        <p>No result data found.</p>
        <Link to="/solver" className="text-indigo-400 hover:text-indigo-300">Back to tests</Link>
      </div>
    )
  }

  const pct = Math.round(result.percentage ?? 0)
  const passed = result.passed

  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-6 py-8">
      {/* Score circle */}
      <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 ${passed ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
        <span className="text-4xl font-bold">{pct}%</span>
        <span className="text-sm opacity-60">{result.score}/{result.max_score}</span>
      </div>

      <div className="text-center flex flex-col gap-1">
        <h1 className="text-2xl font-bold">
          {passed ? '🎉 Passed!' : '❌ Not passed'}
        </h1>
        <p className="opacity-60 text-sm">
          You scored {result.score} out of {result.max_score} points.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Link
          to="/solver/history"
          className="w-full py-2.5 text-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
        >
          View History
        </Link>
        <button
          onClick={() => navigate(`/solver/tests/${testId}`)}
          className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
        >
          Try Again
        </button>
        <Link
          to="/solver"
          className="w-full py-2.5 text-center bg-white/5 hover:bg-white/10 rounded-xl text-sm opacity-70 transition-colors"
        >
          Browse Other Tests
        </Link>
      </div>
    </div>
  )
}
