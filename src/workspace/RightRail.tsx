import * as React from 'react'
import { Link } from 'react-router'
import { ArrowRight, CircleAlert, CircleCheck, CircleX, Clock, Link2, PanelRightClose, PanelRightOpen, ShieldCheck, Zap } from 'lucide-react'
import type { RecordData } from '@/data/records'
import { records } from '@/data/records'
import { workspaces } from '@/data/workspaces'
import { recordPath } from '@/lib/paths'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import { cn } from '@/lib/utils'
import type { NextAction } from './context'

const chipAttention: Record<string, string> = { 'CR-025': 'Insurance expires in 7 days' }

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  const t = useT()
  return (
    <section className="border-b border-border-subtle px-4 py-4 last:border-b-0">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        <Icon className="size-3.5" aria-hidden />
        {t(title)}
      </h2>
      {children}
    </section>
  )
}

export function LinkedChip({ id }: { id: string }) {
  const t = useT()
  const r = records[id]
  const type = r ? t(workspaces[r.type].label) : ''
  const attention = chipAttention[id]
  return (
    <Link
      to={recordPath(id)}
      className="group inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs transition-colors hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:min-h-11"
    >
      <span className="text-muted-foreground">{type}</span>
      <Ltr className="font-semibold whitespace-nowrap text-foreground tabular">{r?.type === 'customer' || r?.type === 'site' ? r.name.split(',')[0] : id}</Ltr>
      {attention && (
        <span className="inline-flex items-center gap-1 text-warning">
          <CircleAlert className="size-3.5" aria-hidden />
          <span>{t(attention)}</span>
        </span>
      )}
    </Link>
  )
}

export function RailContent({ record, next }: { record: RecordData; next: NextAction | null }) {
  const t = useT()
  const { approvals } = useStore()
  const appr = record.approval
  const state = appr ? approvals[appr.id] : undefined
  const linked = record.linked
  return (
    <div>
      <Section title="Next action" icon={Zap}>
        {next ? (
          <div className={cn('rounded-lg border p-3', next.tone === 'danger' ? 'border-danger/30 bg-danger-soft' : next.tone === 'warning' ? 'border-warning/30 bg-warning-soft' : 'border-border bg-surface-subtle')}>
            <p className="text-sm font-semibold text-foreground">{t(next.title)}</p>
            {next.detail && <p className="mt-1 text-sm text-foreground-secondary">{t(next.detail)}</p>}
            {next.due && (
              <p className={cn('mt-2 inline-flex items-center gap-1.5 text-xs font-medium', next.tone === 'danger' ? 'text-danger' : next.tone === 'warning' ? 'text-warning' : 'text-muted-foreground')}>
                <Clock className="size-3.5" aria-hidden />
                <Ltr>{t(next.due)}</Ltr>
              </p>
            )}
            {next.cta && (
              <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={next.cta.onClick}>
                {t(next.cta.label)}
                <ArrowRight className="dir-icon" aria-hidden />
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('Nothing due. This record is up to date.')}</p>
        )}
      </Section>
      <Section title="Approval status" icon={ShieldCheck}>
        {!appr ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CircleCheck className="size-4" aria-hidden />
            {t('No approvals needed')}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">{t(appr.title)}</p>
            {state === 'pending' && (
              <Badge tone="warning" icon={Clock}>
                {t('Waiting for')} Rakesh Kulkarni
              </Badge>
            )}
            {state === 'approved' && (
              <Badge tone="success" icon={CircleCheck}>
                {t('Approved by')} Rakesh Kulkarni
              </Badge>
            )}
            {state === 'rejected' && (
              <Badge tone="danger" icon={CircleX}>
                {t('Rejected by')} Rakesh Kulkarni
              </Badge>
            )}
            <p className="text-xs text-muted-foreground">
              {t('Requested by')} {appr.requestedBy} · <Ltr>{appr.amount}</Ltr>
            </p>
          </div>
        )}
      </Section>
      <Section title="Linked records" icon={Link2}>
        {linked.length ? (
          <div className="flex flex-wrap gap-2">
            {linked.map((id) => (
              <LinkedChip key={id} id={id} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('No linked records yet.')}</p>
        )}
      </Section>
      <Section title="Recent activity" icon={Clock}>
        <ol className="relative flex flex-col gap-4 ps-4 before:absolute before:inset-y-1 before:start-1 before:w-px before:bg-border">
          {(record.activity ?? [{ who: record.owner, what: 'Record updated', when: 'Yesterday, 16:20' }]).map((a, i) => (
            <li key={i} className="relative">
              <span className="absolute -start-4 top-1.5 size-2 -translate-x-[3px] rounded-full bg-border-strong ring-2 ring-surface rtl:translate-x-[3px]" aria-hidden />
              <p className="text-sm text-foreground">{t(a.what)}</p>
              <p className="text-xs text-muted-foreground">
                {t(a.who)} · <Ltr>{t(a.when)}</Ltr>
              </p>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  )
}

export function RightRail({ record, next, collapsed, onToggle }: { record: RecordData; next: NextAction | null; collapsed: boolean; onToggle: () => void }) {
  const t = useT()
  if (collapsed) {
    return (
      <aside aria-label={t('Record details')} className="flex w-14 shrink-0 flex-col items-center gap-2 border-s border-border bg-surface py-3">
        <Button variant="ghost" size="icon" onClick={onToggle} aria-label={t('Expand side panel')} aria-expanded={false}>
          <PanelRightOpen className="dir-icon" aria-hidden />
        </Button>
        {next && (
          <span className={cn('inline-flex size-9 items-center justify-center rounded-lg', next.tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-brand-soft text-brand-text')} title={next.title}>
            <Zap className="size-4" aria-hidden />
          </span>
        )}
      </aside>
    )
  }
  return (
    <aside aria-label={t('Record details')} className="w-72 shrink-0 border-s border-border bg-surface">
      <div className="sticky top-0 max-h-[calc(100dvh-3.5rem)] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2">
          <span className="text-sm font-semibold text-foreground">{t('Details')}</span>
          <Button variant="ghost" size="icon-sm" onClick={onToggle} aria-label={t('Collapse side panel')} aria-expanded>
            <PanelRightClose className="dir-icon" aria-hidden />
          </Button>
        </div>
        <RailContent record={record} next={next} />
      </div>
    </aside>
  )
}
