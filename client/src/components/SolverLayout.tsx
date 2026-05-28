import { NavLink, Outlet } from 'react-router'
import { useAuth, useLoginRedirect } from '../hooks/auth'

export function SolverLayout() {
  const { isAuth, loading } = useAuth()
  const loginRedirect = useLoginRedirect()

  if (!loading && !isAuth) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-lg opacity-70">You need to log in to access the Solver area.</p>
        <button
          onClick={loginRedirect}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
        >
          Login
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
      <aside className="w-52 shrink-0">
        <div className="bg-white/10 dark:bg-white/5 rounded-xl border border-white/10 p-3 sticky top-24">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-50 px-2 mb-2">
            Solver
          </p>
          <nav className="flex flex-col gap-0.5">
            <SideLink to="/solver" end>Find Tests</SideLink>
            <SideLink to="/solver/history">History</SideLink>
          </nav>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}

function SideLink({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block px-3 py-2 text-sm rounded-lg transition-colors ${
          isActive
            ? 'bg-indigo-600 text-white font-semibold'
            : 'opacity-70 hover:opacity-100 hover:bg-white/10'
        }`
      }
    >
      {children}
    </NavLink>
  )
}
