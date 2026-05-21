import { Outlet } from 'react-router';

export function SolverLayout() {
  return (
    <div className="solver-layout">
      <aside className="solver-sidebar">
        <h2>Solver Dashboard</h2>
        <nav className="solver-nav">
          <a href="/solver" className="nav-item">Find Tests</a>
          <a href="/solver/history" className="nav-item">History</a>
        </nav>
      </aside>
      <section className="solver-content">
        <Outlet />
      </section>
    </div>
  );
}
