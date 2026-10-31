import * as React from 'react'
import { Link } from 'react-router'
import { Bookmark, CalendarDays, Check, ChevronDown, CircleAlert, CircleCheck, Clock, Columns3, List, UserPlus, X } from 'lucide-react'
import { recordsOfType, people, type RecordData } from '@/data/records'
import { enquiryDeadlines, myTasks, quotationRows, surveys, type QuoteRow } from '@/data/lists'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox, Segmented } from '@/components/ui/controls'
import { Field, Input } from '@/components/ui/input'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/menu'
import { useStore } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import { createSignal } from '@/lib/signal'
import { liveRecord } from '@/workspace/registry'
import { deadlineSignal } from '@/workspaces/enquiry'
import { cn } from '@/lib/utils'
import { DataTable, ListTabs, Page, PageHeader, SearchBox, type Col } from './common'

const fact = (r: RecordData, label: string) => r.facts.find((f) => f.label === label)?.value ?? '—'

type View = { id: string; label: string; test: (r: RecordData) => boolean }
const myName = people.rohan
const baseViews: View[] = [
  { id: 'open', label: 'All open', test: (r) => !r.closed },
  { id: 'mine', label: 'My enquiries', test: (r) => r.owner === myName && !r.closed },
  { id: 'due', label: 'Due today', test: (r) => enquiryDeadlines[r.id]?.when.startsWith('Today') },
  { id: 'all', label: 'Everything', test: () => true },
]
const ownerSignal = createSignal<Record<string, string>>({})
const viewsSignal = createSignal<{ id: string; label: string; source: string; base: string }[]>([])

function DeadlineChip({ id }: { id: string }) {
  const t = useT()
  const live = deadlineSignal.use()
  const d = enquiryDeadlines[id]
  if (!d || d.state === 'none') return <span className="text-muted-foreground">—</span>
  const state = id === 'ENQ-1042' ? (live === 'close' ? 'soon' : live === 'overdue' ? 'overdue' : 'ok') : d.state
  const body = <Ltr>{t(d.when)}</Ltr>
  if (state === 'overdue') return <Badge tone="danger" size="sm" icon={CircleAlert}>{t('Overdue')}: {body}</Badge>
  if (state === 'soon') return <Badge tone="warning" size="sm" icon={Clock}>{t('Due soon')}: {body}</Badge>
  return <span className="text-sm text-foreground">{body}</span>
}

