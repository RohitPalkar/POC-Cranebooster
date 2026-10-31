import * as React from 'react'
import { Link, useLocation } from 'react-router'
import { ChevronDown, History, Pin, PinOff } from 'lucide-react'
import { groups, modules, modulePath, itemPath, type NavModule, type NavItem } from '@/data/nav'
import { useStore } from '@/state/store'
import { Ltr, useLang, useT } from '@/state/i18n'
import { cn } from '@/lib/utils'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { Tooltip } from '@/components/ui/tooltip'

function useCurrent() {
  const { pathname } = useLocation()
  const [m, i] = pathname.split('/').filter(Boolean)
  return { module: m ?? 'dashboard', item: i, pathname }
}

const rowBase =
  'flex w-full min-w-0 items-center gap-2.5 rounded-lg text-sm transition-colors outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring pointer-coarse:min-h-11'

function NavBadgeChip({ item }: { item: NavItem }) {
  const t = useT()
  const { approvals, woStage } = useStore()
  if (!item.badge) return null
  // Queues the demo path works through count down as they are cleared.
  const cleared = (item.id === 'quotations' && approvals['APR-QT-2231'] !== 'pending') || (item.id === 'todays-jobs' && (woStage === 'ready' || woStage === 'dispatched')) ? 1 : 0
  const tone = item.badge.tone ?? 'brand'
  return (
    <span
      className={cn(
        'ms-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular',
        tone === 'danger' && 'bg-danger-soft text-danger',
        tone === 'warning' && 'bg-warning-soft text-warning',
        (tone === 'brand' || tone === 'neutral' || tone === 'info' || tone === 'success') && 'bg-brand-soft text-brand-text',
      )}
    >
      <Ltr>{item.badge.count - cleared}</Ltr>
      <span className="sr-only">
        {' '}
        {t(item.badge.label)}
      </span>
    </span>
  )
}

function PinButton({ path, label, sub, className }: { path: string; label: string; sub?: string; className?: string }) {
  const { togglePin, isPinned, pins } = useStore()
  const t = useT()
  const pinned = isPinned(path)
  const full = !pinned && pins.length >= 5
  const a11y = pinned ? `${t('Unpin')} ${t(label)}` : full ? `${t('Pinned is full (5 of 5). Unpin an item first.')}` : `${t('Pin')} ${t(label)}`
  return (
    <Tooltip content={a11y}>
      <button
        type="button"
        aria-pressed={pinned}
        aria-label={a11y}
        aria-disabled={full || undefined}
        onClick={() => !full && togglePin({ path, label, sub })}
        className={cn(
          'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-surface hover:text-foreground focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring group-hover/row:opacity-100 group-focus-within/row:opacity-100 pointer-coarse:size-11 pointer-coarse:opacity-100',
          pinned && 'text-brand-text',
          full && 'cursor-not-allowed',
          className,
        )}
      >
        {pinned ? <PinOff className="size-3.5" aria-hidden /> : <Pin className="size-3.5" aria-hidden />}
      </button>
    </Tooltip>
  )
}

function SubItems({ mod, current, onNavigate, id }: { mod: NavModule; current: ReturnType<typeof useCurrent>; onNavigate?: () => void; id?: string }) {
  const t = useT()
  return (
    <ul id={id} className="mt-0.5 flex flex-col gap-0.5">
      {mod.items.map((it) => {
        const path = itemPath(mod.id, it.id)
        const active = current.module === mod.id && current.item === it.id
        return (
          <li key={it.id} className="group/row relative flex items-center">
            <Link
              to={path}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                rowBase,
                'h-9 ps-10 pe-9',
                active ? 'bg-brand-soft font-medium text-brand-text' : 'text-foreground-secondary hover:bg-neutral-soft hover:text-foreground',
              )}
            >
              {active && <span className="absolute inset-y-2 start-5 w-0.5 rounded-full bg-brand" aria-hidden />}
              <span className="truncate">{t(it.label)}</span>
              <NavBadgeChip item={it} />
            </Link>
            <PinButton path={path} label={it.label} sub={mod.label} className="absolute end-1" />
          </li>
        )
      })}
    </ul>
  )
}

