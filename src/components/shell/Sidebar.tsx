import * as React from 'react'
import { Link, useLocation } from 'react-router'
import { ChevronDown, ChevronRight, GripVertical, PanelLeftClose, PanelLeftOpen, Pin, PinOff, type LucideIcon } from 'lucide-react'
import { groups, itemPath, modulePath, modules, oldCrmItems, type NavModule } from '@/data/nav'
import { Logo } from './Logo'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Segmented } from '@/components/ui/controls'
import { Tooltip } from '@/components/ui/tooltip'
import { useStore } from '@/state/store'
import { Ltr } from '@/state/i18n'
import { cn } from '@/lib/utils'

const rowBase =
  'flex min-w-0 items-center rounded-lg text-sm transition-colors outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring'
const row = `${rowBase} h-9 w-full gap-2.5`
const iconRow = `${rowBase} mx-auto size-10 justify-center`
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
              <Link to={p.path} className={cn(row, 'ps-3 pe-8', on ? current : idle)}>
                <Pin className="size-4 shrink-0 text-muted-foreground group-hover/row:opacity-0 group-focus-within/row:opacity-0" aria-hidden />
                <span className="truncate">{p.label}</span>
              </Link>
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

/** Icon-only destination used by the collapsed rail. The tooltip carries the label. */
function CollapsedLink({ to, label, icon: Icon, active }: { to: string; label: string; icon: LucideIcon; active?: boolean }) {
  return (
    <Tooltip content={label} side="right">
      <Link to={to} aria-label={label} aria-current={active ? 'page' : undefined} className={cn(iconRow, active ? current : idle)}>
        <Icon className="size-5 shrink-0" aria-hidden />
      </Link>
    </Tooltip>
  )
}

/** Icon-only action used by the collapsed rail where there is no route yet. */
function CollapsedAction({ label, icon: Icon, onClick }: { label: string; icon: LucideIcon; onClick: () => void }) {
  return (
    <Tooltip content={label} side="right">
      <button type="button" aria-label={label} onClick={onClick} className={cn(iconRow, idle)}>
        <Icon className="size-5 shrink-0" aria-hidden />
      </button>
    </Tooltip>
  )
}

/** Compact flyout for a parent module while the rail is collapsed. */
function CollapsedMenu({ label, icon: Icon, active, children }: { label: string; icon: LucideIcon; active?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [hover, setHover] = React.useState(false)
  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        // Keep the tooltip and the flyout from showing over each other.
        setHover(false)
      }}
    >
      <Tooltip content={label} side="right" open={hover && !open} onOpenChange={setHover}>
        <PopoverTrigger asChild>
          <button type="button" aria-label={label} className={cn(iconRow, active ? current : idle)}>
            <Icon className="size-5 shrink-0" aria-hidden />
          </button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent side="right" align="start" aria-label={`${label} menu`} className="max-h-[70vh] w-60 overflow-y-auto p-1.5">
        <p className="flex items-center gap-2 px-2.5 py-2 text-sm font-semibold text-foreground">
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{label}</span>
        </p>
        <ul className="flex flex-col gap-0.5">{children}</ul>
      </PopoverContent>
    </Popover>
  )
}

