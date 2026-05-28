import { Link, useNavigate } from 'react-router'
import { useMyTests, useDeleteTest, usePublishTest } from '../hooks/useTests'
import type { TestListResponse } from '../api/types'

export function TestList() {
  const { data: tests, isLoading, error } = useMyTests()
  const deleteMutation = useDeleteTest()
  const publishMutation = usePublishTest()
  const navigate = useNavigate()

  async function handleDelete(id: number) {
    if (!confirm('Delete this test? This cannot be undone.')) return
    await deleteMutation.mutateAsync(id)
  }

  async function handlePublish(id: number) {
    await publishMutation.mutateAsync(id)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-44 bg-white/10 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center opacity-60">
        <p>Failed to load tests. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Tests</h1>
        <Link
          to="/creator/tests/new"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + New Test
        </Link>
      </div>

      {tests?.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 opacity-60">
          <span className="text-5xl">📋</span>
          <p className="text-lg">No tests yet.</p>
          <Link
            to="/creator/tests/new"
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
          >
            Create your first test →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tests?.map(test => (
            <TestCard
              key={test.id}
              test={test}
              onEdit={() => navigate(`/creator/tests/${test.id}/edit`)}
              onPublish={() => handlePublish(test.id)}
              onDelete={() => handleDelete(test.id)}
              publishing={publishMutation.isPending && publishMutation.variables === test.id}
              deleting={deleteMutation.isPending && deleteMutation.variables === test.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TestCard({
  test,
  onEdit,
  onPublish,
  onDelete,
  publishing,
  deleting,
}: {
  test: TestListResponse
  onEdit: () => void
  onPublish: () => void
  onDelete: () => void
  publishing: boolean
  deleting: boolean
}) {
  const isDraft = test.status === 'draft'

  return (
    <div className="bg-white/10 dark:bg-white/5 rounded-2xl border border-white/10 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold text-base leading-snug">{test.title}</h2>
        <StatusBadge status={test.status} />
      </div>

      {test.description && (
        <p className="text-sm opacity-60 leading-relaxed line-clamp-2">{test.description}</p>
      )}

      <div className="flex items-center gap-3 text-xs opacity-50">
        <span>{test.question_count} question{test.question_count !== 1 ? 's' : ''}</span>
        {test.tags && test.tags.length > 0 && (
          <span className="truncate">{test.tags.join(', ')}</span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-1 flex-wrap">
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium"
        >
          Edit
        </button>
        {isDraft && (
          <button
            onClick={onPublish}
            disabled={publishing}
            className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
          >
            {publishing ? 'Publishing…' : 'Publish'}
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={deleting}
          className="px-3 py-1.5 text-xs bg-red-600/80 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium ml-auto"
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'published'
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-white/10 opacity-60 border-white/10'

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${styles}`}>
      {status}
    </span>
  )
}
