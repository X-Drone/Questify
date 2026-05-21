import { Link } from 'react-router';
import { useAuth } from '../hooks/auth';

export function Landing() {
  const { isAuth } = useAuth();

  return (
    <div className="landing-page">
      <section className="hero">
        <h1>Welcome to Questify</h1>
        <p>Create and solve tests with ease</p>
        {isAuth ? (
          <div className="cta-buttons">
            <Link to="/creator" className="btn btn-primary">
              Go to Creator
            </Link>
            <Link to="/solver" className="btn btn-secondary">
              Go to Solver
            </Link>
          </div>
        ) : (
          <p className="auth-prompt">Sign in to get started</p>
        )}
      </section>
      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Create Tests</h3>
            <p>Design comprehensive tests with various question types</p>
          </div>
          <div className="feature-card">
            <h3>Solve Tests</h3>
            <p>Test your knowledge with questions from the community</p>
          </div>
          <div className="feature-card">
            <h3>Track Progress</h3>
            <p>View your history and scores for all completed tests</p>
          </div>
        </div>
      </section>
    </div>
  );
}