function ModuleRow({ mod, open, onToggle, collapsed }: { mod: NavModule; open: boolean; onToggle: () => void; collapsed: boolean }) {
  const cur = useCurrent()
  const { togglePin, isPinned } = useStore()
  const Icon = mod.icon
  const inside = cur.module === mod.id

  if (collapsed) {
    if (!mod.items.length) return <CollapsedLink to={modulePath(mod.id)} label={mod.label} icon={Icon} active={inside} />
    return (
      <CollapsedMenu label={mod.label} icon={Icon} active={inside}>
        {mod.items.map((it) => {
          const path = itemPath(mod.id, it.id)
          const active = inside && cur.item === it.id
          return (
            <li key={it.id}>
              <PopoverClose asChild>
                <Link to={path} aria-current={active ? 'page' : undefined} className={cn(row, 'px-3', active ? current : idle)}>
                  <span className="truncate">{it.label}</span>
                </Link>
              </PopoverClose>
            </li>
          )
        })}
      </CollapsedMenu>
    )
  }

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

/** One accordion section. The heading disappears in the collapsed icon rail. */
function NavGroup({ label, collapsed, expanded, onToggle, children }: { label: string; collapsed: boolean; expanded: boolean; onToggle: () => void; children: React.ReactNode }) {
  const id = React.useId()
  if (collapsed)
    return (
      <section aria-label={label}>
        <ul className="flex flex-col gap-0.5">{children}</ul>
      </section>
    )
  return (
    <section aria-labelledby={`${id}-heading`}>
      <h2>
        <button
          type="button"
          id={`${id}-heading`}
          aria-expanded={expanded}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className={cn(groupLabel, 'w-full justify-between gap-2 rounded-md text-start transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring')}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className={cn('size-3.5 shrink-0 transition-transform duration-200 ease-in-out', !expanded && '-rotate-90')} aria-hidden />
        </button>
      </h2>
      <div
        id={`${id}-panel`}
        aria-hidden={!expanded}
        inert={!expanded ? true : undefined}
        className={cn('grid transition-[grid-template-rows,opacity] duration-200 ease-in-out', expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}
      >
        <ul className="flex min-h-0 flex-col gap-0.5 overflow-hidden">{children}</ul>
      </div>
    </section>
  )
}

function AfterNav({ collapsed }: { collapsed: boolean }) {
  const cur = useCurrent()
  const [open, setOpen] = React.useState<string | null>(cur.module)
  const [closedGroups, setClosedGroups] = React.useState<string[]>([])

  React.useEffect(() => setOpen(cur.module), [cur.module])

  // Navigating into a closed group reveals it again without touching the other groups.
  React.useEffect(() => {
    const group = modules.find((m) => m.id === cur.module)?.group
    if (!group) return
    setClosedGroups((prev) => (prev.includes(group) ? prev.filter((g) => g !== group) : prev))
  }, [cur.module, cur.pathname])

  const props = (m: NavModule) => ({ mod: m, open: open === m.id, onToggle: () => setOpen(open === m.id ? null : m.id), collapsed })
  const toggleGroup = (g: string) => setClosedGroups((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  return (
    <nav aria-label="Main" className="flex flex-col gap-3">
      {!collapsed && <PinnedSection />}
      <ModuleRow {...props(modules[0])} />
      {groups.map((g) => (
        <NavGroup key={g} label={g} collapsed={collapsed} expanded={!closedGroups.includes(g)} onToggle={() => toggleGroup(g)}>
          {modules
            .filter((m) => m.group === g)
            .map((m) => (
              <li key={m.id}>
                <ModuleRow {...props(m)} />
              </li>
            ))}
        </NavGroup>
      ))}
    </nav>
  )
}

/** The old flat menu, shown only so the client can compare it with the new one. */
function BeforeNav({ collapsed }: { collapsed: boolean }) {
  const { later } = useStore()
  const [open, setOpen] = React.useState(true)

  if (collapsed)
    return (
      <nav aria-label="Old menu">
        <ul className="flex flex-col gap-0.5">
          {modules.map((m) => {
            const crm = m.id === 'crm'
            return (
              <li key={m.id}>
                {crm ? (
                  <CollapsedMenu label={m.label} icon={m.icon}>
                    {oldCrmItems.map((x) => (
                      <li key={x}>
                        <PopoverClose asChild>
                          <button type="button" onClick={later} className={cn(row, 'px-3 text-start', idle)}>
                            <span className="truncate">{x}</span>
                          </button>
                        </PopoverClose>
                      </li>
                    ))}
                  </CollapsedMenu>
                ) : (
                  <CollapsedAction label={m.label} icon={m.icon} onClick={later} />
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    )

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

function Header({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('flex h-14 shrink-0 items-center border-b border-border-subtle', collapsed ? 'justify-center' : 'px-3')}>
      <Link to="/" aria-label="Crane Booster home" className="rounded-md focus-visible:outline-2 focus-visible:outline-ring">
        <Logo compact={collapsed} />
      </Link>
    </div>
  )
}

/** Bottom-anchored control. It sits above the footer divider and never scrolls with the nav. */
function Toggle({ collapsed }: { collapsed: boolean }) {
  const { setSidebarCollapsed } = useStore()
  const label = collapsed ? 'Expand sidebar' : 'Collapse sidebar'
  const button = (
    <button
      type="button"
      aria-label={label}
      aria-expanded={!collapsed}
      aria-controls="app-sidebar"
      aria-keyshortcuts="Control+B Meta+B"
      onClick={() => setSidebarCollapsed(!collapsed)}
      className={cn('text-foreground-secondary hover:bg-neutral-soft hover:text-foreground', collapsed ? cn(iconRow, 'text-muted-foreground') : cn(row, 'px-3'))}
    >
      {collapsed ? <PanelLeftOpen className="size-4 shrink-0" aria-hidden /> : <PanelLeftClose className="size-4 shrink-0" aria-hidden />}
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  )
  return collapsed ? (
    <Tooltip content={label} side="right">
      {button}
    </Tooltip>
  ) : (
    button
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

function Panel({ collapsed }: { collapsed: boolean }) {
  const { navMode } = useStore()
  return (
    <>
      <Header collapsed={collapsed} />
      <div className="min-h-0 flex-1 overflow-y-auto p-2">{navMode === 'after' ? <AfterNav collapsed={collapsed} /> : <BeforeNav collapsed={collapsed} />}</div>
      <div className={cn('shrink-0', collapsed ? 'p-2' : 'px-2 pb-2')}>
        <Toggle collapsed={collapsed} />
      </div>
      {!collapsed && <Footer />}
    </>
  )
}

/** 264 px expanded and 72 px collapsed; the width transition keeps the main pane in step. */
export function Sidebar() {
  const { sidebarCollapsed } = useStore()
  return (
    <aside
      id="app-sidebar"
      aria-label="Sidebar"
      data-collapsed={sidebarCollapsed || undefined}
      className={cn(
        'flex shrink-0 flex-col overflow-hidden border-e border-border bg-surface transition-[width] duration-200 ease-in-out',
        sidebarCollapsed ? 'w-18' : 'w-66',
      )}
    >
      <Panel collapsed={sidebarCollapsed} />
    </aside>
  )
}
