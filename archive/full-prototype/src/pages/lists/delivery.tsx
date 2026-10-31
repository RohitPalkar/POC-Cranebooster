import * as React from 'react'
import { Link } from 'react-router'
import { CircleAlert, CircleCheck, Clock, MapPin, Truck } from 'lucide-react'
import { recordsOfType, type RecordData } from '@/data/records'
import { todaysJobs } from '@/data/lists'
import { Badge } from '@/components/ui/badge'
import { Segmented } from '@/components/ui/controls'
import { useStore } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import { liveRecord } from '@/workspace/registry'
import { cn } from '@/lib/utils'
import { recordPath } from '@/lib/paths'
import { DataTable, ListTabs, Page, PageHeader } from './common'

const fact = (r: RecordData, label: string) => r.facts.find((f) => f.label === label)?.value ?? '—'

const bookingTabs: { id: string; label: string; statuses: string[] }[] = [
  { id: 'upcoming', label: 'Upcoming', statuses: ['Requested', 'Confirmed', 'Allocated'] },
  { id: 'active', label: 'Active', statuses: ['In progress'] },
  { id: 'completed', label: 'Completed', statuses: ['Completed', 'Invoiced'] },
  { id: 'cancelled', label: 'Cancelled', statuses: ['Cancelled'] },
]

export function BookingsPage() {
  const t = useT()
  const s = useStore()
  const [tab, setTab] = React.useState('upcoming')
  const [source, setSource] = React.useState('all')
  const all = recordsOfType('booking').map((r) => liveRecord(r, s)).filter((r) => source === 'all' || fact(r, 'Source') === source)
  const def = bookingTabs.find((x) => x.id === tab)!
  const shown = all.filter((r) => def.statuses.includes(r.status.label))
  return (
    <Page>
      <PageHeader
        title={t('Bookings')}
        description={t('Confirmed work, from every source')}
        actions={
          <Segmented
            label={t('Filter by source')}
            value={source}
            onValueChange={setSource}
            options={[
              { value: 'all', label: t('All') },
              { value: 'Book My Crane', label: t('Book My Crane') },
              { value: 'Direct', label: t('Direct') },
            ]}
          />
        }
      />
      <ListTabs label={t('Booking status')} panelId="bk-list" value={tab} onChange={setTab} tabs={bookingTabs.map((x) => ({ id: x.id, label: x.label, count: all.filter((r) => x.statuses.includes(r.status.label)).length }))} />
      <div id="bk-list" role="tabpanel" aria-labelledby={`bk-list-tab-${tab}`}>
        <DataTable
          rows={shown}
          rowId={(r) => r.id}
          to={(r) => `/bookings/bookings/${r.id}/overview`}
          state={{ ids: shown.map((r) => r.id), listLabel: 'Bookings', listPath: '/bookings/bookings' }}
          caption={t('Bookings')}
          cols={[
            { key: 'id', label: 'ID', ltr: true, render: (r) => r.id },
            { key: 'name', label: 'Booking', render: (r) => r.name },
            { key: 'src', label: 'Source', render: (r) => <Badge tone={fact(r, 'Source') === 'Book My Crane' ? 'info' : 'neutral'} size="sm">{t(fact(r, 'Source'))}</Badge> },
            { key: 'dates', label: 'Dates', ltr: true, render: (r) => fact(r, 'Dates') },
            { key: 'value', label: 'Value', align: 'end', ltr: true, render: (r) => fact(r, 'Value') },
            { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status.tone} size="sm">{t(r.status.label)}</Badge> },
          ]}
        />
      </div>
    </Page>
  )
}

const boardColumns = [
  { id: 'not-ready', label: 'Not ready', icon: CircleAlert, tone: 'text-warning' },
  { id: 'ready', label: 'Ready', icon: CircleCheck, tone: 'text-success' },
  { id: 'dispatched', label: 'Dispatched', icon: Truck, tone: 'text-info' },
  { id: 'on-site', label: 'On site', icon: MapPin, tone: 'text-brand-text' },
] as const

export function TodaysJobsBoard() {
  const t = useT()
  const s = useStore()
  const column = (id: string) => {
    if (id === 'WO-3318') return s.woStage === 'ready' ? 'ready' : s.woStage === 'dispatched' ? 'dispatched' : 'not-ready'
    if (id === 'WO-3314') return 'ready'
    if (id === 'WO-3311' || id === 'WO-3309') return 'on-site'
    return 'not-ready'
  }
  const issue = (j: (typeof todaysJobs)[number]) => {
    if (j.id !== 'WO-3318') return j.issue
    return !s.woCrane ? j.issue : s.woStage === 'allocated' ? 'Readiness checks open' : undefined
  }
  return (
    <Page>
      <PageHeader title={t("Today's jobs")} description={t('Everything mobilising or on site, by readiness')} />
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:px-0 xl:grid-cols-4">
        {boardColumns.map((c) => {
          const items = todaysJobs.filter((j) => column(j.id) === c.id)
          return (
            <section key={c.id} aria-label={t(c.label)} className="w-72 shrink-0 rounded-xl bg-surface-sunken p-3 md:w-auto">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <c.icon className={cn('size-4', c.tone)} aria-hidden />
                {t(c.label)}
                <span className="ms-auto text-xs font-medium text-muted-foreground tabular"><Ltr>{items.length}</Ltr></span>
              </h2>
              <ul className="flex flex-col gap-2">
                {items.map((j) => {
                  const why = issue(j)
                  return (
                    <li key={j.id}>
                      <Link to={recordPath(j.id, j.id === 'WO-3318' ? undefined : 'overview')} state={{ ids: todaysJobs.map((x) => x.id), listLabel: "Today's jobs", listPath: '/operations/todays-jobs' }} className="block rounded-lg border border-border bg-surface p-3 shadow-xs hover:border-border-strong focus-visible:outline-2 focus-visible:outline-ring">
                        <Ltr className="text-sm font-semibold text-foreground">{j.id}</Ltr>
                        <p className="text-sm text-foreground-secondary">{t(j.crane)} · {j.site}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="size-3.5" aria-hidden />
                          {t(j.when)}
                        </p>
                        {why && (
                          <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-warning">
                            <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
                            {t(why)}
                          </p>
                        )}
                      </Link>
                    </li>
                  )
                })}
                {!items.length && <li className="rounded-lg border border-dashed border-border-strong px-3 py-6 text-center text-xs text-muted-foreground">{t('Nothing here right now')}</li>}
              </ul>
            </section>
          )
        })}
      </div>
    </Page>
  )
}
