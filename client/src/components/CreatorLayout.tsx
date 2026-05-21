import { Outlet } from 'react-router';

export function CreatorLayout() {
  return (
    <div className="creator-layout">
      <aside className="creator-sidebar">
        <h2>Creator Dashboard</h2>
        <nav className="creator-nav">
          <a href="/creator" className="nav-item">My Tests</a>
          <a href="/creator/tests/new" className="nav-item primary">
            + Create New Test
          </a>
        </nav>
      </aside>
      <section className="creator-content">
        <Outlet />
      </section>
    </div>
  );
}
