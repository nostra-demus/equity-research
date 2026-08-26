import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../lib/api'
import { useStore } from '../../lib/store'
import type { TaskAssignee, TaskCard, TaskDecision, TaskInput, TaskScope, TaskStage, TasksRead } from '../../lib/types'

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

const emptyDraft = (): TaskInput => ({
  scope: 'ticker', ticker: '', subject: '', title: '', stage: 'idea_generation', decision: null, assignee: 'CK',
})

function personName(id: TaskAssignee): string { return PEOPLE.find((person) => person.id === id)?.name ?? id }
function stageIndex(stage: TaskStage): number { return STAGES.findIndex((item) => item.id === stage) }

function TaskEditor({ task, initial, attachmentsEnabled, onClose, onSaved }: {
  task: TaskCard | null
  initial?: Partial<TaskInput>
  attachmentsEnabled: boolean
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const tickers = useStore((state) => state.tickers)
  const setToast = useStore((state) => state.setToast)
  const [draft, setDraft] = useState<TaskInput>({ ...emptyDraft(), ...(task ? {
    scope: task.scope, ticker: task.ticker, subject: task.subject, title: task.title, stage: task.stage,
    decision: task.decision, assignee: task.assignee,
  } : {}), ...(initial ?? {}) })
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !saving) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, saving])

  const tickerNeeded = draft.scope !== 'world_event' && draft.stage !== 'idea_generation'
  const blocker = !draft.subject.trim() ? 'Name the ticker or event.'
    : !draft.title.trim() ? 'Write the task.'
      : tickerNeeded && !draft.ticker?.trim() ? 'Add the ticker before this stage.'
        : draft.stage === 'final_decision' && !draft.decision ? 'Choose Deploy, Reject or Watch.'
          : null

  const save = async () => {
    if (blocker || saving) return
    setSaving(true)
    try {
      const input: TaskInput = {
        ...draft,
        ticker: draft.ticker?.trim().toUpperCase() || null,
        subject: draft.subject.trim(),
        title: draft.title.trim(),
        decision: draft.stage === 'final_decision' ? draft.decision : null,
      }
      const result = task ? await api.taskUpdate(task.task_id, input) : await api.taskCreate(input)
      let warning = result.publish_error ? `Saved locally, but did not sync: ${result.publish_error}` : ''
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
      setToast({ msg: error?.message || 'Could not save the task.', tone: 'bad' })
    } finally { setSaving(false) }
  }

  const addFiles = (next: File[]) => {
    const accepted = next.filter((file) => /\.(pdf|doc|docx|md)$/i.test(file.name))
    setFiles((current) => [...current, ...accepted].slice(0, Math.max(0, 5 - (task?.attachments.length ?? 0))))
  }

  const detach = async (attachmentId: string) => {
    if (!task) return
    try { await api.taskDetach(task.task_id, attachmentId); await onSaved() }
    catch { setToast({ msg: 'Could not remove that file.', tone: 'bad' }) }
  }

  return (
    <div className="taskmodal__backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose() }}>
      <section className="taskmodal" role="dialog" aria-modal="true" aria-label={task ? 'Edit task' : 'Add task'}>
        <header className="taskmodal__head">
          <div><span className="taskmodal__eyebrow">Tasks</span><h2>{task ? 'Edit task' : 'New task'}</h2></div>
          <button className="iconbtn" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="taskmodal__body">
          <div className="taskfield">
            <label>What are you working on?</label>
            <div className="seg" role="group" aria-label="Task scope">
              {([['ticker', 'Ticker'], ['company_event', 'Company event'], ['world_event', 'World event']] as [TaskScope, string][]).map(([id, label]) => (
                <button key={id} className={`seg__btn${draft.scope === id ? ' seg__btn--on' : ''}`} onClick={() => setDraft({ ...draft, scope: id, ticker: id === 'world_event' ? null : draft.ticker })}>{label}</button>
              ))}
            </div>
          </div>
          <div className="taskmodal__identity">
            {draft.scope !== 'world_event' && (
              <div className="taskfield taskfield--ticker">
                <label htmlFor="task-ticker">Ticker {tickerNeeded ? <b>*</b> : <span>optional at this stage</span>}</label>
                <input id="task-ticker" className="fld" list="task-ticker-list" value={draft.ticker ?? ''} onChange={(event) => setDraft({ ...draft, ticker: event.target.value.toUpperCase() })} placeholder="e.g. AMZN" />
                <datalist id="task-ticker-list">{tickers.map((ticker) => <option key={ticker.ticker} value={ticker.ticker} />)}</datalist>
              </div>
            )}
            <div className="taskfield">
              <label htmlFor="task-subject">{draft.scope === 'ticker' ? 'Company / idea' : 'Event'} <b>*</b></label>
              <input id="task-subject" className="fld" autoFocus value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} placeholder={draft.scope === 'world_event' ? 'e.g. India rate decision' : draft.scope === 'company_event' ? 'e.g. Q3 results on 29 October' : 'e.g. Cloud margin inflection'} />
            </div>
          </div>
          <div className="taskfield">
            <label htmlFor="task-copy">Task <b>*</b></label>
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
              <label>Final decision <b>*</b></label>
              <div className="taskdecision" role="group" aria-label="Final decision">
                {DECISIONS.map((decision) => <button key={decision.id} data-decision={decision.id} className={draft.decision === decision.id ? 'is-on' : ''} onClick={() => setDraft({ ...draft, decision: decision.id })}>{decision.label}</button>)}
              </div>
              {draft.decision === 'watch' && <p className="taskfield__hint">Watch syncs this ticker and its person to the Watchlist. Assignment changes there flow back here.</p>}
            </div>
          )}
          <div className="taskfield">
            <label>Attachments <span>{(task?.attachments.length ?? 0) + files.length}/5</span></label>
            {task?.attachments.map((attachment) => (
              <div className="taskfile" key={attachment.attachment_id}>
                <a href={api.taskAttachmentUrl(task.task_id, attachment.attachment_id)} target="_blank" rel="noreferrer">{attachment.filename}</a>
                <span>{Math.max(1, Math.round(attachment.bytes / 1024))} KB</span>
                <button onClick={() => void detach(attachment.attachment_id)} aria-label={`Remove ${attachment.filename}`}>✕</button>
              </div>
            ))}
            {files.map((file, index) => <div className="taskfile" key={`${file.name}-${index}`}><span>{file.name}</span><span>{Math.max(1, Math.round(file.size / 1024))} KB</span><button onClick={() => setFiles(files.filter((_, i) => i !== index))}>✕</button></div>)}
            {attachmentsEnabled && (task?.attachments.length ?? 0) + files.length < 5 ? (
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

function TaskCardView({ task, onEdit, onMove, onAssign }: {
  task: TaskCard
  onEdit: () => void
  onMove: (stage: TaskStage) => void
  onAssign: (assignee: TaskAssignee) => void
}) {
  const index = stageIndex(task.stage)
  return (
    <article className="taskcard" draggable onDragStart={(event) => { event.dataTransfer.setData('text/task-id', task.task_id); event.dataTransfer.effectAllowed = 'move' }}>
      <button className="taskcard__main" onClick={onEdit} aria-label={`Edit ${task.subject}`}>
        <div className="taskcard__top">
          <span className={`taskcard__scope taskcard__scope--${task.scope}`}>{task.scope === 'world_event' ? 'World' : task.scope === 'company_event' ? 'Event' : 'Ticker'}</span>
          {task.ticker && <span className="taskcard__ticker">{task.ticker}</span>}
          {task.decision && <span className="taskcard__decision" data-decision={task.decision}>{task.decision}</span>}
        </div>
        <h3>{task.subject}</h3>
        <p>{task.title}</p>
      </button>
      {!!task.attachments.length && <div className="taskcard__files">{task.attachments.slice(0, 2).map((attachment) => <a key={attachment.attachment_id} href={api.taskAttachmentUrl(task.task_id, attachment.attachment_id)} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>⌁ {attachment.filename}</a>)}{task.attachments.length > 2 && <span>+{task.attachments.length - 2}</span>}</div>}
      <div className="taskcard__foot">
        <div className="taskperson" title={personName(task.assignee)}>
          <span>{task.assignee}</span>
          <select aria-label={`Assign ${task.subject}`} value={task.assignee} onChange={(event) => onAssign(event.target.value as TaskAssignee)}>
            {PEOPLE.map((person) => <option key={person.id} value={person.id}>{person.id} · {person.name}</option>)}
          </select>
        </div>
        <div className="taskcard__moves">
          <button disabled={index === 0} onClick={() => onMove(STAGES[index - 1]?.id)} aria-label="Move back">←</button>
          <button disabled={index === STAGES.length - 1} onClick={() => onMove(STAGES[index + 1]?.id)} aria-label="Move forward">→</button>
        </div>
      </div>
    </article>
  )
}

export function TasksStage() {
  const setToast = useStore((state) => state.setToast)
  const [read, setRead] = useState<TasksRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [person, setPerson] = useState<TaskAssignee | 'all'>('all')
  const [editor, setEditor] = useState<{ task: TaskCard | null; initial?: Partial<TaskInput> } | null>(null)
  const [dragOver, setDragOver] = useState<TaskStage | null>(null)

  const load = async () => {
    try { setRead(await api.tasks()); setError('') }
    catch (cause: any) { setError(cause?.message || 'Could not load tasks.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  const tasks = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return (read?.tasks ?? []).filter((task) => (person === 'all' || task.assignee === person) && (!needle || `${task.ticker ?? ''} ${task.subject} ${task.title}`.toLowerCase().includes(needle)))
  }, [read, query, person])

  const update = async (task: TaskCard, patch: Partial<TaskInput>) => {
    try {
      const result = await api.taskUpdate(task.task_id, patch)
      if (result.publish_error) setToast({ msg: `Saved locally, but did not sync: ${result.publish_error}`, tone: 'bad' })
      await load()
    } catch (cause: any) { setToast({ msg: cause?.message || 'Could not update the task.', tone: 'bad' }) }
  }

  const move = (task: TaskCard, stage: TaskStage) => {
    if (!stage || stage === task.stage) return
    if (stage === 'final_decision' && !task.decision) { setEditor({ task, initial: { stage } }); return }
    void update(task, { stage, decision: stage === 'final_decision' ? task.decision : null })
  }

  const onDrop = (event: React.DragEvent, stage: TaskStage) => {
    event.preventDefault(); setDragOver(null)
    const id = event.dataTransfer.getData('text/task-id')
    const task = read?.tasks.find((candidate) => candidate.task_id === id)
    if (task) move(task, stage)
  }

  return (
    <div className="tasks">
      <header className="tasks__head">
        <div><div className="tasks__eyebrow">Shared research queue</div><h1>Tasks</h1><p>Move an idea through research, then choose Deploy, Reject or Watch.</p></div>
        <div className="tasks__tools">
          <input className="fld fld--search" placeholder="Search tasks…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search tasks" />
          <div className="taskpeople" role="group" aria-label="Filter by person">
            <button className={person === 'all' ? 'is-on' : ''} onClick={() => setPerson('all')}>All</button>
            {PEOPLE.map((item) => <button key={item.id} className={person === item.id ? 'is-on' : ''} title={item.name} onClick={() => setPerson(item.id)}>{item.id}</button>)}
          </div>
          <button className="btn btn--amber" onClick={() => setEditor({ task: null })}>+ Add task</button>
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
                {columnTasks.map((task) => <TaskCardView key={task.task_id} task={task} onEdit={() => setEditor({ task })} onMove={(next) => move(task, next)} onAssign={(assignee) => void update(task, { assignee })} />)}
                {!columnTasks.length && <div className="taskcol__empty">{loading ? 'Loading…' : error || (query || person !== 'all' ? 'No matching tasks' : 'Drop a task here')}</div>}
              </div>
            </section>
          )
        })}
      </div>
      {editor && <TaskEditor key={`${editor.task?.task_id ?? 'new'}-${editor.initial?.stage ?? ''}`} task={editor.task} initial={editor.initial} attachmentsEnabled={read?.attachments_enabled ?? false} onClose={() => setEditor(null)} onSaved={load} />}
    </div>
  )
}
