import { Outlet, Link, useNavigate } from 'react-router';
import { useAuth, logout } from '../hooks/auth';

export function HeaderLayout() {
  const { isAuth, username } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            Questify
          </Link>
          <nav className="nav">
            {isAuth ? (
              <>
                <Link to="/creator" className="nav-link">
                  Creator
                </Link>
                <Link to="/solver" className="nav-link">
                  Solver
                </Link>
                <span className="user-info">{username}</span>
                <button
                  onClick={handleLogout}
                  className="btn-logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <span className="auth-message">
                Please login to continue
              </span>
            )}
          </nav>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
