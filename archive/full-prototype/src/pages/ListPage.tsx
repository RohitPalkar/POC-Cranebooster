import * as React from 'react'
import { useParams } from 'react-router'
import { moduleById } from '@/data/nav'
import { listRecordType, simpleLists } from '@/data/lists'
import { recordsOfType, type RecordData } from '@/data/records'
import { workspaceByList, workspaces } from '@/data/workspaces'
import { Badge } from '@/components/ui/badge'
import { recordPath } from '@/lib/paths'
import { useStore } from '@/state/store'
import { useT } from '@/state/i18n'
import { liveRecord } from '@/workspace/registry'
import { NotFound } from './NotFound'
import { DataTable, ListTabs, Page, PageHeader, SearchBox, SmartCell, type Col } from './lists/common'
import { ActivitiesPage, EnquiriesInbox, LeadsPage, QuotationsPage } from './lists/crm'
import { BookingsPage, TodaysJobsBoard } from './lists/delivery'

const custom: Record<string, React.ComponentType> = {
  'crm/enquiries': EnquiriesInbox,
  'crm/leads': LeadsPage,
  'crm/quotations': QuotationsPage,
  'crm/activities': ActivitiesPage,
  'bookings/bookings': BookingsPage,
  'operations/todays-jobs': TodaysJobsBoard,
}

/** Any record list: status tabs, search, and the first two key facts as columns. */
function RecordList({ type, title, path }: { type: string; title: string; path: string }) {
  const t = useT()
  const s = useStore()
  const [tab, setTab] = React.useState('all')
  const [q, setQ] = React.useState('')
  const all = recordsOfType(type).map((r) => liveRecord(r, s))
  const statuses = Array.from(new Set(all.map((r) => r.status.label)))
  const inTab = all.filter((r) => tab === 'all' || r.status.label === tab)
  const shown = inTab.filter((r) => `${r.id} ${r.name}`.toLowerCase().includes(q.toLowerCase()))
  const factCols: Col<RecordData>[] = all[0].facts.slice(0, 2).map((f) => ({
    key: f.label,
    label: f.label,
    render: (r: RecordData) => {
      const v = r.facts.find((x) => x.label === f.label)
      return v ? (v.ltr ? <SmartCell value={v.value} /> : t(v.value)) : '—'
    },
  }))
  return (
    <Page>
      <PageHeader title={t(title)} description={`${all.length} ${t('records')}`} />
      <ListTabs
        label={t('Filter by status')}
        panelId="rec-list"
        value={tab}
        onChange={setTab}
        tabs={[{ id: 'all', label: 'All', count: all.length }, ...statuses.map((x) => ({ id: x, label: x, count: all.filter((r) => r.status.label === x).length }))]}
      />
      <SearchBox value={q} onChange={setQ} label={`${t('Search')} ${t(title).toLowerCase()}`} />
      <div id="rec-list" role="tabpanel" aria-labelledby={`rec-list-tab-${tab}`}>
        <DataTable
          rows={shown}
          rowId={(r) => r.id}
          to={(r) => recordPath(r.id, workspaces[r.type].tabs[0].id)}
          state={{ ids: shown.map((r) => r.id), listLabel: title, listPath: path }}
          caption={t(title)}
          cols={[
            { key: 'id', label: 'ID', ltr: true, render: (r) => r.id },
            { key: 'name', label: 'Name', render: (r) => r.name },
            ...factCols,
            { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status.tone} size="sm">{t(r.status.label)}</Badge> },
            { key: 'owner', label: 'Owner', render: (r) => r.owner },
          ]}
        />
      </div>
    </Page>
  )
}

function SimpleListPage({ title, id }: { title: string; id: string }) {
  const t = useT()
  const def = simpleLists[id]
  return (
    <Page>
      <PageHeader title={t(title)} description={t(def.hint)} />
      <DataTable
        rows={def.rows}
        rowId={(r) => r.join('|')}
        caption={t(title)}
        cols={def.columns.map((c, i): Col<string[]> => ({ key: c, label: c, render: (r) => <SmartCell value={r[i]} status={i === def.status} /> }))}
      />
    </Page>
  )
}

export function ListPage() {
  const { module, list } = useParams()
  const mod = moduleById[module ?? '']
  const item = mod?.items.find((x) => x.id === list)
  if (!mod || !item) return <NotFound />
  const key = `${module}/${list}`
  const Custom = custom[key]
  if (Custom) return <Custom key={key} />
  const type = workspaceByList[key]?.type ?? listRecordType[key]
  if (type) return <RecordList key={key} type={type} title={item.label} path={`/${key}`} />
  if (simpleLists[key]) return <SimpleListPage key={key} title={item.label} id={key} />
  return <NotFound />
}