function GroupHeader({ label, open, onToggle, controls }: { label: string; open: boolean; onToggle: () => void; controls: string }) {
  const t = useT()
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      className="mt-3 flex h-8 w-full items-center gap-1 rounded-md px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:min-h-11"
    >
      <span className="truncate">{t(label)}</span>
      <ChevronDown className={cn('ms-auto size-3.5 transition-transform', !open && '-rotate-90 rtl:rotate-90')} aria-hidden />
    </button>
  )
}

/** Full sidebar navigation, used at >= 1280 px and inside the mobile drawer. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const t = useT()
  const current = useCurrent()
  const { pins, recents, togglePin } = useStore()
  const [expanded, setExpanded] = React.useState<string | null>(current.module)
  const [closed, setClosed] = React.useState<Record<string, boolean>>({})
  React.useEffect(() => setExpanded(current.module), [current.module])
  const toggleGroup = (g: string) => setClosed((p) => ({ ...p, [g]: !p[g] }))

  const renderModule = (mod: NavModule) => {
    const Icon = mod.icon
    const isOpen = expanded === mod.id
    const isCurrentModule = current.module === mod.id
    const onOverview = isCurrentModule && !current.item
    const listId = `nav-${mod.id}`
    const needsAction = mod.items.some((i) => i.badge)
    return (
      <li key={mod.id} className="relative">
        <div className="relative flex items-center">
          <Link
            to={modulePath(mod.id)}
            onClick={() => {
              setExpanded(mod.id)
              onNavigate?.()
            }}
            aria-current={onOverview ? 'page' : undefined}
            className={cn(
              rowBase,
              'h-9 px-3',
              mod.items.length && 'pe-10',
              onOverview
                ? 'bg-brand-soft font-semibold text-brand-text'
                : isCurrentModule
                  ? 'font-semibold text-foreground hover:bg-neutral-soft'
                  : 'font-medium text-foreground-secondary hover:bg-neutral-soft hover:text-foreground',
            )}
          >
            <Icon className={cn('size-4.5 shrink-0', isCurrentModule ? 'text-brand-text' : 'text-muted-foreground')} aria-hidden />
            <span className="truncate">{t(mod.label)}</span>
            {!isOpen && needsAction && (
              <span className="ms-auto size-1.5 shrink-0 rounded-full bg-brand" aria-hidden title={t('Has items needing action')} />
            )}
          </Link>
          {mod.items.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : mod.id)}
              aria-expanded={isOpen}
              aria-controls={listId}
              aria-label={`${isOpen ? t('Collapse') : t('Expand')} ${t(mod.label)}`}
              className="absolute end-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:size-11"
            >
              <ChevronDown className={cn('size-4 transition-transform', !isOpen && '-rotate-90 rtl:rotate-90')} aria-hidden />
            </button>
          )}
        </div>
        {isOpen && mod.items.length > 0 && <SubItems mod={mod} current={current} onNavigate={onNavigate} id={listId} />}
      </li>
    )
  }

  const dashboard = modules[0]
  const settings = modules[modules.length - 1]

  return (
    <nav aria-label={t('Main')} className="flex flex-col px-2 pb-6">
      <GroupHeader label="Pinned" open={!closed.pinned} onToggle={() => toggleGroup('pinned')} controls="nav-pinned" />
      {!closed.pinned && (
        <ul id="nav-pinned" className="flex flex-col gap-0.5">
          {pins.length === 0 && <li className="px-3 py-1.5 text-xs text-muted-foreground">{t('Pin up to 5 pages with the pin icon.')}</li>}
          {pins.map((p) => (
            <li key={p.path} className="group/row relative flex items-center">
              <Link
                to={p.path}
                onClick={onNavigate}
                aria-current={current.pathname === p.path ? 'page' : undefined}
                className={cn(rowBase, 'h-9 px-3 pe-9 text-foreground-secondary hover:bg-neutral-soft hover:text-foreground', current.pathname === p.path && 'bg-brand-soft text-brand-text')}
              >
                <Pin className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="truncate">{t(p.label)}</span>
                {p.sub && <span className="truncate text-xs text-muted-foreground">{t(p.sub)}</span>}
              </Link>
              <button
                type="button"
                onClick={() => togglePin(p)}
                aria-label={`${t('Unpin')} ${t(p.label)}`}
                className="absolute end-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 hover:bg-surface hover:text-foreground focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring group-hover/row:opacity-100 group-focus-within/row:opacity-100 pointer-coarse:size-11 pointer-coarse:opacity-100"
              >
                <PinOff className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <GroupHeader label="Recent" open={!closed.recent} onToggle={() => toggleGroup('recent')} controls="nav-recent" />
      {!closed.recent && (
        <ul id="nav-recent" className="flex flex-col gap-0.5">
          {recents.map((r) => (
            <li key={r.id}>
              <Link to={r.path} onClick={onNavigate} className={cn(rowBase, 'h-9 px-3 text-foreground-secondary hover:bg-neutral-soft hover:text-foreground')}>
                <History className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <Ltr className="shrink-0 text-xs font-semibold text-foreground tabular">{r.id}</Ltr>
                <span className="truncate text-xs">{r.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="my-3 h-px bg-border-subtle" />
      <ul className="flex flex-col gap-0.5">{renderModule(dashboard)}</ul>
      {groups.map((g) => {
        const mods = modules.filter((m) => m.group === g.id)
        const isOpen = !closed[g.id]
        return (
          <div key={g.id}>
            <GroupHeader label={g.label} open={isOpen} onToggle={() => toggleGroup(g.id)} controls={`grp-${g.id}`} />
            {isOpen && (
              <ul id={`grp-${g.id}`} className="flex flex-col gap-0.5">
                {mods.map(renderModule)}
              </ul>
            )}
          </div>
        )
      })}
      <div className="my-3 h-px bg-border-subtle" />
      <ul className="flex flex-col gap-0.5">{renderModule(settings)}</ul>
    </nav>
  )
}

/** Icon rail for 768 to 1279 px. Flyouts open on hover, focus or tap. */
export function SidebarRail() {
  const t = useT()
  const lang = useLang()
  const current = useCurrent()
  const { pins, recents } = useStore()
  const [open, setOpen] = React.useState<{ id: string; focus: boolean } | null>(null)
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => setOpen(null), [current.pathname])

  const schedule = (fn: () => void, ms: number) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(fn, ms)
  }
  const side = lang === 'ar' ? 'left' : 'right'

  const flyout = (id: string, label: string, Icon: React.ComponentType<{ className?: string }>, active: boolean, body: React.ReactNode, dot?: boolean) => {
    const isOpen = open?.id === id
    return (
      <li key={id}>
        <Popover open={isOpen} onOpenChange={(o) => !o && setOpen(null)}>
          <PopoverAnchor asChild>
            <button
              type="button"
              aria-label={t(label)}
              aria-expanded={isOpen}
              aria-haspopup="true"
              onPointerEnter={(e) => e.pointerType === 'mouse' && schedule(() => setOpen({ id, focus: false }), 80)}
              onPointerLeave={(e) => e.pointerType === 'mouse' && schedule(() => setOpen((o) => (o?.id === id && !o.focus ? null : o)), 180)}
              onFocus={(e) => e.currentTarget.matches(':focus-visible') && setOpen({ id, focus: false })}
              onClick={() => setOpen(isOpen && open?.focus ? null : { id, focus: true })}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setOpen({ id, focus: true })
                }
              }}
              className={cn(
                'relative inline-flex size-10 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:size-11',
                active ? 'bg-brand-soft text-brand-text' : 'text-muted-foreground hover:bg-neutral-soft hover:text-foreground',
              )}
            >
              <Icon className="size-5" aria-hidden />
              {dot && <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-brand ring-2 ring-surface" aria-hidden />}
            </button>
          </PopoverAnchor>
          <PopoverContent
            side={side}
            align="start"
            sideOffset={10}
            className="w-64 p-2"
            onOpenAutoFocus={(e) => {
              if (!open?.focus) e.preventDefault()
            }}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onPointerEnter={() => window.clearTimeout(timer.current)}
            onPointerLeave={() => schedule(() => setOpen((o) => (o?.focus ? o : null)), 200)}
          >
            {body}
          </PopoverContent>
        </Popover>
      </li>
    )
  }

  const linkIcon = (mod: NavModule) => {
    const Icon = mod.icon
    const active = current.module === mod.id
    return (
      <li key={mod.id}>
        <Tooltip content={t(mod.label)} side={side}>
          <Link
            to={modulePath(mod.id)}
            aria-label={t(mod.label)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex size-10 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:size-11',
              active ? 'bg-brand-soft text-brand-text' : 'text-muted-foreground hover:bg-neutral-soft hover:text-foreground',
            )}
          >
            <Icon className="size-5" aria-hidden />
          </Link>
        </Tooltip>
      </li>
    )
  }

  return (
    <nav aria-label={t('Main')} className="flex flex-col items-center gap-1 py-3">
      <ul className="flex flex-col items-center gap-1">
        {flyout(
          'pinned',
          'Pinned',
          Pin,
          false,
          <div>
            <p className="px-2 pt-1 pb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{t('Pinned')}</p>
            <ul className="flex flex-col gap-0.5">
              {pins.map((p) => (
                <li key={p.path}>
                  <Link to={p.path} className={cn(rowBase, 'h-9 px-2 text-foreground-secondary hover:bg-neutral-soft')}>
                    <span className="truncate">{t(p.label)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>,
        )}
        {flyout(
          'recent',
          'Recent',
          History,
          false,
          <div>
            <p className="px-2 pt-1 pb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{t('Recent')}</p>
            <ul className="flex flex-col gap-0.5">
              {recents.map((r) => (
                <li key={r.id}>
                  <Link to={r.path} className={cn(rowBase, 'h-9 px-2 text-foreground-secondary hover:bg-neutral-soft')}>
                    <Ltr className="text-xs font-semibold text-foreground">{r.id}</Ltr>
                    <span className="truncate text-xs">{r.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>,
        )}
      </ul>
      <div className="my-1 h-px w-8 bg-border" />
      <ul className="flex flex-col items-center gap-1">{linkIcon(modules[0])}</ul>
      {groups.map((g) => (
        <React.Fragment key={g.id}>
          <div className="my-1 h-px w-8 bg-border" role="presentation" />
          <ul aria-label={t(g.label)} className="flex flex-col items-center gap-1">
            {modules
              .filter((m) => m.group === g.id)
              .map((mod) =>
                flyout(
                  mod.id,
                  mod.label,
                  mod.icon,
                  current.module === mod.id,
                  <div>
                    <Link
                      to={modulePath(mod.id)}
                      className={cn(rowBase, 'h-9 px-2 font-semibold text-foreground hover:bg-neutral-soft')}
                      aria-current={current.module === mod.id && !current.item ? 'page' : undefined}
                    >
                      <mod.icon className="size-4 text-brand-text" aria-hidden />
                      <span className="truncate">{t(mod.label)}</span>
                      <span className="ms-auto text-xs font-normal text-muted-foreground">{t('Overview')}</span>
                    </Link>
                    <div className="-mx-2 my-1 h-px bg-border-subtle" />
                    <SubItemsCompact mod={mod} current={current} />
                  </div>,
                  mod.items.some((i) => i.badge),
                ),
              )}
          </ul>
        </React.Fragment>
      ))}
      <div className="my-1 h-px w-8 bg-border" />
      <ul className="flex flex-col items-center gap-1">{linkIcon(modules[modules.length - 1])}</ul>
    </nav>
  )
}

function SubItemsCompact({ mod, current }: { mod: NavModule; current: ReturnType<typeof useCurrent> }) {
  const t = useT()
  return (
    <ul className="flex flex-col gap-0.5">
      {mod.items.map((it) => {
        const path = itemPath(mod.id, it.id)
        const active = current.module === mod.id && current.item === it.id
        return (
          <li key={it.id} className="group/row relative flex items-center">
            <Link
              to={path}
              aria-current={active ? 'page' : undefined}
              className={cn(rowBase, 'h-9 px-2 pe-9', active ? 'bg-brand-soft font-medium text-brand-text' : 'text-foreground-secondary hover:bg-neutral-soft hover:text-foreground')}
            >
              <span className="truncate">{t(it.label)}</span>
              <NavBadgeChip item={it} />
            </Link>
            <PinButton path={path} label={it.label} sub={mod.label} className="absolute end-1" />
          </li>
        )
      })}
    </ul>
  )
}
