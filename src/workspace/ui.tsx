import * as React from 'react'
import { FileImage, FileSpreadsheet, FileText, Upload } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ltr, useT } from '@/state/i18n'
import { cn } from '@/lib/utils'

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <Card className={className}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle px-5 py-3.5">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </Card>
  )
}

export type KV = { label: string; value: React.ReactNode; ltr?: boolean; wide?: boolean }

export function KeyValues({ items, cols = 3 }: { items: KV[]; cols?: 2 | 3 | 4 }) {
  const t = useT()
  return (
    <dl className={cn('grid gap-x-6 gap-y-4 sm:grid-cols-2', cols === 3 && 'lg:grid-cols-3', cols === 4 && 'lg:grid-cols-4')}>
      {items.map((it) => (
        <div key={it.label} className={cn('min-w-0', it.wide && 'sm:col-span-2 lg:col-span-full')}>
          <dt className="text-xs font-medium text-muted-foreground">{t(it.label)}</dt>
          <dd className="mt-0.5 text-sm text-foreground">{it.ltr ? <Ltr>{it.value}</Ltr> : it.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function SimpleTable({
  columns,
  rows,
  caption,
  onRowClick,
  rowLabel,
}: {
  columns: { key: string; label: string; align?: 'end'; ltr?: boolean; className?: string }[]
  rows: Record<string, React.ReactNode>[]
  caption: string
  onRowClick?: (i: number) => void
  rowLabel?: (i: number) => string
}) {
  const t = useT()
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-xl border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border-subtle text-xs text-muted-foreground">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn('px-5 py-2 text-start font-medium', c.align === 'end' && 'text-end', c.className)}>
                {t(c.label)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className={cn('border-b border-border-subtle last:border-0', onRowClick && 'cursor-pointer hover:bg-surface-subtle')}
              onClick={onRowClick ? () => onRowClick(i) : undefined}
            >
              {columns.map((c, ci) => (
                <td key={c.key} className={cn('px-5 py-3 align-middle text-foreground', c.align === 'end' && 'text-end', c.ltr && 'whitespace-nowrap', c.className)}>
                  {ci === 0 && onRowClick ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRowClick(i)
                      }}
                      className="rounded text-start font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                      aria-label={rowLabel?.(i)}
                    >
                      {c.ltr ? <Ltr>{r[c.key]}</Ltr> : r[c.key]}
                    </button>
                  ) : c.ltr ? (
                    <Ltr>{r[c.key]}</Ltr>
                  ) : (
                    r[c.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export type Doc = { name: string; kind: 'pdf' | 'img' | 'xls'; size: string; by: string; when: string }

export function FileList({ docs, readOnly }: { docs: Doc[]; readOnly?: boolean }) {
  const t = useT()
  return (
    <Panel
      title={t('Documents')}
      description={`${docs.length} ${t('files')}`}
      actions={
        <Button size="sm" disabled={readOnly}>
          <Upload aria-hidden />
          {t('Upload')}
        </Button>
      }
      bodyClassName="p-0"
    >
      <ul>
        {docs.map((d) => {
          const Icon = d.kind === 'img' ? FileImage : d.kind === 'xls' ? FileSpreadsheet : FileText
          return (
            <li key={d.name} className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-0">
              <span className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-lg', d.kind === 'pdf' ? 'bg-danger-soft text-danger' : d.kind === 'img' ? 'bg-info-soft text-info' : 'bg-success-soft text-success')}>
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  <Ltr>{d.name}</Ltr>
                </p>
                <p className="text-xs text-muted-foreground">
                  {d.by} · <Ltr>{d.when}</Ltr> · <Ltr>{d.size}</Ltr>
                </p>
              </div>
              <Button variant="ghost" size="sm">
                {t('View')}
              </Button>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

export function Timeline({ items }: { items: { what: string; who: string; when: string; tone?: 'brand' | 'success' | 'danger' | 'neutral' }[] }) {
  const t = useT()
  return (
    <Panel title={t('History')} description={t('Every change on this record, newest first')}>
      <ol className="relative flex flex-col gap-5 ps-6 before:absolute before:inset-y-1 before:start-2 before:w-px before:bg-border">
        {items.map((it, i) => (
          <li key={i} className="relative">
            <span
              aria-hidden
              className={cn(
                'absolute -start-6 top-1 size-3 translate-x-[2px] rounded-full ring-4 ring-surface rtl:-translate-x-[2px]',
                it.tone === 'success' ? 'bg-success-solid' : it.tone === 'danger' ? 'bg-danger-solid' : it.tone === 'brand' ? 'bg-brand' : 'bg-border-strong',
              )}
            />
            <p className="text-sm text-foreground">{t(it.what)}</p>
            <p className="text-xs text-muted-foreground">
              {t(it.who)} · <Ltr>{t(it.when)}</Ltr>
            </p>
          </li>
        ))}
      </ol>
    </Panel>
  )
}

export function Stat({ label, value, hint, tone }: { label: string; value: React.ReactNode; hint?: React.ReactNode; tone?: 'success' | 'warning' | 'danger' }) {
  const t = useT()
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
      <p className="text-xs font-medium text-muted-foreground">{t(label)}</p>
      <p className="mt-1 text-xl font-semibold text-foreground tabular">
        <Ltr>{value}</Ltr>
      </p>
      {hint && <p className={cn('mt-1 text-xs', tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : tone === 'danger' ? 'text-danger' : 'text-muted-foreground')}>{hint}</p>}
    </div>
  )
}
