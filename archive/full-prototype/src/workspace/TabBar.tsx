import * as React from 'react'
import { ChevronDown, CircleAlert } from 'lucide-react'
import type { WsTab } from '@/data/workspaces'
import type { TabMeta } from './context'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/menu'
import { Ltr, useLang, useT } from '@/state/i18n'
import { cn } from '@/lib/utils'

function Indicators({ meta, dirty }: { meta?: TabMeta; dirty?: boolean }) {
  const t = useT()
  return (
    <>
      {meta?.count !== undefined && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-soft px-1.5 text-xs font-semibold text-foreground-secondary tabular">
          <Ltr>{meta.count}</Ltr>
        </span>
      )}
      {meta?.attention && (
        <span className="inline-flex" title={meta.attentionLabel && t(meta.attentionLabel)}>
          <CircleAlert className={cn('size-3.5', meta.attention === 'danger' ? 'text-danger' : meta.attention === 'warning' ? 'text-warning' : 'text-brand-text')} aria-hidden />
          <span className="sr-only">, {t(meta.attentionLabel ?? 'Needs attention')}</span>
        </span>
      )}
      {dirty && (
        <span className="inline-flex items-center" title={t('Unsaved changes')}>
          <span className="size-2 rounded-full bg-brand" aria-hidden />
          <span className="sr-only">, {t('Unsaved changes')}</span>
        </span>
      )}
    </>
  )
}

export function TabBar({
  tabs,
  active,
  onSelect,
  meta,
  dirty,
  idBase,
  label,
}: {
  tabs: WsTab[]
  active: string
  onSelect: (id: string) => void
  meta: Record<string, TabMeta>
  dirty: string[]
  idBase: string
  label: string
}) {
  const t = useT()
  const lang = useLang()
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const measureRef = React.useRef<HTMLDivElement>(null)
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const [fit, setFit] = React.useState(tabs.length)

  React.useLayoutEffect(() => {
    const wrap = wrapRef.current
    const measure = measureRef.current
    if (!wrap || !measure) return
    const compute = () => {
      const widths = Array.from(measure.children).map((c) => (c as HTMLElement).offsetWidth + 4)
      const avail = wrap.clientWidth
      const total = widths.reduce((a, b) => a + b, 0)
      if (total <= avail) return setFit(tabs.length)
      const moreW = 112
      let sum = 0
      let n = 0
      for (const w of widths) {
        if (sum + w + moreW > avail) break
        sum += w
        n++
      }
      setFit(Math.max(1, n))
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [tabs, meta, dirty, lang])

  const activeIdx = tabs.findIndex((x) => x.id === active)
  let visible = tabs.slice(0, fit)
  if (activeIdx >= fit) visible = [...tabs.slice(0, fit - 1), tabs[activeIdx]]
  const overflow = tabs.filter((x) => !visible.includes(x))
  const overflowFlag = overflow.some((x) => meta[x.id]?.attention || dirty.includes(x.id))

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = visible.findIndex((x) => x.id === active)
    const fwd = lang === 'ar' ? 'ArrowLeft' : 'ArrowRight'
    const back = lang === 'ar' ? 'ArrowRight' : 'ArrowLeft'
    let next = -1
    if (e.key === fwd) next = (i + 1) % visible.length
    else if (e.key === back) next = (i - 1 + visible.length) % visible.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = visible.length - 1
    if (next < 0) return
    e.preventDefault()
    const id = visible[next].id
    onSelect(id)
    tabRefs.current[id]?.focus()
  }

  const tabCls = (on: boolean) =>
    cn(
      'relative inline-flex h-12 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t-md px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
      on ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground hover:text-foreground',
    )

  return (
    <div className="relative border-b border-border">
      {/* Invisible measuring row so overflow is computed from real tab widths. */}
      <div ref={measureRef} aria-hidden className="pointer-events-none invisible absolute flex h-0 overflow-hidden">
        {tabs.map((x) => (
          <span key={x.id} className={tabCls(x.id === active)}>
            {t(x.label)}
            <Indicators meta={meta[x.id]} dirty={dirty.includes(x.id)} />
          </span>
        ))}
      </div>
      <div ref={wrapRef} className="flex items-end gap-1">
        <div role="tablist" aria-label={label} className="flex min-w-0 items-end gap-1" onKeyDown={onKeyDown}>
          {visible.map((x) => {
            const on = x.id === active
            return (
              <button
                key={x.id}
                ref={(el) => {
                  tabRefs.current[x.id] = el
                }}
                type="button"
                role="tab"
                id={`${idBase}-tab-${x.id}`}
                aria-selected={on}
                aria-controls={`${idBase}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => onSelect(x.id)}
                className={tabCls(on)}
              >
                {t(x.label)}
                <Indicators meta={meta[x.id]} dirty={dirty.includes(x.id)} />
                {on && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" aria-hidden />}
              </button>
            )
          })}
        </div>
        {overflow.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative mb-1.5 inline-flex h-9 shrink-0 items-center gap-1 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-neutral-soft hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:min-h-11"
                aria-label={`${t('More tabs')}, ${overflow.length}${overflowFlag ? `, ${t('some need attention')}` : ''}`}
              >
                {t('More')}
                <span className="text-xs text-muted-foreground tabular">
                  (<Ltr>{overflow.length}</Ltr>)
                </span>
                {overflowFlag && <CircleAlert className="size-3.5 text-warning" aria-hidden />}
                <ChevronDown className="size-4" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {overflow.map((x) => (
                <DropdownMenuItem key={x.id} onSelect={() => onSelect(x.id)}>
                  <span className="flex-1">{t(x.label)}</span>
                  <Indicators meta={meta[x.id]} dirty={dirty.includes(x.id)} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
