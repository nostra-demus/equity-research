import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../lib/api'
import { useStore } from '../../lib/store'
import type { TaskAssignee, TaskCard, TaskDecision, TaskInput, TaskScope, TaskStage, TasksRead } from '../../lib/types'
import { mergeTaskUpdatePatches, optimisticTask, overlayOptimisticTasks, replaceTask, retryableTaskUpdateError, taskLabel, taskMatchesPatch, taskTickerInput } from './taskOptimistic'

const STAGES: { id: TaskStage; label: string; step: string }[] = [
  { id: 'idea_generation', label: 'Idea generation', step: '01' },
  { id: 'ticker_identified', label: 'Ticker identified', step: '02' },
  { id: 'deep_dive', label: 'Deep Dive', step: '03' },
  { id: 'final_decision', label: 'Final Decision', step: '04' },
]

const PEOPLE = [
  { id: 'AB' as const, name: 'Ayush Banka' },
  { id: 'NV' as const, name: 'Noel Vaz' },
  { id: 'CK' as const, name: 'Chiraag Kapil' },
]

const DECISIONS: { id: TaskDecision; label: string }[] = [
  { id: 'deploy', label: 'Deploy' }, { id: 'reject', label: 'Reject' }, { id: 'watch', label: 'Watch' },
]
const TASK_MAX_ATTACHMENTS = 5
type TaskSaveResult = { ok: boolean; task: TaskCard; publish_error?: string; reconcile_warning?: string }

const emptyDraft = (): TaskInput => ({
  scope: 'ticker', ticker: '', subject: '', title: '', stage: 'idea_generation', decision: null, assignee: 'CK',
})

function personName(id: TaskAssignee): string { return PEOPLE.find((person) => person.id === id)?.name ?? id }
function stageIndex(stage: TaskStage): number { return STAGES.findIndex((item) => item.id === stage) }
function taskRequestTimedOut(cause: any): boolean { return cause?.name === 'TimeoutError' || cause?.name === 'AbortError' }

