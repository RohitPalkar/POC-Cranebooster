import * as React from 'react'
import { Outlet, useLocation } from 'react-router'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { CommandPalette } from './CommandPalette'
import { useStore } from '@/state/store'
import { cn } from '@/lib/utils'

function Toaster() {
  const { toasts, dismissToast } = useStore()
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4">
      {toasts.map((x) => {
        const Icon = x.tone === 'danger' ? CircleAlert : x.tone === 'info' ? Info : CircleCheck
        return (
          <div key={x.id} className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm shadow-lg animate-in">
            <Icon className={cn('size-5 shrink-0', x.tone === 'danger' ? 'text-danger' : x.tone === 'info' ? 'text-info' : 'text-success')} aria-hidden />
            <span className="flex-1 text-foreground">{x.message}</span>
            <button type="button" onClick={() => dismissToast(x.id)} className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-neutral-soft" aria-label="Dismiss">
              <X className="size-4" aria-hidden />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function AppShell() {
  const { sidebarCollapsed, setSidebarCollapsed } = useStore()
  const [palette, setPalette] = React.useState(false)
  const mainRef = React.useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const recordBase = pathname.split('/').slice(0, 4).join('/')

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      const k = e.key.toLowerCase()
      if (k === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      }
      if (k === 'b') {
        e.preventDefault()
        setSidebarCollapsed(!sidebarCollapsed)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sidebarCollapsed, setSidebarCollapsed])

  // Scroll to top when moving to a different page or record, not between tabs of one record.
  React.useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [recordBase])

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onSearch={() => setPalette(true)} />
        <main id="main" ref={mainRef} tabIndex={-1} className="relative min-h-0 flex-1 overflow-y-auto focus:outline-none">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={palette} onOpenChange={setPalette} />
      <Toaster />
    </div>
  )
}
