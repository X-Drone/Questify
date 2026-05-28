import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { useTestDetail } from '../../hooks/useTests'
import { useCompleteAttempt } from '../../hooks/useAttempts'
import { attemptsApi } from '../../api/attempts.api'
import type { AnswerData, Question } from '../../api/types'

export function PassingTest() {
  const { testId } = useParams<{ testId: string }>()
  const { state } = useLocation()
  const navigate = useNavigate()

  const id = Number(testId)
  const attemptId: number | undefined = state?.attemptId

  const { data: test, isLoading } = useTestDetail(id)
  const completeAttempt = useCompleteAttempt()

  const submitAnswer = useMutation({
    mutationFn: ({ questionId, data }: { questionId: number; data: AnswerData }) =>
      attemptsApi.submitAnswer(attemptId!, questionId, data),
  })

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answer, setAnswer] = useState<AnswerData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!attemptId) {
    return (
      <div className="py-12 text-center opacity-60">
        <p>Invalid session. <a href={`/solver/tests/${id}`} className="text-indigo-400 underline">Go back to test</a>.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-xl flex flex-col gap-4">
        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        <div className="h-64 bg-white/10 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!test || test.questions.length === 0) {
    return <div className="py-12 text-center opacity-60">Test not found or has no questions.</div>
  }

  const questions = test.questions
  const current = questions[currentIdx]
  const isLast = currentIdx === questions.length - 1
  const progress = ((currentIdx) / questions.length) * 100

  async function handleNext() {
    if (!answer) { setError('Please select an answer before continuing.'); return }
    setError(null)
    setSubmitting(true)

    try {
      await submitAnswer.mutateAsync({ questionId: current.id, data: answer })

      if (isLast) {
        const result = await completeAttempt.mutateAsync(attemptId!)
        navigate(`/solver/tests/${id}/completed`, { state: { result, attemptId } })
      } else {
        setCurrentIdx(i => i + 1)
        setAnswer(null)
      }
    } catch {
      setError('Failed to submit answer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl flex flex-col gap-5">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs opacity-50 mb-1">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white/10 dark:bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold leading-snug">{current.title}</h2>
          {current.description && (
            <p className="text-sm opacity-60 mt-1">{current.description}</p>
          )}
        </div>

        <AnswerInput question={current} value={answer} onChange={setAnswer} />

        {error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handleNext}
          disabled={submitting || !answer}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
        >
          {submitting
            ? isLast ? 'Submitting…' : 'Saving…'
            : isLast ? 'Submit Test' : 'Next Question'}
        </button>
      </div>
    </div>
  )
}

// ─── Answer input components per question type ────────────────────────────────

function AnswerInput({
  question,
  value,
  onChange,
}: {
  question: Question
  value: AnswerData | null
  onChange: (d: AnswerData) => void
}) {
  const opts = question.answer_options

  switch (question.type) {
    case 'single_choice':
      return (
        <div className="flex flex-col gap-2">
          {opts.map((opt, i) => {
            const selected = value && 'selected_id' in value ? value.selected_id === (opt.id ?? i) : false
            return (
              <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selected ? 'border-indigo-500 bg-indigo-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                <input
                  type="radio"
                  name={`q${question.id}`}
                  className="accent-indigo-500"
                  checked={selected}
                  onChange={() => onChange({ selected_id: opt.id ?? i })}
                />
                <span className="text-sm">{opt.text}</span>
              </label>
            )
          })}
        </div>
      )

    case 'multiple_choice':
      return (
        <div className="flex flex-col gap-2">
          {opts.map((opt, i) => {
            const ids: number[] = value && 'selected_ids' in value ? value.selected_ids : []
            const optId = opt.id ?? i
            const checked = ids.includes(optId)
            return (
              <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${checked ? 'border-indigo-500 bg-indigo-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                <input
                  type="checkbox"
                  className="accent-indigo-500"
                  checked={checked}
                  onChange={() => {
                    const next = checked ? ids.filter(id => id !== optId) : [...ids, optId]
                    onChange({ selected_ids: next })
                  }}
                />
                <span className="text-sm">{opt.text}</span>
              </label>
            )
          })}
        </div>
      )

    case 'true_false': {
      const current = value && 'selected_value' in value ? value.selected_value : undefined
      return (
        <div className="flex gap-3">
          {(['true', 'false'] as const).map(val => {
            const boolVal = val === 'true'
            const selected = current === boolVal || current === val
            return (
              <button
                key={val}
                onClick={() => onChange({ selected_value: boolVal })}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${selected ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                {val.charAt(0).toUpperCase() + val.slice(1)}
              </button>
            )
          })}
        </div>
      )
    }

    case 'text_answer': {
      const text = value && 'text' in value ? value.text : ''
      return (
        <textarea
          value={text}
          onChange={e => onChange({ text: e.target.value })}
          placeholder="Type your answer…"
          rows={3}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:opacity-40 resize-none"
        />
      )
    }

    case 'numeric_answer': {
      const numVal = value && 'value' in value ? String(value.value) : ''
      return (
        <input
          type="number"
          value={numVal}
          onChange={e => onChange({ value: parseFloat(e.target.value) || 0 })}
          placeholder="Enter a number…"
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:opacity-40"
        />
      )
    }

    case 'matching_pairs': {
      // Each option text is stored as "left|right" by the backend.
      const parsedPairs = opts.map(o => {
        const [left = '', right = ''] = o.text.split('|', 2)
        return { left, right }
      })
      const rightChoices = [...parsedPairs.map(p => p.right)].sort()

      const currentPairs: { left: string; right: string }[] =
        value && 'pairs' in value ? (value.pairs as { left: string; right: string }[]) : []

      function getSelected(leftText: string) {
        return currentPairs.find(p => p.left === leftText)?.right ?? ''
      }

      function setPair(leftText: string, rightText: string) {
        const next = currentPairs.filter(p => p.left !== leftText)
        if (rightText) next.push({ left: leftText, right: rightText })
        onChange({ pairs: next })
      }

      return (
        <div className="flex flex-col gap-2">
          {parsedPairs.map(({ left }, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="flex-1 text-sm bg-white/10 rounded-lg px-3 py-2">{left}</span>
              <span className="opacity-40 shrink-0">→</span>
              <select
                value={getSelected(left)}
                onChange={e => setPair(left, e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select match…</option>
                {rightChoices.map((right, j) => (
                  <option key={j} value={right}>{right}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )
    }

    case 'ordering': {
      const currentOrder: number[] = value && 'order' in value ? value.order : opts.map((o, i) => o.id ?? i)
      const ordered = currentOrder.map(id => opts.find((o, i) => (o.id ?? i) === id) ?? opts[0])

      function move(idx: number, dir: -1 | 1) {
        const next = [...currentOrder]
        const swap = idx + dir
        if (swap < 0 || swap >= next.length) return
        ;[next[idx], next[swap]] = [next[swap], next[idx]]
        onChange({ order: next })
      }

      return (
        <div className="flex flex-col gap-2">
          {ordered.map((opt, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
              <span className="text-xs opacity-30 w-4 shrink-0 text-right">{i + 1}.</span>
              <span className="flex-1 text-sm">{opt.text}</span>
              <div className="flex gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="text-xs px-1.5 py-0.5 bg-white/10 hover:bg-white/20 rounded disabled:opacity-20 transition-colors">↑</button>
                <button onClick={() => move(i, 1)} disabled={i === ordered.length - 1} className="text-xs px-1.5 py-0.5 bg-white/10 hover:bg-white/20 rounded disabled:opacity-20 transition-colors">↓</button>
              </div>
            </div>
          ))}
        </div>
      )
    }

    default:
      return <p className="text-sm opacity-50">Unsupported question type.</p>
  }
}