function TaskEditor({ task, initial, attachmentsEnabled, onClose, onSaved, saveTask }: {
  task: TaskCard | null
  initial?: Partial<TaskInput>
  attachmentsEnabled: boolean
  onClose: () => void
  onSaved: () => Promise<void>
  saveTask: (task: TaskCard | null, input: TaskInput) => Promise<TaskSaveResult>
}) {
  const tickers = useStore((state) => state.tickers)
  const setToast = useStore((state) => state.setToast)
  const [draft, setDraft] = useState<TaskInput>({ ...emptyDraft(), ...(task ? {
    scope: task.scope, ticker: taskTickerInput(task), subject: task.subject, title: task.title, stage: task.stage,
    decision: task.decision, assignee: task.assignee,
  } : {}), ...(initial ?? {}) })
  const [files, setFiles] = useState<File[]>([])
  const [attachments, setAttachments] = useState(task?.attachments ?? [])
  const [saving, setSaving] = useState(false)
  const [retryBlocked, setRetryBlocked] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const savingRef = useRef(saving)
  const closeRef = useRef(onClose)
  savingRef.current = saving
  closeRef.current = onClose

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const inertBefore = new Map<HTMLElement, boolean>()
    let branch: HTMLElement | null = dialogRef.current
    while (branch?.parentElement && branch.parentElement !== document.body) {
      for (const sibling of Array.from(branch.parentElement.children)) {
        if (sibling instanceof HTMLElement && sibling !== branch) {
          inertBefore.set(sibling, sibling.hasAttribute('inert'))
          sibling.setAttribute('inert', '')
        }
      }
      branch = branch.parentElement
    }
    const focusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]',
    ) ?? []).filter((element) => element.offsetParent !== null)
    const focusFrame = requestAnimationFrame(() => {
      const preferred = dialogRef.current?.querySelector<HTMLElement>('#task-subject')
      const target = preferred ?? focusable()[0]
      target?.focus()
    })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !savingRef.current) { event.preventDefault(); closeRef.current() }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (!items.length) { event.preventDefault(); dialogRef.current?.focus(); return }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(focusFrame)
      window.removeEventListener('keydown', onKey)
      for (const [element, inert] of inertBefore) if (!inert) element.removeAttribute('inert')
      opener?.focus()
    }
  }, [])

  const showWatchTicker = draft.stage === 'final_decision' && draft.decision === 'watch'
  const blocker = retryBlocked ? 'Refresh the board before trying this save again.' : null

  const save = async () => {
    if (blocker || saving) return
    setSaving(true)
    try {
      const input: TaskInput = {
        ...draft,
        ticker: draft.ticker?.trim() || null,
        subject: draft.subject.trim(),
        title: draft.title.trim(),
        decision: draft.stage === 'final_decision' ? draft.decision : null,
      }
      const result = await saveTask(task, input)
      let warning = result.reconcile_warning ?? (result.publish_error ? `Saved locally, but did not sync: ${result.publish_error}` : '')
      if (files.length) {
        try {
          const uploaded = await api.taskAttach(result.task.task_id, files)
          if (uploaded.fileErrors.length) warning = `${uploaded.fileErrors.length} file${uploaded.fileErrors.length === 1 ? '' : 's'} did not attach: ${uploaded.fileErrors[0].reason}`
          else if (uploaded.publish_error) warning = `Files saved locally, but did not sync: ${uploaded.publish_error}`
        } catch (error: any) { warning = `The task saved, but its files did not: ${error?.message ?? 'upload failed'}` }
      }
      await onSaved()
      setToast(warning ? { msg: warning, tone: 'bad' } : { msg: task ? 'Task updated.' : 'Task added.', tone: 'good' })
      onClose()
    } catch (error: any) {
      if (error?.retryBlocked) setRetryBlocked(true)
      setToast({ msg: error?.message || 'Could not save the task.', tone: 'bad' })
    } finally { setSaving(false) }
  }

  const addFiles = (next: File[]) => {
    const accepted = next.filter((file) => /\.(pdf|doc|docx|md)$/i.test(file.name))
    setFiles((current) => [...current, ...accepted].slice(0, Math.max(0, TASK_MAX_ATTACHMENTS - attachments.length)))
  }

  const detach = async (attachmentId: string) => {
    if (!task) return
    try {
      const result = await api.taskDetach(task.task_id, attachmentId)
      setAttachments(result.task.attachments)
      await onSaved()
    }
    catch { setToast({ msg: 'Could not remove that file.', tone: 'bad' }) }
  }

  return (
    <div className="taskmodal__backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose() }}>
      <section ref={dialogRef} className="taskmodal" role="dialog" aria-modal="true" aria-label={task ? 'Edit task' : 'Add task'} tabIndex={-1}>
        <header className="taskmodal__head">
          <div><span className="taskmodal__eyebrow">Tasks</span><h2>{task ? 'Edit task' : 'New task'}</h2></div>
          <button className="iconbtn" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="taskmodal__body">
          <div className="taskfield">
            <label>What are you working on?</label>
            <div className="seg" role="group" aria-label="Task scope">
              {([['ticker', 'Ticker'], ['company_event', 'Company event'], ['world_event', 'World event']] as [TaskScope, string][]).map(([id, label]) => (
                <button key={id} aria-pressed={draft.scope === id} className={`seg__btn${draft.scope === id ? ' seg__btn--on' : ''}`} onClick={() => setDraft({ ...draft, scope: id, ticker: id === 'world_event' ? null : draft.ticker })}>{label}</button>
              ))}
            </div>
          </div>
          <div className="taskmodal__identity">
            {(draft.scope !== 'world_event' || showWatchTicker) && (
              <div className="taskfield taskfield--ticker">
                <label htmlFor="task-ticker">Ticker <span>optional · any label is accepted</span></label>
                <input id="task-ticker" className="fld" list="task-ticker-list" value={draft.ticker ?? ''} onChange={(event) => setDraft({ ...draft, ticker: event.target.value })} placeholder="e.g. NU or Nu Holdings" />
                <datalist id="task-ticker-list">{tickers.map((ticker) => <option key={ticker.ticker} value={ticker.ticker} />)}</datalist>
              </div>
            )}
            <div className="taskfield">
              <label htmlFor="task-subject">{draft.scope === 'ticker' ? 'Company / idea' : 'Event'} <span>optional</span></label>
              <input id="task-subject" className="fld" value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} placeholder={draft.scope === 'world_event' ? 'e.g. India rate decision' : draft.scope === 'company_event' ? 'e.g. Q3 results on 29 October' : 'e.g. Cloud margin inflection'} />
            </div>
          </div>
          <div className="taskfield">
            <label htmlFor="task-copy">Task <span>optional</span></label>
            <textarea id="task-copy" className="fld" rows={4} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="What needs to be done?" />
          </div>
          <div className="taskmodal__identity">
            <div className="taskfield">
              <label htmlFor="task-stage">Stage</label>
              <select id="task-stage" className="fld" value={draft.stage} onChange={(event) => {
                const stage = event.target.value as TaskStage
                setDraft({ ...draft, stage, decision: stage === 'final_decision' ? draft.decision : null })
              }}>
                {STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.step} · {stage.label}</option>)}
              </select>
            </div>
            <div className="taskfield">
              <label htmlFor="task-assignee">Person</label>
              <select id="task-assignee" className="fld" value={draft.assignee} onChange={(event) => setDraft({ ...draft, assignee: event.target.value as TaskAssignee })}>
                {PEOPLE.map((person) => <option key={person.id} value={person.id}>{person.id} · {person.name}</option>)}
              </select>
            </div>
          </div>
          {draft.stage === 'final_decision' && (
            <div className="taskfield">
              <label>Final decision <span>optional</span></label>
              <div className="taskdecision" role="group" aria-label="Final decision">
                {DECISIONS.map((decision) => <button key={decision.id} aria-pressed={draft.decision === decision.id} data-decision={decision.id} className={draft.decision === decision.id ? 'is-on' : ''} onClick={() => setDraft({ ...draft, decision: decision.id })}>{decision.label}</button>)}
              </div>
              {draft.decision === 'watch' && <p className="taskfield__hint">A usable ticker syncs to Watchlist. Without one, the task still saves and can be linked later.</p>}
            </div>
          )}
          <div className="taskfield">
            <label>Attachments <span>{attachments.length + files.length}/{TASK_MAX_ATTACHMENTS}</span></label>
            {task && attachments.map((attachment) => (
              <div className="taskfile" key={attachment.attachment_id}>
                <a href={api.taskAttachmentUrl(task.task_id, attachment.attachment_id)} target="_blank" rel="noreferrer">{attachment.filename}</a>
                <span>{Math.max(1, Math.round(attachment.bytes / 1024))} KB</span>
                <button onClick={() => void detach(attachment.attachment_id)} aria-label={`Remove ${attachment.filename}`}>✕</button>
              </div>
            ))}
            {files.map((file, index) => <div className="taskfile" key={`${file.name}-${index}`}><span>{file.name}</span><span>{Math.max(1, Math.round(file.size / 1024))} KB</span><button onClick={() => setFiles(files.filter((_, i) => i !== index))}>✕</button></div>)}
            {attachmentsEnabled && attachments.length + files.length < TASK_MAX_ATTACHMENTS ? (
              <button className="taskdrop" onClick={() => inputRef.current?.click()}>
                <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown" multiple hidden onChange={(event) => { addFiles(Array.from(event.target.files ?? [])); event.target.value = '' }} />
                <span>＋</span> Attach PDF, Word or Markdown
              </button>
            ) : !attachmentsEnabled ? <p className="taskfield__hint">The Drive folder is not writable right now. The task itself can still be saved.</p> : null}
          </div>
        </div>
        <footer className="taskmodal__foot">
          <span className="taskmodal__blocker">{blocker}</span>
          <button className="btn btn--ghost" disabled={saving} onClick={onClose}>Cancel</button>
          <button className="btn btn--amber" disabled={!!blocker || saving} onClick={() => void save()}>{saving ? 'Saving…' : task ? 'Save changes' : 'Add task'}</button>
        </footer>
      </section>
    </div>
  )
}

