import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { moduleById, type ActionGroup } from '@/data/nav'
import { moduleData, statusTone, type ModuleData } from '@/data/moduleData'
import { QUOTE, records, recordsOfType, type RecordData } from '@/data/records'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/controls'
import { recordPath } from '@/lib/paths'
import { useStore } from '@/state/store'
import { ActionBar } from '@/workspace/ActionBar'
import { Panel, SimpleTable, Stat } from '@/workspace/ui'
import { liveRecord } from '@/workspace/registry'
import { Skeleton } from '@/workspace/PlaceholderTab'
import { cn } from '@/lib/utils'
import { NotFound } from './NotFound'

const fact = (r: RecordData, label: string) => r.facts.find((f) => f.label === label)?.value ?? ''

function SampleData({ data, title }: { data: ModuleData; title: string }) {
  const s = useStore()
  const quote = s.approvals['APR-QT']
  // Records from the demo path appear once the path has created them.
  const rows = data.rows.filter((r) => (r.includes('BK-2207') || r.includes('WO-3318') ? s.bookingCreated : r.includes('JOB-4410') ? s.woStage === 'dispatched' : true))
  const status = (r: string[]) => {
    if (r[0] === QUOTE) return { label: quote === 'pending' ? 'Awaiting approval' : quote === 'approved' ? 'Approved' : 'Rejected', tone: statusTone(quote === 'pending' ? 'Awaiting approval' : quote === 'approved' ? 'Approved' : 'Failed') }
    return records[r[0]] ? liveRecord(records[r[0]], s).status : { label: r[data.status!], tone: statusTone(r[data.status!]) }
  }
  const cell = (r: string[], v: string, i: number) => {
    if (i === data.status) {
      const x = status(r)
      return <Badge tone={x.tone} size="sm">{x.label}</Badge>
    }
    const to = records[v] ? recordPath(v) : v === QUOTE ? recordPath(QUOTE) : null
    if (to) return <Link to={to} className="rounded font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring">{v}</Link>
    return i === 0 ? <span className="font-medium">{v}</span> : v
  }
  return (
    <>
      {data.stats && (
        <section aria-label="Key numbers" className="grid grid-cols-4 gap-3">
          {data.stats.map((x) => <Stat key={x.label} {...x} />)}
        </section>
      )}
      <Panel bodyClassName="pb-1 pt-2">
        <SimpleTable
          caption={title}
          columns={data.columns.map((c, i) => ({ key: c, label: c, align: rows.every((r) => /^(₹|—)/.test(r[i])) ? ('end' as const) : undefined }))}
          rows={rows.map((r) => Object.fromEntries(data.columns.map((c, i) => [c, cell(r, r[i], i)])))}
        />
      </Panel>
      <p className="text-xs text-muted-foreground">Sample data for the demo</p>
    </>
  )
}

function Placeholder({ title, purpose, groups, views, data }: { title: string; purpose?: string; groups?: ActionGroup[]; views?: string[]; data?: ModuleData }) {
  const [view, setView] = React.useState(views?.[0] ?? '')
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {purpose && <p className="mt-0.5 text-sm text-muted-foreground">{purpose}</p>}
        </div>
        {views && <Segmented label="View" value={view} onValueChange={setView} options={views.map((v) => ({ value: v, label: v }))} />}
      </div>
      {groups?.map((g, i) => (
        <section key={i} aria-label={g.title ?? 'Actions'}>
          {g.title && <h2 className="mb-2 text-sm font-semibold text-foreground">{g.title} tab</h2>}
          <ActionBar actions={g.actions} />
        </section>
      ))}
      {data ? <SampleData data={data} title={title} /> : <Skeleton />}
    </div>
  )
}

const tabs = ['All', 'Book My Crane', 'Website', 'WhatsApp', 'Phone']

function EnquiriesInbox() {
  const s = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = React.useState('All')
  const all = recordsOfType('enquiry').map((r) => liveRecord(r, s))
  const rows = all.filter((r) => tab === 'All' || fact(r, 'Source') === tab)
  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Enquiries</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Every incoming request, from every source.</p>
      </div>
      <ActionBar actions={['New enquiry', 'Import', 'Convert to requirement']} />
      <div role="tablist" aria-label="Filter by source" className="flex gap-1 border-b border-border">
        {tabs.map((x) => (
          <button key={x} type="button" role="tab" aria-selected={tab === x} onClick={() => setTab(x)} className={cn('relative h-11 px-3 text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring', tab === x ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground hover:text-foreground')}>
            {x}
            {tab === x && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" aria-hidden />}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Enquiries</caption>
          <thead>
            <tr className="border-b border-border-subtle text-xs text-muted-foreground">
              {['ID', 'Enquiry', 'Source', 'Service', 'Crane', 'Response due', 'Stage', 'Actions'].map((c) => (
                <th key={c} scope="col" className="px-4 py-2.5 text-start font-medium whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} onClick={() => navigate(`/crm/enquiries/${r.id}/overview`)} className="cursor-pointer border-b border-border-subtle last:border-0 hover:bg-surface-subtle">
                <td className="px-4 py-3 font-semibold whitespace-nowrap">
                  <a href={`/crm/enquiries/${r.id}/overview`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/crm/enquiries/${r.id}/overview`) }} className="rounded underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">{r.id}</a>
                </td>
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3"><Badge tone={fact(r, 'Source') === 'Book My Crane' ? 'info' : 'neutral'} size="sm">{fact(r, 'Source')}</Badge></td>
                <td className="px-4 py-3 whitespace-nowrap">{fact(r, 'Service')}</td>
                <td className="px-4 py-3 whitespace-nowrap">{fact(r, 'Crane')}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.id === 'ENQ-1042' ? <Badge tone="warning" size="sm">in 3 h</Badge> : fact(r, 'Response due')}</td>
                <td className="px-4 py-3"><Badge tone={r.status.tone} size="sm">{r.status.label}</Badge></td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => navigate(`/crm/enquiries/${r.id}/requirement-matching`)}>Match cranes & quote</Button>
                    <Button size="sm" variant="ghost" onClick={s.later}>Decline</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ListPage() {
  const { module, list } = useParams()
  const mod = moduleById[module ?? '']
  const item = mod?.items.find((x) => x.id === list)
  if (!mod || !item) return <NotFound />
  if (module === 'crm' && list === 'enquiries') return <EnquiriesInbox />
  return <Placeholder key={`${module}/${list}`} title={item.label} purpose={item.purpose} groups={item.groups} views={item.views} data={moduleData[`${module}/${list}`]} />
}

/** Modules open from the sidebar; only Dashboard and Settings are pages of their own. */
export function ModulePage({ id }: { id?: string }) {
  const { module } = useParams()
  const mod = moduleById[id ?? module ?? '']
  if (!mod) return <NotFound />
  return <Placeholder key={mod.id} title={mod.label} purpose={mod.purpose ?? 'Choose an item in the sidebar.'} groups={mod.groups} data={moduleData[mod.id]} />
}
