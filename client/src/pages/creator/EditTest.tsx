import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTestDetail, useUpdateTest, usePublishTest } from '../../hooks/useTests'
import { useCreateQuestion, useDeleteQuestion } from '../../hooks/useQuestions'
import { questionsApi } from '../../api/questions.api'
import { queryKeys } from '../../hooks/queryKeys'
import type { Question, QuestionType, QuestionUpdateRequest } from '../../api/types'

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'single_choice', label: 'Single Choice' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'text_answer', label: 'Text Answer' },
  { value: 'numeric_answer', label: 'Numeric Answer' },
  { value: 'matching_pairs', label: 'Matching Pairs' },
  { value: 'ordering', label: 'Ordering' },
]

// ─── Local types ──────────────────────────────────────────────────────────────

type ChoiceOption = { text: string; is_correct: boolean }
type Pair = { left: string; right: string }

type QuestionDraft = {
  title: string
  description: string
  type: QuestionType
  choiceOptions: ChoiceOption[]
  trueFalseCorrect: boolean
  expectedText: string
  numericValue: string
  numericTolerance: string
  pairs: Pair[]
  orderedItems: string[]
}

function freshDraft(type: QuestionType = 'single_choice'): QuestionDraft {
  return {
    title: '',
    description: '',
    type,
    choiceOptions: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
    ],
    trueFalseCorrect: true,
    expectedText: '',
    numericValue: '',
    numericTolerance: '0',
    pairs: [{ left: '', right: '' }],
    orderedItems: ['', ''],
  }
}

