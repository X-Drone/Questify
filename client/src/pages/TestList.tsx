import { Link } from 'react-router';
import { useMyTests } from '../hooks/useTests';

export function TestList() {
  const { data: tests, isLoading, error } = useMyTests();

  if (isLoading) return <div className="loading">Loading your tests...</div>;

  if (error) {
    return (
      <div className="error">
        <p>Failed to load tests. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="test-list-page">
      <div className="page-header">
        <h1>My Tests</h1>
        <Link to="/creator/tests/new" className="btn btn-primary">
          + Create New Test
        </Link>
      </div>

      {!tests || tests.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any tests yet.</p>
          <Link to="/creator/tests/new" className="btn btn-primary">
            Create Your First Test
          </Link>
        </div>
      ) : (
        <div className="tests-grid">
          {tests.map((test) => (
            <div key={test.id} className="test-card">
              <h3>{test.title}</h3>
              {test.description && (
                <p className="description">{test.description}</p>
              )}
              <div className="test-meta">
                <span className="question-count">
                  {test.question_count} questions
                </span>
                <span className={`status status-${test.status.toLowerCase()}`}>
                  {test.status}
                </span>
              </div>
              {test.tags && test.tags.length > 0 && (
                <div className="tags">
                  {test.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="test-actions">
                <Link
                  to={`/creator/tests/${test.id}/edit`}
                  className="btn btn-secondary"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