function TaskCardView({ task, readOnly, syncing, onEdit, onMove, onAssign, onDragEnd }: {
  task: TaskCard
  readOnly: boolean
  syncing: boolean
  onEdit: () => void
  onMove: (stage: TaskStage) => void
  onAssign: (assignee: TaskAssignee) => void
  onDragEnd: () => void
}) {
  const index = stageIndex(task.stage)
  const label = taskLabel(task)
  const ticker = taskTickerInput(task)
  return (
    <article className={`taskcard${syncing ? ' is-syncing' : ''}`} aria-busy={syncing} draggable={!readOnly} title={readOnly ? task.title || label : undefined} onDragStart={(event) => { if (readOnly) return; event.dataTransfer.setData('text/task-id', task.task_id); event.dataTransfer.effectAllowed = 'move' }} onDragEnd={onDragEnd}>
      <button className="taskcard__main" disabled={readOnly} onClick={onEdit} aria-label={readOnly ? label : `Edit ${label}`} title={readOnly ? 'Read-only snapshot' : undefined}>
        <div className="taskcard__top">
          <span className={`taskcard__scope taskcard__scope--${task.scope}`}>{task.scope === 'world_event' ? 'World' : task.scope === 'company_event' ? 'Event' : 'Ticker'}</span>
          {ticker && <span className="taskcard__ticker">{ticker}</span>}
          {syncing && <span className="taskcard__sync">Syncing…</span>}
          {task.decision && <span className="taskcard__decision" data-decision={task.decision}>{task.decision}</span>}
        </div>
        <h3>{label}</h3>
        {task.title && task.title !== label ? <p>{task.title}</p> : null}
      </button>
      {!!task.attachments.length && <div className="taskcard__files">{task.attachments.slice(0, 2).map((attachment) => readOnly
        ? <span key={attachment.attachment_id}>⌁ {attachment.filename}</span>
        : <a key={attachment.attachment_id} href={api.taskAttachmentUrl(task.task_id, attachment.attachment_id)} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>⌁ {attachment.filename}</a>)}{task.attachments.length > 2 && <span>+{task.attachments.length - 2}</span>}</div>}
      <div className="taskcard__foot">
        <div className="taskperson" title={personName(task.assignee)}>
          <span>{task.assignee}<i aria-hidden>⌄</i></span>
          <select disabled={readOnly} aria-label={`Assign ${label}`} value={task.assignee} onChange={(event) => onAssign(event.target.value as TaskAssignee)}>
            {PEOPLE.map((person) => <option key={person.id} value={person.id}>{person.id} · {person.name}</option>)}
          </select>
        </div>
        <div className="taskcard__moves">
          <button disabled={readOnly || index === 0} onClick={() => onMove(STAGES[index - 1]?.id)} aria-label="Move back">←</button>
          <button disabled={readOnly || index === STAGES.length - 1} onClick={() => onMove(STAGES[index + 1]?.id)} aria-label="Move forward">→</button>
        </div>
      </div>
    </article>
  )
}