function buildAnswerOptions(draft: QuestionDraft): Record<string, unknown>[] {
  switch (draft.type) {
    case 'single_choice':
    case 'multiple_choice':
      return draft.choiceOptions.map(o => ({ text: o.text, is_correct: o.is_correct }))
    case 'true_false':
      return [
        { text: 'True', is_correct: draft.trueFalseCorrect },
        { text: 'False', is_correct: !draft.trueFalseCorrect },
      ]
    case 'text_answer':
      return [{ text: draft.expectedText }]
    case 'numeric_answer':
      return [{ value: parseFloat(draft.numericValue) || 0, tolerance: parseFloat(draft.numericTolerance) || 0 }]
    case 'matching_pairs':
      return draft.pairs.map(p => ({ left: p.left, right: p.right }))
    case 'ordering':
      return draft.orderedItems.map((text, i) => ({ text, order: i + 1 }))
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EditTest() {
  const { testId } = useParams<{ testId: string }>()
  const id = Number(testId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: test, isLoading, error } = useTestDetail(id)
  const updateMutation = useUpdateTest(id)
  const publishMutation = usePublishTest()
  const createQuestion = useCreateQuestion(id)
  const deleteQuestion = useDeleteQuestion(id)

  const updateQuestion = useMutation({
    mutationFn: ({ questionId, data }: { questionId: number; data: QuestionUpdateRequest }) =>
      questionsApi.update(id, questionId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tests.detail(id) }),
  })

  // Meta editing state
  const [editingMeta, setEditingMeta] = useState(false)
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaTagsInput, setMetaTagsInput] = useState('')

  // Question form state
  const [addingQuestion, setAddingQuestion] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [draft, setDraft] = useState<QuestionDraft>(freshDraft())
  const [formError, setFormError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-10 w-64 bg-white/10 rounded-lg animate-pulse" />
        <div className="h-40 bg-white/10 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (error || !test) {
    return <div className="py-12 text-center opacity-60">Test not found.</div>
  }

  // ── Meta ──

  function startEditMeta() {
    setMetaTitle(test!.title)
    setMetaDescription(test!.description ?? '')
    setMetaTagsInput(test!.tags.join(', '))
    setEditingMeta(true)
  }

  async function saveMeta() {
    const tags = metaTagsInput.split(',').map(t => t.trim()).filter(Boolean)
    await updateMutation.mutateAsync({ title: metaTitle, description: metaDescription || null, tags })
    setEditingMeta(false)
  }

  // ── Question form ──

  function startAdd() {
    setDraft(freshDraft())
    setEditingQuestion(null)
    setFormError(null)
    setAddingQuestion(true)
  }

  function startEdit(q: Question) {
    const d = freshDraft(q.type)
    d.title = q.title
    d.description = q.description ?? ''

    if (q.type === 'single_choice' || q.type === 'multiple_choice') {
      d.choiceOptions = q.answer_options.map(o => ({
        text: o.text,
        is_correct: o.is_correct ?? false,
      }))
    } else if (q.type === 'true_false') {
      d.trueFalseCorrect = q.answer_options.find(o => o.text === 'True')?.is_correct ?? true
    } else if (q.type === 'text_answer') {
      d.expectedText = q.answer_options[0]?.text ?? ''
    } else if (q.type === 'matching_pairs') {
      d.pairs = q.answer_options.map(o => ({
        left: String((o as unknown as Record<string, unknown>).left ?? ''),
        right: String((o as unknown as Record<string, unknown>).right ?? ''),
      }))
    } else if (q.type === 'ordering') {
      d.orderedItems = [...q.answer_options]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(o => o.text)
    }

    setDraft(d)
    setEditingQuestion(q)
    setFormError(null)
    setAddingQuestion(true)
  }

  function closeForm() {
    setAddingQuestion(false)
    setEditingQuestion(null)
  }

  async function submitForm() {
    setFormError(null)
    if (!draft.title.trim()) { setFormError('Title is required.'); return }

    const answer_options = buildAnswerOptions(draft)

    try {
      if (editingQuestion) {
        await updateQuestion.mutateAsync({
          questionId: editingQuestion.id,
          data: { title: draft.title, description: draft.description || null, answer_options },
        })
      } else {
        await createQuestion.mutateAsync({
          title: draft.title,
          description: draft.description || null,
          type: draft.type,
          answer_options,
        })
      }
      closeForm()
    } catch {
      setFormError('Failed to save question. Please try again.')
    }
  }

  async function handleDelete(questionId: number) {
    if (!confirm('Delete this question?')) return
    await deleteQuestion.mutateAsync(questionId)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Test metadata card */}
      <div className="bg-white/10 dark:bg-white/5 rounded-2xl border border-white/10 p-5 flex flex-col gap-4">
        {editingMeta ? (
          <div className="flex flex-col gap-4">
            <Field label="Title">
              <input
                value={metaTitle}
                onChange={e => setMetaTitle(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={metaDescription}
                onChange={e => setMetaDescription(e.target.value)}
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </Field>
            <Field label="Tags (comma-separated)">
              <input
                value={metaTagsInput}
                onChange={e => setMetaTagsInput(e.target.value)}
                className={inputCls}
              />
            </Field>
            <div className="flex gap-2">
              <Btn onClick={saveMeta} disabled={updateMutation.isPending} variant="primary">
                {updateMutation.isPending ? 'Saving…' : 'Save'}
              </Btn>
              <Btn onClick={() => setEditingMeta(false)}>Cancel</Btn>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold truncate">{test.title}</h1>
                <StatusBadge status={test.status} />
              </div>
              {test.description && <p className="text-sm opacity-60">{test.description}</p>}
              {test.tags.length > 0 && (
                <p className="text-xs opacity-40 mt-1">{test.tags.join(' · ')}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap">
              <Btn onClick={startEditMeta}>Edit</Btn>
              {test.status === 'draft' && (
                <Btn
                  onClick={() => publishMutation.mutate(id)}
                  disabled={publishMutation.isPending || test.questions.length === 0}
                  variant="success"
                >
                  {publishMutation.isPending ? 'Publishing…' : 'Publish'}
                </Btn>
              )}
              <Btn onClick={() => navigate('/creator')}>← Back</Btn>
            </div>
          </div>
        )}
      </div>

      {/* Questions section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Questions{' '}
            <span className="opacity-40 font-normal text-sm">({test.questions.length})</span>
          </h2>
          {!addingQuestion && (
            <Btn onClick={startAdd} variant="primary">+ Add Question</Btn>
          )}
        </div>

        {test.questions.length === 0 && !addingQuestion && (
          <p className="text-sm opacity-50 py-6 text-center">
            No questions yet. Add your first question to get started.
          </p>
        )}

        {test.questions.map((q, idx) => (
          <QuestionRow
            key={q.id}
            question={q}
            index={idx}
            onEdit={() => startEdit(q)}
            onDelete={() => handleDelete(q.id)}
          />
        ))}

        {addingQuestion && (
          <QuestionForm
            draft={draft}
            onChange={setDraft}
            onSubmit={submitForm}
            onCancel={closeForm}
            isEditing={!!editingQuestion}
            isPending={createQuestion.isPending || updateQuestion.isPending}
            error={formError}
          />
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuestionRow({
  question,
  index,
  onEdit,
  onDelete,
}: {
  question: Question
  index: number
  onEdit: () => void
  onDelete: () => void
}) {
  const typeLabel = QUESTION_TYPES.find(t => t.value === question.type)?.label ?? question.type
  return (
    <div className="bg-white/10 dark:bg-white/5 rounded-xl border border-white/10 px-4 py-3 flex items-center gap-3">
      <span className="text-xs opacity-30 font-mono w-5 shrink-0 text-right">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{question.title}</p>
        <p className="text-xs opacity-40">
          {typeLabel} · {question.answer_options.length} option{question.answer_options.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={onEdit} className="text-xs px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-md transition-colors">Edit</button>
        <button onClick={onDelete} className="text-xs px-2.5 py-1 bg-red-600/70 hover:bg-red-600 text-white rounded-md transition-colors">Delete</button>
      </div>
    </div>
  )
}

function QuestionForm({
  draft,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isPending,
  error,
}: {
  draft: QuestionDraft
  onChange: (d: QuestionDraft) => void
  onSubmit: () => void
  onCancel: () => void
  isEditing: boolean
  isPending: boolean
  error: string | null
}) {
  function set(partial: Partial<QuestionDraft>) {
    onChange({ ...draft, ...partial })
  }

  function setChoiceText(i: number, text: string) {
    const opts = [...draft.choiceOptions]
    opts[i] = { ...opts[i], text }
    set({ choiceOptions: opts })
  }

  function setChoiceCorrect(i: number, checked: boolean) {
    const opts = draft.choiceOptions.map((o, idx) =>
      draft.type === 'single_choice'
        ? { ...o, is_correct: idx === i }
        : { ...o, is_correct: idx === i ? checked : o.is_correct }
    )
    set({ choiceOptions: opts })
  }

  function addChoice() {
    set({ choiceOptions: [...draft.choiceOptions, { text: '', is_correct: false }] })
  }

  function removeChoice(i: number) {
    set({ choiceOptions: draft.choiceOptions.filter((_, idx) => idx !== i) })
  }

  function setPair(i: number, side: 'left' | 'right', val: string) {
    const p = [...draft.pairs]
    p[i] = { ...p[i], [side]: val }
    set({ pairs: p })
  }

  function setOrderedItem(i: number, val: string) {
    const items = [...draft.orderedItems]
    items[i] = val
    set({ orderedItems: items })
  }

  return (
    <div className="bg-indigo-900/30 dark:bg-indigo-950/50 rounded-2xl border border-indigo-500/30 p-5 flex flex-col gap-4">
      <h3 className="font-semibold text-sm">{isEditing ? 'Edit Question' : 'New Question'}</h3>

      <Field label="Title *">
        <input
          value={draft.title}
          onChange={e => set({ title: e.target.value })}
          placeholder="Question text…"
          className={inputCls}
        />
      </Field>

      <Field label="Description (optional)">
        <input
          value={draft.description}
          onChange={e => set({ description: e.target.value })}
          placeholder="Additional context…"
          className={inputCls}
        />
      </Field>

      <Field label="Type">
        {isEditing ? (
          <p className="text-sm px-3 py-2 bg-white/5 rounded-lg opacity-60">
            {QUESTION_TYPES.find(t => t.value === draft.type)?.label}
          </p>
        ) : (
          <select
            value={draft.type}
            onChange={e => set({ type: e.target.value as QuestionType })}
            className={inputCls}
          >
            {QUESTION_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        )}
      </Field>

      {/* Choice options */}
      {(draft.type === 'single_choice' || draft.type === 'multiple_choice') && (
        <Field label={`Options — ${draft.type === 'single_choice' ? 'pick one correct' : 'pick all correct'}`}>
          <div className="flex flex-col gap-2">
            {draft.choiceOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type={draft.type === 'single_choice' ? 'radio' : 'checkbox'}
                  checked={opt.is_correct}
                  onChange={e => setChoiceCorrect(i, e.target.checked)}
                  name="correct"
                  className="accent-indigo-500 shrink-0"
                />
                <input
                  value={opt.text}
                  onChange={e => setChoiceText(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className={`${inputCls} flex-1`}
                />
                {draft.choiceOptions.length > 2 && (
                  <button onClick={() => removeChoice(i)} className="text-red-400 hover:text-red-300 text-xl leading-none">×</button>
                )}
              </div>
            ))}
            <button onClick={addChoice} className="text-xs text-indigo-400 hover:text-indigo-300 text-left">+ Add option</button>
          </div>
        </Field>
      )}

      {/* True/False */}
      {draft.type === 'true_false' && (
        <Field label="Correct answer">
          <div className="flex gap-4">
            {(['true', 'false'] as const).map(val => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tf"
                  checked={draft.trueFalseCorrect === (val === 'true')}
                  onChange={() => set({ trueFalseCorrect: val === 'true' })}
                  className="accent-indigo-500"
                />
                <span className="text-sm capitalize">{val}</span>
              </label>
            ))}
          </div>
        </Field>
      )}

      {/* Text answer */}
      {draft.type === 'text_answer' && (
        <Field label="Expected answer">
          <input
            value={draft.expectedText}
            onChange={e => set({ expectedText: e.target.value })}
            placeholder="Correct answer text…"
            className={inputCls}
          />
        </Field>
      )}

      {/* Numeric answer */}
      {draft.type === 'numeric_answer' && (
        <div className="flex gap-3">
          <Field label="Correct value">
            <input type="number" value={draft.numericValue} onChange={e => set({ numericValue: e.target.value })} placeholder="e.g. 9.81" className={inputCls} />
          </Field>
          <Field label="Tolerance (±)">
            <input type="number" value={draft.numericTolerance} onChange={e => set({ numericTolerance: e.target.value })} placeholder="0" min="0" className={inputCls} />
          </Field>
        </div>
      )}

      {/* Matching pairs */}
      {draft.type === 'matching_pairs' && (
        <Field label="Pairs (left ↔ right)">
          <div className="flex flex-col gap-2">
            {draft.pairs.map((pair, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={pair.left} onChange={e => setPair(i, 'left', e.target.value)} placeholder="Left…" className={`${inputCls} flex-1`} />
                <span className="opacity-40 shrink-0">↔</span>
                <input value={pair.right} onChange={e => setPair(i, 'right', e.target.value)} placeholder="Right…" className={`${inputCls} flex-1`} />
                {draft.pairs.length > 1 && (
                  <button onClick={() => set({ pairs: draft.pairs.filter((_, idx) => idx !== i) })} className="text-red-400 hover:text-red-300 text-xl leading-none">×</button>
                )}
              </div>
            ))}
            <button onClick={() => set({ pairs: [...draft.pairs, { left: '', right: '' }] })} className="text-xs text-indigo-400 hover:text-indigo-300 text-left">+ Add pair</button>
          </div>
        </Field>
      )}

      {/* Ordering */}
      {draft.type === 'ordering' && (
        <Field label="Items in correct order (top = first)">
          <div className="flex flex-col gap-2">
            {draft.orderedItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs opacity-30 w-4 text-right shrink-0">{i + 1}.</span>
                <input value={item} onChange={e => setOrderedItem(i, e.target.value)} placeholder={`Item ${i + 1}…`} className={`${inputCls} flex-1`} />
                {draft.orderedItems.length > 2 && (
                  <button onClick={() => set({ orderedItems: draft.orderedItems.filter((_, idx) => idx !== i) })} className="text-red-400 hover:text-red-300 text-xl leading-none">×</button>
                )}
              </div>
            ))}
            <button onClick={() => set({ orderedItems: [...draft.orderedItems, ''] })} className="text-xs text-indigo-400 hover:text-indigo-300 text-left">+ Add item</button>
          </div>
        </Field>
      )}

      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <Btn onClick={onSubmit} disabled={isPending} variant="primary">
          {isPending ? 'Saving…' : isEditing ? 'Update Question' : 'Add Question'}
        </Btn>
        <Btn onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputCls =
  'bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:opacity-40 w-full'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold opacity-70">{label}</label>
      {children}
    </div>
  )
}

function Btn({
  children,
  onClick,
  disabled,
  variant = 'ghost',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'success' | 'ghost'
}) {
  const cls = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
    ghost: 'bg-white/10 hover:bg-white/20',
  }[variant]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${cls}`}
    >
      {children}
    </button>
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
