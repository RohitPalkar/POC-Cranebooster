import * as React from 'react'
import { Link, useLocation } from 'react-router'
import { ChevronDown, ChevronRight, CircleDot, Construction, GripVertical, PanelLeftClose, PanelLeftOpen, Pin, PinOff } from 'lucide-react'
import { groups, itemPath, modulePath, modules, oldCrmItems, type NavModule } from '@/data/nav'
import { Logo } from './Logo'
import { Segmented } from '@/components/ui/controls'
import { Tooltip } from '@/components/ui/tooltip'
import { useStore } from '@/state/store'
import { Ltr } from '@/state/i18n'
import { cn } from '@/lib/utils'

const row =
  'flex h-9 w-full min-w-0 items-center gap-2.5 rounded-lg text-sm transition-colors outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring'
const groupLabel = 'flex h-8 items-center px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase'
const idle = 'text-foreground-secondary hover:bg-neutral-soft hover:text-foreground'
const current = 'bg-brand-soft font-medium text-brand-text'

function useCurrent() {
  const { pathname } = useLocation()
  const [m, i] = pathname.split('/').filter(Boolean)
  return { module: m ?? 'dashboard', item: i, pathname }
}

function PinnedSection() {
  const { pins, setPins, togglePin } = useStore()
  const { pathname } = useLocation()
  const drag = React.useRef<number | null>(null)
  if (!pins.length) return null
  const move = (to: number) => {
    const from = drag.current
    if (from === null || from === to) return
    const next = [...pins]
    next.splice(to, 0, next.splice(from, 1)[0])
    drag.current = to
    setPins(next)
  }
  return (
    <section aria-label="Pinned">
      <p className={groupLabel}>Pinned</p>
      <ul className="flex flex-col gap-0.5">
        {pins.map((p, i) => {
          const matches = (x: string) => pathname === x || pathname.startsWith(`${x}/`)
          const best = Math.max(...pins.filter((x) => matches(x.path)).map((x) => x.path.length))
          const on = matches(p.path) && p.path.length === best
          return (
            <li key={p.path} className="group/row relative" draggable onDragStart={() => (drag.current = i)} onDragEnter={() => move(i)} onDragOver={(e) => e.preventDefault()} onDragEnd={() => (drag.current = null)}>
              <Tooltip content={p.label} side="right">
                <Link to={p.path} className={cn(row, 'ps-3 pe-8', on ? current : idle)}>
                  <Pin className="size-4 shrink-0 text-muted-foreground group-hover/row:opacity-0 group-focus-within/row:opacity-0" aria-hidden />
                  <span className="truncate">{p.label}</span>
                </Link>
              </Tooltip>
              <GripVertical className="pointer-events-none absolute start-3 top-2.5 size-4 cursor-grab text-muted-foreground opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100" aria-hidden />
              <button
                type="button"
                aria-label={`Unpin ${p.label}`}
                onClick={() => togglePin(p)}
                className="absolute end-1 top-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 hover:bg-surface hover:text-foreground focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring group-hover/row:opacity-100"
              >
                <PinOff className="size-3.5" aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function ModuleRow({ mod, open, onToggle }: { mod: NavModule; open: boolean; onToggle: () => void }) {
  const cur = useCurrent()
  const { togglePin, isPinned } = useStore()
  const Icon = mod.icon
  const inside = cur.module === mod.id
  if (!mod.items.length)
    return (
      <Link to={modulePath(mod.id)} aria-current={inside ? 'page' : undefined} className={cn(row, 'px-3', inside ? current : idle)}>
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{mod.label}</span>
      </Link>
    )
  return (
    <>
      <button type="button" onClick={onToggle} aria-expanded={open} className={cn(row, 'px-3 text-start', inside ? 'font-medium text-foreground hover:bg-neutral-soft' : idle)}>
        <Icon className={cn('size-4 shrink-0', inside && 'text-brand-text')} aria-hidden />
        <span className="flex-1 truncate">{mod.label}</span>
        {open ? <ChevronDown className="size-4 shrink-0" aria-hidden /> : <ChevronRight className="size-4 shrink-0" aria-hidden />}
      </button>
      {open && (
        <ul className="mt-0.5 flex flex-col gap-0.5">
          {mod.items.map((it) => {
            const path = itemPath(mod.id, it.id)
            const active = inside && cur.item === it.id
            const pinned = isPinned(path)
            return (
              <li key={it.id} className="group/row relative">
                <Link to={path} aria-current={active ? 'page' : undefined} className={cn(row, 'ps-9 pe-8', active ? current : idle)}>
                  <span className="truncate">{it.label}</span>
                </Link>
                <button
                  type="button"
                  aria-label={`${pinned ? 'Unpin' : 'Pin'} ${it.label}`}
                  aria-pressed={pinned}
                  onClick={() => togglePin({ path, label: it.label })}
                  className="absolute end-1 top-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 hover:bg-surface hover:text-foreground focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring group-hover/row:opacity-100"
                >
                  {pinned ? <PinOff className="size-3.5" aria-hidden /> : <Pin className="size-3.5" aria-hidden />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

function AfterNav() {
  const cur = useCurrent()
  const [open, setOpen] = React.useState<string | null>(cur.module)
  React.useEffect(() => setOpen(cur.module), [cur.module])
  const props = (m: NavModule) => ({ mod: m, open: open === m.id, onToggle: () => setOpen(open === m.id ? null : m.id) })
  return (
    <nav aria-label="Main" className="flex flex-col gap-3">
      <PinnedSection />
      <ModuleRow {...props(modules[0])} />
      {groups.map((g) => (
        <section key={g} aria-label={g}>
          <p className={groupLabel}>{g}</p>
          <ul className="flex flex-col gap-0.5">
            {modules
              .filter((m) => m.group === g)
              .map((m) => (
                <li key={m.id}>
                  <ModuleRow {...props(m)} />
                </li>
              ))}
          </ul>
        </section>
      ))}
    </nav>
  )
}

/** The old flat menu, shown only so the client can compare it with the new one. */
function BeforeNav() {
  const { later } = useStore()
  const [open, setOpen] = React.useState(true)
  return (
    <nav aria-label="Old menu">
      <ul className="flex flex-col gap-0.5">
        {modules.map((m) => {
          const Icon = m.icon
          const crm = m.id === 'crm'
          return (
            <li key={m.id}>
              <button type="button" onClick={() => (crm ? setOpen(!open) : later())} aria-expanded={crm ? open : undefined} className={cn(row, 'px-3 text-start', idle)}>
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="flex-1 truncate">{m.label}</span>
                {!crm && m.old > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-soft px-1.5 text-xs font-semibold text-foreground-secondary tabular">{m.old}</span>
                )}
                {crm && <ChevronDown className="size-4 shrink-0" aria-hidden />}
              </button>
              {crm && open && (
                <ul className="mt-0.5 flex flex-col gap-0.5">
                  {oldCrmItems.map((x) => (
                    <li key={x}>
                      <button type="button" onClick={later} className={cn(row, 'ps-9 pe-3 text-start', idle)}>
                        <span className="truncate">{x}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function Header({ overlay }: { overlay?: boolean }) {
  const { sidebarPinned, setSidebarPinned } = useStore()
  const label = sidebarPinned ? 'Collapse sidebar' : 'Keep sidebar open'
  return (
    <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border-subtle px-3">
      <Link to="/" aria-label="Crane Booster home" className="rounded-md focus-visible:outline-2 focus-visible:outline-ring">
        <Logo />
      </Link>
      <Tooltip content={`${label} (Ctrl/Cmd+B)`} side="right">
        <button
          type="button"
          aria-label={label}
          aria-pressed={sidebarPinned}
          data-overlay={overlay || undefined}
          onClick={() => setSidebarPinned(!sidebarPinned)}
          className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-neutral-soft hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          {sidebarPinned ? <PanelLeftClose className="size-4" aria-hidden /> : <PanelLeftOpen className="size-4" aria-hidden />}
        </button>
      </Tooltip>
    </div>
  )
}

function Footer() {
  const { navMode, setNavMode } = useStore()
  return (
    <div className="shrink-0 border-t border-border-subtle p-3">
      <div className="flex items-center justify-between gap-2">
        <Segmented
          size="sm"
          label="Demo: compare navigation"
          value={navMode}
          onValueChange={setNavMode}
          options={[
            { value: 'before', label: 'Before' },
            { value: 'after', label: 'After' },
          ]}
        />
        <span className="text-xs font-medium text-muted-foreground tabular">
          <Ltr>{navMode === 'after' ? '62' : '231'}</Ltr> items
        </span>
      </div>
    </div>
  )
}

function Panel({ overlay }: { overlay?: boolean }) {
  const { navMode } = useStore()
  return (
    <>
      <Header overlay={overlay} />
      <div className="min-h-0 flex-1 overflow-y-auto p-2">{navMode === 'after' ? <AfterNav /> : <BeforeNav />}</div>
      <Footer />
    </>
  )
}

/** 264 px and pushing the content when pinned; a 64 px rail that opens over the content when collapsed. */
export function Sidebar() {
  const { sidebarPinned, navMode } = useStore()
  const { pathname } = useLocation()
  const [hover, setHover] = React.useState(false)
  const timer = React.useRef<number>(undefined)
  const schedule = (v: boolean, ms: number) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setHover(v), ms)
  }
  React.useEffect(() => setHover(false), [pathname, sidebarPinned])

  if (sidebarPinned)
    return (
      <aside aria-label="Sidebar" className="flex w-66 shrink-0 flex-col border-e border-border bg-surface">
        <Panel />
      </aside>
    )

  const rail = navMode === 'after' ? modules : []
  return (
    <div className="relative w-16 shrink-0" onPointerEnter={() => schedule(true, 150)} onPointerLeave={() => schedule(false, 300)} onFocusCapture={() => schedule(true, 0)} onKeyDown={(e) => e.key === 'Escape' && setHover(false)}>
      <aside aria-label="Sidebar" className="flex h-full flex-col items-center gap-1 overflow-hidden border-e border-border bg-surface py-3">
        <button type="button" aria-label="Open sidebar" onClick={() => setHover(true)} className="mb-2 inline-flex size-10 items-center justify-center rounded-lg text-brand-text focus-visible:outline-2 focus-visible:outline-ring">
          <Construction className="size-5" aria-hidden />
        </button>
        {rail.map((m) => (
          <span key={m.id} className="inline-flex size-9 shrink-0 items-center justify-center text-muted-foreground" aria-hidden>
            <m.icon className="size-5" />
          </span>
        ))}
        {!rail.length && <CircleDot className="size-5 text-muted-foreground" aria-hidden />}
      </aside>
      {hover && (
        <div className="absolute inset-y-0 start-0 z-40 flex w-66 flex-col border-e border-border bg-surface shadow-lg animate-in">
          <Panel overlay />
        </div>
      )}
    </div>
  )
}