export function TasksStage() {
  const setToast = useStore((state) => state.setToast)
  const staticMode = useStore((state) => state.staticMode)
  const [read, setRead] = useState<TasksRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [person, setPerson] = useState<TaskAssignee | 'all'>('all')
  const [editor, setEditor] = useState<{ task: TaskCard | null; initial?: Partial<TaskInput> } | null>(null)
  const [dragOver, setDragOver] = useState<TaskStage | null>(null)
  const [syncingIds, setSyncingIds] = useState<Set<string>>(() => new Set())
  const readRef = useRef<TasksRead | null>(null)
  const optimisticRef = useRef(new Map<string, TaskCard>())
  const confirmedRef = useRef(new Map<string, TaskCard>())
  const retryPatchRef = useRef(new Map<string, Partial<TaskInput>>())
  const revisionRef = useRef(new Map<string, number>())
  const mutationChainRef = useRef<Promise<void>>(Promise.resolve())

  const load = useCallback(async () => {
    try {
      const next = overlayOptimisticTasks(await api.tasks(), optimisticRef.current)
      setRead(next)
      setError('')
    }
    catch (cause: any) { setError(cause?.message || 'Could not load tasks.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { readRef.current = read }, [read])
  const closeEditor = useCallback(() => setEditor(null), [])
  useEffect(() => { void load() }, [load])

  const tasks = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return (read?.tasks ?? []).filter((task) => (person === 'all' || task.assignee === person) && (!needle || `${taskTickerInput(task)} ${task.subject} ${task.title}`.toLowerCase().includes(needle)))
  }, [read, query, person])

  const showTask = useCallback((task: TaskCard) => {
    setRead((current) => replaceTask(current, task))
  }, [])

  const enqueueMutation = useCallback(<T,>(operation: () => Promise<T>): Promise<T> => {
    const queued = mutationChainRef.current.then(operation)
    mutationChainRef.current = queued.then(() => undefined, () => undefined)
    return queued
  }, [])

  const saveEditorTask = useCallback((task: TaskCard | null, input: TaskInput): Promise<TaskSaveResult> => (
    enqueueMutation(async () => {
      if (!task) return api.taskCreate(input)
      try {
        return await api.taskUpdate(task.task_id, input)
      } catch (cause: any) {
        if (!taskRequestTimedOut(cause)) throw cause
        // A lost response does not prove the update failed. Confirm the complete editor payload against
        // the authoritative task before the modal closes or offers the same save again.
        let serverTask: TaskCard | null = null
        try {
          serverTask = (await api.tasks()).tasks.find((candidate) => candidate.task_id === task.task_id) ?? null
        } catch {
          throw Object.assign(new Error('Could not confirm whether the task saved. Refresh before trying again.'), { retryBlocked: true })
        }
        if (serverTask && taskMatchesPatch(serverTask, input)) {
          return {
            ok: true,
            task: serverTask,
            reconcile_warning: 'The task is saved locally, but the final sync reply was lost.',
          }
        }
        throw new Error('The save timed out and was not confirmed. The latest server version is unchanged; you can retry.')
      }
    })
  ), [enqueueMutation])

  const update = (task: TaskCard, patch: Partial<TaskInput>) => {
    if (staticMode) return
    const taskId = task.task_id
    const visible = optimisticRef.current.get(taskId)
      ?? readRef.current?.tasks.find((candidate) => candidate.task_id === taskId)
      ?? task
    if (!confirmedRef.current.has(taskId)) confirmedRef.current.set(taskId, visible)
    const optimistic = optimisticTask(visible, patch)
    const revision = (revisionRef.current.get(taskId) ?? 0) + 1
    revisionRef.current.set(taskId, revision)
    optimisticRef.current.set(taskId, optimistic)
    showTask(optimistic)
    setSyncingIds((current) => {
      const next = new Set(current)
      next.add(taskId)
      return next
    })

    // Publication is intentionally durable and can take a few seconds. Keep one ordered client queue so
    // rapid moves stay instant without racing the server's shared Tasks/Watchlist mutation lock.
    void enqueueMutation(async () => {
      const queuedPatch = mergeTaskUpdatePatches(retryPatchRef.current.get(taskId), patch)
      try {
        const result = await api.taskUpdate(taskId, queuedPatch)
        retryPatchRef.current.delete(taskId)
        confirmedRef.current.set(taskId, result.task)
        if (revisionRef.current.get(taskId) === revision) {
          optimisticRef.current.delete(taskId)
          showTask(result.task)
          if (result.publish_error) setToast({ msg: `Saved locally, but did not sync: ${result.publish_error}`, tone: 'bad' })
        }
      } catch (cause: any) {
        const isLatest = revisionRef.current.get(taskId) === revision
        if (taskRequestTimedOut(cause)) {
          // The server saves locally before publishing. A lost/slow response therefore has an unknown
          // outcome: read the authoritative task before deciding whether anything should move back.
          let serverTask: TaskCard | null = null
          try {
            serverTask = (await api.tasks()).tasks.find((candidate) => candidate.task_id === taskId) ?? null
          } catch { /* Never turn an unavailable reconciliation read into a guessed rejection. */ }
          if (serverTask && taskMatchesPatch(serverTask, queuedPatch)) {
            retryPatchRef.current.delete(taskId)
            confirmedRef.current.set(taskId, serverTask)
            if (isLatest) {
              optimisticRef.current.delete(taskId)
              showTask(serverTask)
              setToast({ msg: 'Task saved, but the final remote-sync reply was lost.', tone: 'bad' })
            }
          } else if (isLatest) {
            optimisticRef.current.delete(taskId)
            if (serverTask) {
              retryPatchRef.current.delete(taskId)
              confirmedRef.current.set(taskId, serverTask)
              showTask(serverTask)
              setToast({ msg: 'The save timed out. The latest server version is shown.', tone: 'bad' })
            } else {
              // Keep the visible card when even the reconciliation read failed. A later refresh will
              // replace it with server truth; rolling back here would be another unproved guess.
              setToast({ msg: 'Could not confirm whether this task synced. Refresh before changing it again.', tone: 'bad' })
            }
          } else {
            // A newer local edit is already queued. Retry only the fields this failed request owned.
            retryPatchRef.current.set(taskId, queuedPatch)
          }
        } else if (isLatest || !retryableTaskUpdateError(cause)) {
          retryPatchRef.current.delete(taskId)
          if (isLatest) {
            const rollback = confirmedRef.current.get(taskId) ?? task
            optimisticRef.current.delete(taskId)
            showTask(rollback)
            setToast({ msg: `${cause?.message || 'Could not update the task.'} The card was moved back.`, tone: 'bad' })
          }
        } else {
          // The next queued request folds these intentional fields in, without resending stale title,
          // assignee, or other fields this browser never changed.
          retryPatchRef.current.set(taskId, queuedPatch)
        }
      } finally {
        if (revisionRef.current.get(taskId) === revision) {
          confirmedRef.current.delete(taskId)
          revisionRef.current.delete(taskId)
          setSyncingIds((current) => {
            const next = new Set(current)
            next.delete(taskId)
            return next
          })
        }
      }
    })
  }

  const move = (task: TaskCard, stage: TaskStage) => {
    if (!stage || stage === task.stage) return
    void update(task, { stage, decision: stage === 'final_decision' ? task.decision : null })
  }

  const onDrop = (event: React.DragEvent, stage: TaskStage) => {
    event.preventDefault(); setDragOver(null)
    if (staticMode) return
    const id = event.dataTransfer.getData('text/task-id')
    const task = read?.tasks.find((candidate) => candidate.task_id === id)
    if (task) move(task, stage)
  }

  return (
    <div className="tasks">
      <header className="tasks__head">
        <div><div className="tasks__eyebrow">Shared work queue</div><h1>Tasks</h1><p>Track any ticker, idea, event or to-do. Add research details only when they are useful.</p></div>
        <div className="tasks__tools">
          <input className="fld fld--search" placeholder="Search tasks…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search tasks" />
          <div className="taskpeople" role="group" aria-label="Filter by person">
            <button aria-pressed={person === 'all'} className={person === 'all' ? 'is-on' : ''} onClick={() => setPerson('all')}>All</button>
            {PEOPLE.map((item) => <button key={item.id} aria-pressed={person === item.id} className={person === item.id ? 'is-on' : ''} title={item.name} onClick={() => setPerson(item.id)}>{item.id}</button>)}
          </div>
          <button className="btn btn--amber" disabled={staticMode} title={staticMode ? 'Tasks are read-only in this snapshot' : undefined} onClick={() => setEditor({ task: null })}>+ Add task</button>
        </div>
      </header>
      {read?.unreadable.length ? <div className="tasks__notice">{read.unreadable.length} task file{read.unreadable.length === 1 ? '' : 's'} could not be read.</div> : null}
      <div className="taskboard">
        {STAGES.map((stage) => {
          const columnTasks = tasks.filter((task) => task.stage === stage.id)
          return (
            <section key={stage.id} className={`taskcol${dragOver === stage.id ? ' is-over' : ''}`} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDragOver(stage.id) }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOver(null) }} onDrop={(event) => onDrop(event, stage.id)}>
              <header className="taskcol__head"><span>{stage.step}</span><h2>{stage.label}</h2><b>{columnTasks.length}</b></header>
              <div className="taskcol__body">
                {columnTasks.map((task) => <TaskCardView key={task.task_id} task={task} readOnly={staticMode} syncing={syncingIds.has(task.task_id)} onEdit={() => setEditor({ task })} onMove={(next) => move(task, next)} onAssign={(assignee) => update(task, { assignee })} onDragEnd={() => setDragOver(null)} />)}
                {!columnTasks.length && <div className="taskcol__empty">{loading ? 'Loading…' : error || (query || person !== 'all' ? 'No matching tasks' : 'Drop a task here')}</div>}
              </div>
            </section>
          )
        })}
      </div>
      {editor && !staticMode && <TaskEditor key={`${editor.task?.task_id ?? 'new'}-${editor.initial?.stage ?? ''}`} task={editor.task} initial={editor.initial} attachmentsEnabled={read?.attachments_enabled ?? false} onClose={closeEditor} onSaved={load} saveTask={saveEditorTask} />}
    </div>
  )
}
