import * as React from 'react'
import { Link, useNavigate } from 'react-router'
import { Search } from 'lucide-react'
import { records } from '@/data/records'
import { Badge, CountBadge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/controls'
import { Input } from '@/components/ui/input'
import { recordPath } from '@/lib/paths'
import { Ltr, useLang, useT } from '@/state/i18n'
import { cn } from '@/lib/utils'
import { StatePanel } from '@/workspace/states'
import { statusTone } from '@/data/lists'

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-foreground md:text-2xl">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Page({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4 p-4 md:p-6">{children}</div>
}

export type ListTab = { id: string; label: string; count?: number }

/** ARIA tabs for list filters. Arrow keys follow reading direction. */
export function ListTabs({ tabs, value, onChange, label, panelId }: { tabs: ListTab[]; value: string; onChange: (id: string) => void; label: string; panelId: string }) {
  const t = useT()
  const lang = useLang()
  const refs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((x) => x.id === value)
    const fwd = lang === 'ar' ? 'ArrowLeft' : 'ArrowRight'
    const back = lang === 'ar' ? 'ArrowRight' : 'ArrowLeft'
    const n = e.key === fwd ? (i + 1) % tabs.length : e.key === back ? (i - 1 + tabs.length) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1
    if (n < 0) return
    e.preventDefault()
    onChange(tabs[n].id)
    refs.current[tabs[n].id]?.focus()
  }
  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex gap-1 overflow-x-auto border-b border-border scrollbar-none">
      {tabs.map((x) => {
        const on = x.id === value
        return (
          <button
            key={x.id}
            ref={(el) => {
              refs.current[x.id] = el
            }}
            type="button"
            role="tab"
            id={`${panelId}-tab-${x.id}`}
            aria-selected={on}
            aria-controls={panelId}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(x.id)}
            className={cn(
              'relative inline-flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap px-3 text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
              on ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground hover:text-foreground',
            )}
          >
            {t(x.label)}
            {x.count !== undefined && <CountBadge count={x.count} tone="neutral" />}
            {on && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" aria-hidden />}
          </button>
        )
      })}
    </div>
  )
}

export function SearchBox({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} aria-label={label} className="ps-9" />
    </div>
  )
}

export type Col<T> = { key: string; label: string; render: (row: T) => React.ReactNode; align?: 'end'; ltr?: boolean }

/**
 * List table with a link in the first column. Below 768 px the same rows stack as cards.
 * `to` makes the row open somewhere; `selection` adds checkboxes for bulk actions.
 */
export function DataTable<T>({
  rows,
  cols,
  rowId,
  to,
  state,
  caption,
  selection,
  emptyTitle,
}: {
  rows: T[]
  cols: Col<T>[]
  rowId: (r: T) => string
  to?: (r: T) => string | undefined
  state?: unknown
  caption: string
  selection?: { selected: string[]; onChange: (ids: string[]) => void }
  emptyTitle?: string
}) {
  const t = useT()
  const navigate = useNavigate()
  if (!rows.length) return <StatePanel icon={Search} title={emptyTitle ?? t('Nothing matches this view')} body={t('Try another tab or clear the search.')} />
  const allIds = rows.map(rowId)
  const allOn = !!selection && allIds.every((id) => selection.selected.includes(id))
  const someOn = !!selection && allIds.some((id) => selection.selected.includes(id))
  const toggle = (id: string, on: boolean) => selection?.onChange(on ? [...selection.selected, id] : selection.selected.filter((x) => x !== id))
  const first = (r: T) => {
    const c = cols[0]
    const body = c.ltr ? <Ltr>{c.render(r)}</Ltr> : c.render(r)
    const href = to?.(r)
    return href ? (
      <Link to={href} state={state} onClick={(e) => e.stopPropagation()} className="rounded font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">
        {body}
      </Link>
    ) : (
      <span className="font-semibold">{body}</span>
    )
  }
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface shadow-xs md:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border-subtle text-xs text-muted-foreground">
              {selection && (
                <th scope="col" className="w-10 px-4 py-2.5">
                  <Checkbox aria-label={t('Select all')} checked={allOn ? true : someOn ? 'indeterminate' : false} onCheckedChange={(v) => selection.onChange(v ? allIds : [])} />
                </th>
              )}
              {cols.map((c) => (
                <th key={c.key} scope="col" className={cn('px-4 py-2.5 text-start font-medium whitespace-nowrap', c.align === 'end' && 'text-end')}>
                  {t(c.label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const id = rowId(r)
              const href = to?.(r)
              return (
                <tr key={id} onClick={href ? () => navigate(href, { state }) : undefined} className={cn('border-b border-border-subtle last:border-0', href && 'cursor-pointer hover:bg-surface-subtle')}>
                  {selection && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox aria-label={`${t('Select')} ${id}`} checked={selection.selected.includes(id)} onCheckedChange={(v) => toggle(id, !!v)} />
                    </td>
                  )}
                  {cols.map((c, i) => (
                    <td key={c.key} className={cn('px-4 py-3 align-middle text-foreground', c.align === 'end' && 'text-end', c.ltr && 'whitespace-nowrap')}>
                      {i === 0 ? first(r) : c.ltr ? <Ltr>{c.render(r)}</Ltr> : c.render(r)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <ul className="flex flex-col gap-2 md:hidden" aria-label={caption}>
        {rows.map((r) => {
          const id = rowId(r)
          return (
            <li key={id} className="flex gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-xs">
              {selection && <Checkbox className="mt-0.5" aria-label={`${t('Select')} ${id}`} checked={selection.selected.includes(id)} onCheckedChange={(v) => toggle(id, !!v)} />}
              <div className="min-w-0 flex-1">
                <div className="text-sm">{first(r)}</div>
                <dl className="mt-1.5 flex flex-col gap-1 text-sm">
                  {cols.slice(1).map((c) => (
                    <div key={c.key} className="flex items-center justify-between gap-3">
                      <dt className="shrink-0 text-xs text-muted-foreground">{t(c.label)}</dt>
                      <dd className="min-w-0 text-end text-foreground">{c.ltr ? <Ltr>{c.render(r)}</Ltr> : c.render(r)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}

/** Cell for mock data: record IDs become links, statuses become chips, other text stays as written. */
export function SmartCell({ value, status }: { value: string; status?: boolean }) {
  const t = useT()
  if (status) return <Badge tone={statusTone(value)} size="sm">{t(value)}</Badge>
  if (records[value])
    return (
      <Link to={recordPath(value)} onClick={(e) => e.stopPropagation()} className="rounded font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring">
        <Ltr>{value}</Ltr>
      </Link>
    )
  return /^[₹A-Z0-9+−-]|^\d/.test(value) ? <Ltr>{t(value)}</Ltr> : <>{t(value)}</>
}
