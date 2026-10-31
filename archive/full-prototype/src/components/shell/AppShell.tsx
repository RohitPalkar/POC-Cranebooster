import * as React from 'react'
import { Outlet, useLocation } from 'react-router'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { TopBar } from './TopBar'
import { SidebarNav, SidebarRail } from './Sidebar'
import { CommandPalette } from './CommandPalette'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Logo } from './Logo'
import { useLayoutMode } from '@/lib/hooks'
import { useStore } from '@/state/store'
import { useT } from '@/state/i18n'
import { cn } from '@/lib/utils'

function Toaster() {
  const { toasts, dismissToast } = useStore()
  const t = useT()
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4">
      {toasts.map((x) => {
        const Icon = x.tone === 'danger' ? CircleAlert : x.tone === 'info' ? Info : CircleCheck
        return (
          <div key={x.id} className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm shadow-lg animate-in">
            <Icon className={cn('size-5 shrink-0', x.tone === 'danger' ? 'text-danger' : x.tone === 'info' ? 'text-info' : 'text-success')} aria-hidden />
            <span className="flex-1 text-foreground">{x.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(x.id)}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-neutral-soft pointer-coarse:size-11"
              aria-label={t('Dismiss')}
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function AppShell() {
  const t = useT()
  const mode = useLayoutMode()
  const { sidebarCollapsed, setSidebarCollapsed } = useStore()
  const [drawer, setDrawer] = React.useState(false)
  const [palette, setPalette] = React.useState(false)
  const mainRef = React.useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const recordBase = pathname.split('/').slice(0, 4).join('/')

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Scroll to top when moving to a different page or record, not between tabs of one record.
  React.useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [recordBase])

  React.useEffect(() => {
    if (mode !== 'mobile') setDrawer(false)
  }, [mode])

  const showFull = mode === 'full' && !sidebarCollapsed
  const showRail = mode === 'rail' || (mode === 'full' && sidebarCollapsed)

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <a
        href="#main"
        className="fixed start-2 top-2 z-[80] -translate-y-24 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background focus:translate-y-0"
      >
        {t('Skip to content')}
      </a>
      <TopBar mode={mode} onMenu={() => (mode === 'mobile' ? setDrawer(true) : setSidebarCollapsed(!sidebarCollapsed))} onSearch={() => setPalette(true)} />
      <div className="flex min-h-0 flex-1">
        {showFull && (
          <aside className="w-68 shrink-0 overflow-y-auto border-e border-border bg-surface">
            <SidebarNav />
          </aside>
        )}
        {showRail && (
          <aside className="w-16 shrink-0 overflow-y-auto border-e border-border bg-surface scrollbar-none">
            <SidebarRail />
          </aside>
        )}
        <main id="main" ref={mainRef} tabIndex={-1} className="relative min-w-0 flex-1 overflow-y-auto focus:outline-none">
          <Outlet context={{ openPalette: () => setPalette(true) }} />
        </main>
      </div>
      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="start" title={<Logo />} description={t('Navigation')} className="w-80">
          <SidebarNav onNavigate={() => setDrawer(false)} />
        </SheetContent>
      </Sheet>
      <CommandPalette open={palette} onOpenChange={setPalette} />
      <Toaster />
    </div>
  )
}
