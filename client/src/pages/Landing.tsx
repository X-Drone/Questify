import { Link } from 'react-router'
import { useAuth, useLoginRedirect } from '../hooks/auth'

export function Landing() {
  const { isAuth, loading } = useAuth()
  const loginRedirect = useLoginRedirect()

  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <section className="flex flex-col items-center text-center gap-6 py-16">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
          Test Knowledge.<br />
          <span className="text-indigo-400">Share It.</span>
        </h1>
        <p className="text-lg opacity-60 max-w-xl">
          Create custom tests, challenge your peers, and track results — all in one place.
        </p>

        {loading ? (
          <div className="h-11 w-48 bg-white/10 rounded-xl animate-pulse" />
        ) : isAuth ? (
          <div className="flex gap-3 flex-wrap justify-center">
            <Link
              to="/creator"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
            >
              Create Tests
            </Link>
            <Link
              to="/solver"
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 font-semibold rounded-xl transition-colors"
            >
              Browse Tests
            </Link>
          </div>
        ) : (
          <button
            onClick={loginRedirect}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-xl transition-colors shadow-lg shadow-indigo-900/30"
          >
            Get Started
          </button>
        )}
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FeatureCard
          icon="✏️"
          title="Create Tests"
          description="Build tests with 7 question types: multiple choice, ordering, matching, and more."
        />
        <FeatureCard
          icon="🧩"
          title="Solve Tests"
          description="Browse published tests and challenge yourself. Track your score and progress."
        />
        <FeatureCard
          icon="📊"
          title="Track Results"
          description="Review your attempt history and see detailed breakdowns of every test."
        />
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white/10 dark:bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col gap-3">
      <span className="text-3xl">{icon}</span>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm opacity-60 leading-relaxed">{description}</p>
    </div>
  )
}
