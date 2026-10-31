import * as React from 'react'
import { Link, useParams } from 'react-router'
import { Building2, CreditCard, FileClock, Hash, Lock, Plug, UsersRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/controls'
import { Input } from '@/components/ui/input'
import { useStore, type Role } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import { cn } from '@/lib/utils'
import { Panel } from '@/workspace/ui'
import { Page, PageHeader, SearchBox } from './lists/common'

type Setting = { label: string; value: string; kind?: 'text' | 'toggle'; on?: boolean }
type Section = { id: string; label: string; hint: string; icon: React.ComponentType<{ className?: string }>; editableBy: Role[]; lockedWhy: string; settings: Setting[] }

const sections: Section[] = [
  {
    id: 'organisation', label: 'Organisation', hint: 'Company details and branches', icon: Building2, editableBy: ['manager'], lockedWhy: 'Only managers can change organisation details',
    settings: [
      { label: 'Company name', value: 'Sahara Lift Services Pvt Ltd' },
      { label: 'Registered office', value: 'Talegaon MIDC, Pune 410507' },
      { label: 'Branches', value: 'Pune HQ, Mumbai, Dubai' },
      { label: 'Financial year starts', value: 'April' },
    ],
  },
  {
    id: 'users', label: 'Users & access', hint: 'People, roles and permissions', icon: UsersRound, editableBy: ['manager'], lockedWhy: 'Only managers can change users and roles',
    settings: [
      { label: 'Active users', value: '48 of 60 seats' },
      { label: 'Approval limit, sales manager', value: 'Discounts up to 15%' },
      { label: 'Two-step sign-in', value: '', kind: 'toggle', on: true },
    ],
  },
  {
    id: 'subscription', label: 'Subscription & billing', hint: 'Plan, seats and invoices', icon: CreditCard, editableBy: [], lockedWhy: 'Only the account owner can change the subscription',
    settings: [
      { label: 'Plan', value: 'CSP ERP Growth, annual' },
      { label: 'Renews on', value: '1 Apr 2026' },
      { label: 'Book My Crane listing', value: 'Included' },
    ],
  },
  {
    id: 'tax', label: 'Tax & numbering', hint: 'GST, VAT and document series', icon: Hash, editableBy: ['manager'], lockedWhy: 'Only managers can change tax and numbering',
    settings: [
      { label: 'GSTIN, Pune', value: '27AABCS7788L1Z2' },
      { label: 'TRN, Dubai', value: '100384756200003' },
      { label: 'Quotation series', value: 'QT-####' },
      { label: 'Invoice series', value: 'INV-####' },
    ],
  },
  {
    id: 'notifications', label: 'Notifications & integrations', hint: 'Alerts, WhatsApp and connected apps', icon: Plug, editableBy: ['manager', 'executive'], lockedWhy: '',
    settings: [
      { label: 'Book My Crane deadline alerts', value: '', kind: 'toggle', on: true },
      { label: 'WhatsApp updates to customers', value: '', kind: 'toggle', on: true },
      { label: 'Daily summary email', value: '', kind: 'toggle', on: false },
    ],
  },
  {
    id: 'audit', label: 'Audit logs', hint: 'Who changed what, and when', icon: FileClock, editableBy: [], lockedWhy: 'Audit logs can be read but never changed',
    settings: [
      { label: 'Retention', value: '7 years' },
      { label: 'Last entry', value: 'Priya Nair approved QT-2231, today' },
      { label: 'Export', value: 'CSV, on request' },
    ],
  },
]

function SettingRow({ s, editable }: { s: Setting; editable: boolean }) {
  const t = useT()
  const id = React.useId()
  const [on, setOn] = React.useState(!!s.on)
  return (
    <div className="flex flex-col gap-1.5 border-b border-border-subtle py-3 last:border-0 sm:flex-row sm:items-center sm:gap-4">
      <label htmlFor={id} className="text-sm font-medium text-foreground sm:w-64 sm:shrink-0">{t(s.label)}</label>
      {s.kind === 'toggle' ? (
        <div className="flex items-center gap-2">
          <Switch id={id} checked={on} disabled={!editable} onCheckedChange={setOn} />
          <span className="text-sm text-muted-foreground">{on ? t('On') : t('Off')}</span>
        </div>
      ) : editable ? (
        <Input id={id} defaultValue={s.value} className="sm:max-w-sm" />
      ) : (
        <p id={id} className="text-sm text-foreground-secondary">{t(s.value)}</p>
      )}
    </div>
  )
}

export function SettingsHub() {
  const t = useT()
  const { role, toast } = useStore()
  const { section } = useParams()
  const [q, setQ] = React.useState('')
  const current = sections.find((x) => x.id === section) ?? sections[0]
  const query = q.trim().toLowerCase()
  const hits = query
    ? sections.flatMap((sec) => sec.settings.filter((x) => `${x.label} ${t(x.label)} ${x.value}`.toLowerCase().includes(query)).map((x) => ({ sec, s: x })))
    : []
  const editable = current.editableBy.includes(role)
  return (
    <Page>
      <PageHeader title={t('Settings')} description={t('Company-wide setup for the whole ERP')} />
      <SearchBox value={q} onChange={setQ} label={t('Search all settings')} />
      {query ? (
        <Panel title={t('Search results')} description={`${hits.length} ${t('settings')}`} bodyClassName="p-0">
          {hits.length ? (
            <ul>
              {hits.map(({ sec, s }) => (
                <li key={`${sec.id}-${s.label}`}>
                  <Link to={`/settings/${sec.id}`} onClick={() => setQ('')} className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-3 last:border-0 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                    <span className="text-sm font-medium text-foreground">{t(s.label)}</span>
                    <span className="text-xs text-muted-foreground">{t(sec.label)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-muted-foreground">{t('No settings match your search.')}</p>
          )}
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
          <nav aria-label={t('Settings sections')}>
            <ul className="flex flex-col gap-1">
              {sections.map((sec) => {
                const on = sec.id === current.id
                const canEdit = sec.editableBy.includes(role)
                return (
                  <li key={sec.id}>
                    <Link to={`/settings/${sec.id}`} aria-current={on ? 'page' : undefined} className={cn('flex items-start gap-3 rounded-lg px-3 py-2.5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring', on ? 'bg-brand-soft' : 'hover:bg-neutral-soft')}>
                      <sec.icon className={cn('mt-0.5 size-4 shrink-0', on ? 'text-brand-text' : 'text-muted-foreground')} />
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-sm font-medium', on ? 'text-brand-text' : 'text-foreground')}>{t(sec.label)}</span>
                        <span className="block text-xs text-muted-foreground">{t(sec.hint)}</span>
                      </span>
                      {!canEdit && <Badge size="sm" icon={Lock}>{t('Read only')}</Badge>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <Panel
            title={t(current.label)}
            description={t(current.hint)}
            actions={editable ? <Button size="sm" variant="primary" onClick={() => toast(t('Settings saved'))}>{t('Save')}</Button> : <Badge icon={Lock}>{t('Read only')}</Badge>}
            bodyClassName="py-2"
          >
            {!editable && current.lockedWhy && <p className="mt-2 mb-1 text-sm text-muted-foreground">{t(current.lockedWhy)}.</p>}
            {current.settings.map((s) => <SettingRow key={s.label} s={s} editable={editable} />)}
          </Panel>
        </div>
      )}
    </Page>
  )
}