export function EnquiriesInbox() {
  const t = useT()
  const s = useStore()
  const owners = ownerSignal.use()
  const savedViews = viewsSignal.use()
  const [tab, setTab] = React.useState('all')
  const [viewId, setViewId] = React.useState('open')
  const [q, setQ] = React.useState('')
  const [selected, setSelected] = React.useState<string[]>([])
  const [saving, setSaving] = React.useState(false)
  const [name, setName] = React.useState('')

  const rows = recordsOfType('enquiry')
    .map((r) => {
      const l = liveRecord(r, s)
      return owners[r.id] ? { ...l, owner: owners[r.id] } : l
    })
    .sort((a, b) => (enquiryDeadlines[a.id]?.rank ?? 99) - (enquiryDeadlines[b.id]?.rank ?? 99))
  const saved = savedViews.find((v) => v.id === viewId)
  const view = baseViews.find((v) => v.id === (saved?.base ?? viewId)) ?? baseViews[0]
  const inView = rows.filter(view.test)
  const bySource = (src: string) => inView.filter((r) => fact(r, 'Source') === src)
  const tabRows = tab === 'bmc' ? bySource('Book My Crane') : tab === 'direct' ? bySource('Direct') : inView
  const shown = tabRows.filter((r) => `${r.id} ${r.name} ${fact(r, 'Customer')}`.toLowerCase().includes(q.toLowerCase()))
  const state = { ids: shown.map((r) => r.id), listLabel: 'Enquiries', listPath: '/crm/enquiries' }
  const applyTab = saved?.source ?? tab

  const cols: Col<RecordData>[] = [
    { key: 'id', label: 'ID', ltr: true, render: (r) => r.id },
    { key: 'name', label: 'Enquiry', render: (r) => <span className="block max-w-xs truncate lg:max-w-sm">{r.name}<span className="block text-xs text-muted-foreground">{fact(r, 'Customer')}</span></span> },
    { key: 'source', label: 'Source', render: (r) => <Badge tone={fact(r, 'Source') === 'Book My Crane' ? 'info' : 'neutral'} size="sm">{t(fact(r, 'Source'))}</Badge> },
    { key: 'stage', label: 'Stage', render: (r) => <Badge tone={r.status.tone} size="sm">{t(r.status.label)}</Badge> },
    { key: 'due', label: 'Response deadline', render: (r) => <DeadlineChip id={r.id} /> },
    { key: 'owner', label: 'Owner', render: (r) => r.owner },
  ]

  return (
    <Page>
      <PageHeader
        title={t('Enquiries')}
        description={t('Sorted by response deadline, soonest first')}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Bookmark aria-hidden />
                {t(saved?.label ?? view.label)}
                <ChevronDown className="size-3.5" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('Saved views')}</DropdownMenuLabel>
              {[...baseViews, ...savedViews].map((v) => (
                <DropdownMenuItem key={v.id} onSelect={() => { setViewId(v.id); if ('source' in v) setTab(v.source); setSelected([]) }}>
                  {v.id === viewId ? <Check aria-hidden /> : <span className="size-4" aria-hidden />}
                  {t(v.label)}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setSaving(true)}>
                <span className="size-4" aria-hidden />
                {t('Save current view')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <ListTabs
        label={t('Filter by source')}
        panelId="enq-list"
        value={tab}
        onChange={(v) => { setTab(v); setSelected([]) }}
        tabs={[
          { id: 'all', label: 'All', count: inView.length },
          { id: 'bmc', label: 'Book My Crane', count: bySource('Book My Crane').length },
          { id: 'direct', label: 'Direct', count: bySource('Direct').length },
        ]}
      />
      <SearchBox value={q} onChange={setQ} label={t('Search enquiries')} />
      {selected.length > 0 && (
        <div role="region" aria-label={t('Bulk actions')} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-brand-soft px-4 py-2.5">
          <span className="text-sm font-medium text-foreground"><Ltr>{selected.length}</Ltr> {t('selected')}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm"><UserPlus aria-hidden />{t('Assign to')}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[people.rohan, people.farhan, people.priya].map((p) => (
                <DropdownMenuItem
                  key={p}
                  onSelect={() => {
                    ownerSignal.set({ ...owners, ...Object.fromEntries(selected.map((id) => [id, p])) })
                    s.toast(`${selected.length} ${t('enquiries assigned to')} ${p}`)
                    setSelected([])
                  }}
                >
                  {p}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}><X aria-hidden />{t('Clear')}</Button>
        </div>
      )}
      <div id="enq-list" role="tabpanel" aria-labelledby={`enq-list-tab-${tab}`}>
        <DataTable rows={shown} cols={cols} rowId={(r) => r.id} to={(r) => `/crm/enquiries/${r.id}/overview`} state={state} caption={t('Enquiries')} selection={{ selected, onChange: setSelected }} />
      </div>
      <Dialog open={saving} onOpenChange={setSaving}>
        <DialogContent>
          <form
            className="contents"
            onSubmit={(e) => {
              e.preventDefault()
              if (!name.trim()) return
              const id = `v${savedViews.length + 1}`
              viewsSignal.set([...savedViews, { id, label: name, source: applyTab, base: view.id }])
              setViewId(id)
              setName('')
              setSaving(false)
              s.toast(t('View saved'))
            }}
          >
            <DialogHeader>
              <DialogTitle>{t('Save current view')}</DialogTitle>
              <DialogDescription>{t('Keeps the source tab and filter so you can return to this list.')}</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Field label={t('View name')} htmlFor="view-name" required>
                <Input id="view-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button onClick={() => setSaving(false)}>{t('Cancel')}</Button>
              <Button type="submit" variant="primary" disabled={!name.trim()}>{t('Save view')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Page>
  )
}

const leadColumns = ['New', 'Contacted', 'Qualified', 'Disqualified']

export function LeadsPage() {
  const t = useT()
  const [mode, setMode] = React.useState<'board' | 'list'>('board')
  const rows = recordsOfType('lead')
  const state = { ids: rows.map((r) => r.id), listLabel: 'Leads', listPath: '/crm/leads' }
  return (
    <Page>
      <PageHeader
        title={t('Leads')}
        description={t('Early interest, before it becomes an enquiry')}
        actions={
          <Segmented
            label={t('View')}
            value={mode}
            onValueChange={setMode}
            options={[
              { value: 'board', label: t('Board'), icon: Columns3 },
              { value: 'list', label: t('List'), icon: List },
            ]}
          />
        }
      />
      {mode === 'list' ? (
        <DataTable
          rows={rows}
          rowId={(r) => r.id}
          to={(r) => `/crm/leads/${r.id}/overview`}
          state={state}
          caption={t('Leads')}
          cols={[
            { key: 'id', label: 'ID', ltr: true, render: (r) => r.id },
            { key: 'name', label: 'Lead', render: (r) => r.name },
            { key: 'source', label: 'Source', render: (r) => t(fact(r, 'Source')) },
            { key: 'value', label: 'Est. value', align: 'end', ltr: true, render: (r) => fact(r, 'Est. value') },
            { key: 'status', label: 'Stage', render: (r) => <Badge tone={r.status.tone} size="sm">{t(r.status.label)}</Badge> },
            { key: 'owner', label: 'Owner', render: (r) => r.owner },
          ]}
        />
      ) : (
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:px-0 xl:grid-cols-4">
          {leadColumns.map((c) => {
            const items = rows.filter((r) => r.status.label === c)
            return (
              <section key={c} aria-label={t(c)} className="w-72 shrink-0 rounded-xl bg-surface-sunken p-3 md:w-auto">
                <h2 className="mb-2 flex items-center justify-between text-sm font-semibold text-foreground">
                  {t(c)}
                  <span className="text-xs font-medium text-muted-foreground tabular"><Ltr>{items.length}</Ltr></span>
                </h2>
                <ul className="flex flex-col gap-2">
                  {items.map((r) => (
                    <li key={r.id}>
                      <Link to={`/crm/leads/${r.id}/overview`} state={state} className="block rounded-lg border border-border bg-surface p-3 shadow-xs hover:border-border-strong focus-visible:outline-2 focus-visible:outline-ring">
                        <Ltr className="text-xs font-semibold text-muted-foreground">{r.id}</Ltr>
                        <p className="mt-0.5 text-sm font-medium text-foreground">{r.name}</p>
                        <p className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t(fact(r, 'Source'))}</span>
                          <Ltr>{fact(r, 'Est. value')}</Ltr>
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </Page>
  )
}

export function QuotationsPage() {
  const t = useT()
  const s = useStore()
  const [tab, setTab] = React.useState<QuoteRow['bucket']>('approval')
  const rows = quotationRows.map((q) => (q.id === 'QT-2231' && s.approvals['APR-QT-2231'] !== 'pending' ? { ...q, bucket: 'sent' as const, note: s.approvals['APR-QT-2231'] === 'approved' ? '12% discount approved' : 'Discount rejected' } : q))
  const count = (b: QuoteRow['bucket']) => rows.filter((r) => r.bucket === b).length
  const shown = rows.filter((r) => r.bucket === tab)
  return (
    <Page>
      <PageHeader title={t('Quotations')} description={t('Each quote opens on its enquiry, in the Quotations tab')} />
      <ListTabs
        label={t('Quotation status')}
        panelId="qt-list"
        value={tab}
        onChange={(v) => setTab(v as QuoteRow['bucket'])}
        tabs={[
          { id: 'approval', label: 'Awaiting approval', count: count('approval') },
          { id: 'sent', label: 'Sent', count: count('sent') },
          { id: 'expiring', label: 'Expiring', count: count('expiring') },
          { id: 'expired', label: 'Expired', count: count('expired') },
        ]}
      />
      <div id="qt-list" role="tabpanel" aria-labelledby={`qt-list-tab-${tab}`}>
        <DataTable
          rows={shown}
          rowId={(r) => r.id}
          to={(r) => (r.id === 'QT-2231' ? '/crm/enquiries/ENQ-1042/quotations?quote=v2' : `/crm/enquiries/${r.enquiry}/quotations`)}
          caption={t('Quotations')}
          cols={[
            { key: 'id', label: 'ID', ltr: true, render: (r) => r.id },
            { key: 'enq', label: 'Enquiry', ltr: true, render: (r) => r.enquiry },
            { key: 'cust', label: 'Customer', render: (r) => r.customer },
            { key: 'value', label: 'Value', align: 'end', ltr: true, render: (r) => r.value },
            { key: 'valid', label: 'Valid until', ltr: true, render: (r) => r.validity },
            { key: 'note', label: 'Note', render: (r) => t(r.note) },
          ]}
        />
      </div>
    </Page>
  )
}

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function SurveyCalendar() {
  const t = useT()
  const offset = 5 // 1 Nov 2025 is a Saturday
  const cells = Array.from({ length: 35 }, (_, i) => i - offset + 1)
  const chip = (x: (typeof surveys)[number]) => (
    <Link key={x.id} to={`/crm/enquiries/${x.id}/site-survey`} className={cn('block rounded-md border px-2 py-1 text-xs hover:border-border-strong focus-visible:outline-2 focus-visible:outline-ring', x.done ? 'border-border bg-surface-subtle text-foreground-secondary' : 'border-primary/30 bg-brand-soft text-foreground')}>
      <span className="flex items-center gap-1 font-semibold">
        {x.done && <CircleCheck className="size-3 shrink-0 text-success" aria-hidden />}
        <Ltr>{x.id}</Ltr>
      </span>
      <span className="block truncate">{x.label}</span>
    </Link>
  )
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-border bg-surface shadow-xs md:block">
        <h2 className="border-b border-border-subtle px-4 py-3 text-sm font-semibold text-foreground">{t('November')} <Ltr>2025</Ltr></h2>
        <div className="grid grid-cols-7 border-b border-border-subtle text-xs font-medium text-muted-foreground" aria-hidden>
          {weekdays.map((d) => <div key={d} className="px-2 py-2 text-center">{t(d)}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d) => {
            const valid = d >= 1 && d <= 30
            return (
              <div key={d} className={cn('min-h-24 border-b border-e border-border-subtle p-1.5 [&:nth-child(7n)]:border-e-0', !valid && 'bg-surface-sunken')}>
                {valid && (
                  <>
                    <p className={cn('mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs', d === 11 ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground')}>
                      <Ltr>{d}</Ltr>
                      {d === 11 && <span className="sr-only">, {t('Today')}</span>}
                    </p>
                    <div className="flex flex-col gap-1">{surveys.filter((x) => x.day === d).map(chip)}</div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <ul className="flex flex-col gap-2 md:hidden">
        {surveys.map((x) => (
          <li key={x.id} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-center text-sm font-semibold text-foreground"><Ltr>{x.day} Nov</Ltr></span>
            <div className="min-w-0 flex-1">{chip(x)}</div>
          </li>
        ))}
      </ul>
    </>
  )
}

export function ActivitiesPage() {
  const t = useT()
  const s = useStore()
  const [tab, setTab] = React.useState('tasks')
  const open = myTasks.filter((k) => !s.completedTasks[k.id]).length
  return (
    <Page>
      <PageHeader title={t('Activities')} description={t('Your follow-ups and the survey calendar')} />
      <ListTabs
        label={t('Activities')}
        panelId="act"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'tasks', label: 'My tasks', count: open },
          { id: 'calendar', label: 'Site survey calendar', count: surveys.length },
        ]}
      />
      <div id="act" role="tabpanel" aria-labelledby={`act-tab-${tab}`}>
        {tab === 'calendar' ? (
          <SurveyCalendar />
        ) : (
          <ul className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
            {myTasks.map((k) => {
              const done = !!s.completedTasks[k.id]
              const overdue = k.overdue && !done
              return (
                <li key={k.id} className={cn('flex items-start gap-3 border-b border-border-subtle px-4 py-3 last:border-0', overdue && 'bg-danger-soft')}>
                  <Checkbox id={`task-${k.id}`} className="mt-0.5" checked={done} onCheckedChange={() => s.toggleTask(k.id)} />
                  <div className="min-w-0 flex-1">
                    <label htmlFor={`task-${k.id}`} className={cn('block text-sm font-medium', done ? 'text-muted-foreground line-through' : 'text-foreground')}>{t(k.title)}</label>
                    <p className={cn('mt-0.5 flex flex-wrap items-center gap-1.5 text-xs', overdue ? 'font-medium text-danger' : 'text-muted-foreground')}>
                      {overdue ? <CircleAlert className="size-3.5" aria-hidden /> : <CalendarDays className="size-3.5" aria-hidden />}
                      {overdue && <span>{t('Overdue')} ·</span>}
                      {t('Due')} <Ltr>{t(k.due)}</Ltr>
                    </p>
                  </div>
                  <Link to={`/crm/enquiries/${k.record}/follow-ups`} className="shrink-0 rounded text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"><Ltr>{k.record}</Ltr></Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Page>
  )
}
