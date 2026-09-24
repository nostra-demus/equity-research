import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useStore } from '../lib/store'
import { ActivityDock } from './ActivityDock'
import { OutputReader } from './OutputReader'
import { ChatPanel } from './ChatPanel'
import './Workspace.css'

type View = 'workspace' | 'report' | 'chat' | 'activity'

/** One owner for panel space. Hidden panes stay mounted so drafts and reading positions survive. */
export function Workspace({ children }: { children: ReactNode }) {
  const output = useStore((s) => s.openOutput)
  const chat = useStore((s) => s.chatOpen)
  const activity = useStore((s) => s.activityOpen)
  const streaming = useStore((s) => s.chatStreaming)
  const view = useStore((s) => s.workspaceView)
  const setView = (workspaceView: View) => useStore.setState({ workspaceView })
  const [width, setWidth] = useState(window.innerWidth)
  const root = useRef<HTMLDivElement>(null)
  const previous = useRef({ output: null as typeof output, chat: false, activity: false })

  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    if (root.current) observer.observe(root.current)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const before = previous.current
    if (chat && !before.chat) setView('chat')
    else if (output && output !== before.output) setView('report')
    else if (activity && !before.activity && !output && !chat) setView('activity')
    previous.current = { output, chat, activity }
  }, [output, chat, activity])

  const available = { workspace: true, report: !!output, chat, activity }
  const selected = available[view] ? view : output ? 'report' : chat ? 'chat' : 'workspace'
  const reading = selected === 'report' || selected === 'chat'
  const split = reading && !!output && chat && width >= 1040
  // The stage needs a full canvas for its document rail and constellation, not a decorative sliver.
  const stage = !reading ? (selected === 'workspace' || width >= 1400) : width >= (split ? 2400 : 1720)
  const visible = {
    workspace: stage,
    report: reading && !!output && (selected === 'report' || split),
    chat: reading && chat && (selected === 'chat' || split),
    activity: !reading && activity && (selected === 'activity' || width >= 1400),
  }
  useLayoutEffect(() => {
    // A composer may have been mounted while its compact pane was hidden.
    if (visible.chat && selected === 'chat') {
      root.current?.querySelector<HTMLTextAreaElement>('[data-ask-composer="true"]:not(:disabled)')?.focus()
    }
  }, [visible.chat, selected])

  const panels = !!output || chat || activity
  const labels: Record<View, string> = { workspace: 'Workspace', report: 'Report', chat: 'Chat', activity: 'Activity' }

  return (
    <div ref={root} className={`workspace${reading ? ' workspace--reading' : ''}`}>
      {panels && <nav className="workspace__nav" aria-label="Workspace panels">
        {(Object.keys(labels) as View[]).filter((key) => available[key]).map((key) => (
          <button key={key} type="button" className="workspace__tab" aria-pressed={selected === key}
            aria-controls={`workspace-${key}`} onClick={() => setView(key)}>
            {labels[key]}{key === 'chat' && streaming && <span className="workspace__live" aria-label="Answer in progress" />}
          </button>
        ))}
        <span className="workspace__hint">{split ? 'Report & conversation' : reading ? 'Focused view' : 'Research workspace'}</span>
      </nav>}
      <div className={`main workspace__panes${stage ? ' workspace__panes--stage' : ''}`}>
        <div id="workspace-workspace" className="workspace__stage" hidden={!visible.workspace}>{children}</div>
        <div id="workspace-report" className="workspace__report" hidden={!visible.report}>
          {output && <OutputReader key={output.path || output.nodeKey || 'panel'} output={output} />}
        </div>
        <div id="workspace-chat" className="workspace__chat" hidden={!visible.chat}>{chat && <ChatPanel visible={visible.chat} />}</div>
        <div id="workspace-activity" className="workspace__activity" hidden={!visible.activity}><ActivityDock /></div>
      </div>
    </div>
  )
}
