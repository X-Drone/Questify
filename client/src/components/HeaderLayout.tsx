import { Link, Outlet, useNavigate } from 'react-router'
import { useAuth, useLoginRedirect, logout } from '../hooks/auth'

export function HeaderLayout() {
  const { isAuth, username, loading } = useAuth()
  const loginRedirect = useLoginRedirect()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-indigo-900/90 dark:bg-indigo-950/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-white shrink-0 tracking-tight">
            Questify
          </Link>

          {!loading && isAuth && (
            <nav className="flex items-center gap-1">
              <Link
                to="/creator"
                className="px-3 py-1.5 text-sm text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Creator
              </Link>
              <Link
                to="/solver"
                className="px-3 py-1.5 text-sm text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Solver
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-3 ml-auto">
            {loading ? (
              <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse" />
            ) : isAuth ? (
              <>
                <span className="text-sm text-indigo-200 hidden sm:block truncate max-w-40">
                  {username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={loginRedirect}
                className="text-sm px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      <footer className="py-4 text-center text-xs text-indigo-400/50">
        Questify © 2025
      </footer>
    </div>
  )
}
