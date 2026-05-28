import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useCreateTest } from '../../hooks/useTests'

export function CreateTest() {
  const navigate = useNavigate()
  const createMutation = useCreateTest()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    try {
      const test = await createMutation.mutateAsync({ title, description: description || null, tags })
      navigate(`/creator/tests/${test.id}/edit`)
    } catch {
      setError('Failed to create test. Please try again.')
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Create New Test</h1>

      <form onSubmit={handleSubmit} className="bg-white/10 dark:bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold mb-1.5 opacity-80">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="e.g. Python Basics Quiz"
            className="w-full bg-white/10 dark:bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:opacity-40"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 opacity-80">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="What is this test about?"
            className="w-full bg-white/10 dark:bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:opacity-40 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 opacity-80">Tags</label>
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="python, beginner, programming (comma-separated)"
            className="w-full bg-white/10 dark:bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:opacity-40"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {createMutation.isPending ? 'Creating…' : 'Create Test'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/creator')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
