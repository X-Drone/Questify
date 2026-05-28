import { useState } from 'react'
import { Link } from 'react-router'
import { usePublishedTests } from '../../hooks/useTests'
import type { TestListResponse } from '../../api/types'

export function TestSeek() {
  const { data: tests, isLoading, error } = usePublishedTests()
  const [search, setSearch] = useState('')

  const filtered = tests?.filter(t => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q))
    )
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-10 w-full bg-white/10 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="py-12 text-center opacity-60">Failed to load tests. Please try again.</div>
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Find Tests</h1>

      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by title, description or tag…"
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:opacity-40"
      />

      {filtered?.length === 0 ? (
        <div className="py-16 text-center opacity-50">
          <p>{search ? `No tests matching "${search}"` : 'No published tests yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered?.map(test => <TestCard key={test.id} test={test} />)}
        </div>
      )}
    </div>
  )
}

function TestCard({ test }: { test: TestListResponse }) {
  return (
    <Link
      to={`/solver/tests/${test.id}`}
      className="bg-white/10 dark:bg-white/5 rounded-2xl border border-white/10 p-5 flex flex-col gap-3 hover:bg-white/15 transition-colors"
    >
      <h2 className="font-semibold text-base leading-snug">{test.title}</h2>

      {test.description && (
        <p className="text-sm opacity-60 line-clamp-2 leading-relaxed">{test.description}</p>
      )}

      <div className="flex items-center gap-3 text-xs opacity-50 mt-auto">
        <span>{test.question_count} question{test.question_count !== 1 ? 's' : ''}</span>
        {test.tags && test.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {test.tags.slice(0, 3).map(tag => (
              <span key={tag} className="bg-white/10 px-1.5 py-0.5 rounded-md">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
