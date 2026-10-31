import * as React from 'react'
import { useNavigate } from 'react-router'
import { CircleAlert, Phone, Mail, Repeat, Star } from 'lucide-react'
import { useStore } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import type { RecordData } from '@/data/records'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/controls'
import { useWorkspace, type TabMeta, type TypeModule } from '@/workspace/context'
import { FileList, KeyValues, Panel, SimpleTable, Stat, Timeline } from '@/workspace/ui'
import { LinkedChip } from '@/workspace/RightRail'
import { only } from '@/workspace/PlaceholderTab'
import { recordPath } from '@/lib/paths'

const HERO = 'CUS-0184'
const hero = (C: React.ComponentType) => only(HERO, C)

function Overview() {
  const t = useT()
  return (
    <div className="flex flex-col gap-4">
      <section aria-label={t('At a glance')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Lifetime revenue" value="₹1,82,40,000" hint={t('Since Mar 2022')} />
        <Stat label="Outstanding" value="₹6,42,300" hint={t('Due 15 Nov 2025')} tone="warning" />
        <Stat label="Open enquiries" value="1" hint="ENQ-1042" />
        <Stat label="Repeat rate" value="14 / 19" hint={t('Bookings from repeat enquiries')} tone="success" />
      </section>
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title={t('Company')} className="xl:col-span-2">
          <KeyValues
            items={[
              { label: 'Legal name', value: 'Vardhman Buildcon Pvt Ltd' },
              { label: 'GSTIN', value: '27AAFCV4421K1Z8', ltr: true },
              { label: 'PAN', value: 'AAFCV4421K', ltr: true },
              { label: 'Segment', value: t('Infrastructure contractor') },
              { label: 'Credit limit', value: '₹25,00,000', ltr: true },
              { label: 'Payment terms', value: t('15 days credit') },
              { label: 'Billing address', value: t('Office 402, Baner Business Bay, Baner, Pune 411045'), wide: true },
            ]}
          />
        </Panel>
        <Panel title={t('Credit use')}>
          <p className="text-sm text-foreground"><Ltr>₹6,42,300</Ltr> {t('of')} <Ltr>₹25,00,000</Ltr></p>
          <div role="img" aria-label={t('26% of the credit limit is used')} className="mt-2 h-2 rounded-full bg-neutral-soft">
            <div className="h-full w-[26%] rounded-full bg-warning-solid" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground"><Ltr>26%</Ltr> {t('used. No credit hold.')}</p>
        </Panel>
      </div>
    </div>
  )
}

const contacts = [
  { name: 'Amit Deshmukh', role: 'Project manager', phone: '+91 98220 41187', email: 'amit.d@vardhmanbuildcon.example', primary: true },
  { name: 'Sneha Kulkarni', role: 'Procurement head', phone: '+91 98500 22914', email: 'sneha.k@vardhmanbuildcon.example' },
  { name: 'Rakesh Thorat', role: 'Safety officer', phone: '+91 90110 76533', email: 'rakesh.t@vardhmanbuildcon.example' },
  { name: 'Pooja Bhide', role: 'Accounts payable', phone: '+91 98231 18840', email: 'accounts@vardhmanbuildcon.example' },
]

function Contacts() {
  const t = useT()
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {contacts.map((c) => (
        <li key={c.name} className="flex gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs">
          <Avatar name={c.name} />
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
              {c.name}
              {c.primary && <Badge tone="brand" size="sm" icon={Star}>{t('Primary')}</Badge>}
            </p>
            <p className="text-sm text-muted-foreground">{t(c.role)}</p>
            <p className="mt-2 flex items-center gap-2 text-sm"><Phone className="size-3.5 text-muted-foreground" aria-hidden /><Ltr>{c.phone}</Ltr></p>
            <p className="flex min-w-0 items-center gap-2 text-sm"><Mail className="size-3.5 shrink-0 text-muted-foreground" aria-hidden /><Ltr className="truncate">{c.email}</Ltr></p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Sites() {
  const t = useT()
  const navigate = useNavigate()
  const rows = [
    { id: 'SITE-311', name: 'Hinjewadi Phase 3 metro depot', city: 'Pune', jobs: '4', status: 'Active' },
    { id: 'SITE-276', name: 'Wakad residential towers', city: 'Pune', jobs: '9', status: 'Active' },
    { id: 'SITE-241', name: 'Chakan logistics park', city: 'Pune', jobs: '6', status: 'Completed' },
  ]
  return (
    <Panel title={t('Sites')} description={t('Places we have worked for this customer')} bodyClassName="pb-1">
      <SimpleTable
        caption={t('Sites')}
        columns={[
          { key: 'id', label: 'ID', ltr: true },
          { key: 'name', label: 'Site' },
          { key: 'city', label: 'City' },
          { key: 'jobs', label: 'Jobs', align: 'end', ltr: true },
          { key: 'status', label: 'Status' },
        ]}
        rows={rows.map((r) => ({ ...r, city: t(r.city), status: <Badge tone={r.status === 'Active' ? 'success' : 'neutral'} size="sm">{t(r.status)}</Badge> }))}
        onRowClick={(i) => rows[i].id === 'SITE-311' ? navigate(recordPath('SITE-311')) : undefined}
      />
    </Panel>
  )
}

function EnquiriesQuotes() {
  const t = useT()
  const s = useStore()
  const navigate = useNavigate()
  const rows = [
    { id: 'ENQ-1042', what: 'Precast girder erection, Hinjewadi metro depot', quote: 'QT-2231 v2', value: '₹9,20,000', stage: s.enqStage === 'won' ? 'Won' : s.enqStage === 'lost' ? 'Lost' : 'Quotation' },
    { id: 'ENQ-0996', what: 'Slab formwork lifts, Wakad', quote: 'QT-2188 v1', value: '₹4,32,000', stage: 'Won' },
    { id: 'ENQ-0951', what: 'Lift shaft precast, Wakad tower C', quote: 'QT-2140 v3', value: '₹2,86,000', stage: 'Lost' },
  ]
  return (
    <Panel title={t('Enquiries and quotes')} bodyClassName="pb-1">
      <SimpleTable
        caption={t('Enquiries and quotes')}
        columns={[
          { key: 'id', label: 'ID', ltr: true },
          { key: 'what', label: 'Work' },
          { key: 'quote', label: 'Quote', ltr: true },
          { key: 'value', label: 'Before tax', align: 'end', ltr: true },
          { key: 'stage', label: 'Stage' },
        ]}
        rows={rows.map((r) => ({ ...r, stage: <Badge tone={r.stage === 'Won' ? 'success' : r.stage === 'Lost' ? 'danger' : 'brand'} size="sm">{t(r.stage)}</Badge> }))}
        onRowClick={(i) => i === 0 ? navigate('/crm/enquiries/ENQ-1042/overview') : undefined}
      />
    </Panel>
  )
}

function BookingsJobs() {
  const t = useT()
  const s = useStore()
  const navigate = useNavigate()
  const rows = [
    ...(s.bookingCreated ? [{ id: 'BK-2207', what: '100 T crawler, 18 days, Hinjewadi', dates: '12 – 29 Nov 2025', status: 'Confirmed', tone: 'brand' as const }] : []),
    { id: 'JB-5490', what: 'Slab formwork lifts, Wakad', dates: '14 – 28 Oct 2025', status: 'Closed', tone: 'neutral' as const },
    { id: 'BK-2102', what: '50 T hydra, 12 days, Wakad', dates: '2 – 13 Sep 2025', status: 'Invoiced', tone: 'success' as const },
    { id: 'BK-2047', what: '100 T crawler, 21 days, Chakan', dates: '4 – 24 Jun 2025', status: 'Invoiced', tone: 'success' as const },
  ]
  return (
    <Panel title={t('Bookings and jobs')} bodyClassName="pb-1">
      <SimpleTable
        caption={t('Bookings and jobs')}
        columns={[
          { key: 'id', label: 'ID', ltr: true },
          { key: 'what', label: 'Work' },
          { key: 'dates', label: 'Dates', ltr: true },
          { key: 'status', label: 'Status' },
        ]}
        rows={rows.map((r) => ({ ...r, status: <Badge tone={r.tone} size="sm">{t(r.status)}</Badge> }))}
        onRowClick={(i) => (rows[i].id === 'BK-2207' || rows[i].id === 'JB-5490') && navigate(recordPath(rows[i].id))}
      />
    </Panel>
  )
}

function ProjectsContracts() {
  const t = useT()
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel title={t('Projects')} actions={<LinkedChip id="PRJ-0042" />}>
        <KeyValues cols={2} items={[{ label: 'Project', value: 'Pune Metro Line 3, depot package' }, { label: 'Budget', value: '₹1,24,00,000', ltr: true }, { label: 'Duration', value: 'Oct 2025 – Mar 2026', ltr: true }, { label: 'Margin', value: '24.1%', ltr: true }]} />
      </Panel>
      <Panel title={t('Contracts')} actions={<LinkedChip id="CT-0118" />}>
        <KeyValues cols={2} items={[{ label: 'Contract', value: 'Rate contract, FY 25-26' }, { label: 'Valid', value: 'Apr 2025 – Mar 2026', ltr: true }, { label: 'SLA', value: t('Mobilise within 48 h') }, { label: 'Billing', value: t('Fortnightly') }]} />
      </Panel>
    </div>
  )
}

function InvoicesPayments() {
  const t = useT()
  const navigate = useNavigate()
  const rows = [
    { id: 'INV-5521', what: 'October running bill', total: '₹9,62,300', balance: '₹6,42,300', due: '15 Nov 2025', status: 'Part paid', tone: 'warning' as const },
    { id: 'INV-5467', what: 'September running bill', total: '₹7,18,450', balance: '₹0', due: '15 Oct 2025', status: 'Paid', tone: 'success' as const },
    { id: 'INV-5402', what: 'Wakad 50 T hydra', total: '₹5,84,100', balance: '₹0', due: '30 Sep 2025', status: 'Paid', tone: 'success' as const },
  ]
  return (
    <Panel title={t('Invoices and payments')} bodyClassName="pb-1">
      <SimpleTable
        caption={t('Invoices and payments')}
        columns={[
          { key: 'id', label: 'ID', ltr: true },
          { key: 'what', label: 'Description' },
          { key: 'due', label: 'Due', ltr: true },
          { key: 'total', label: 'Total', align: 'end', ltr: true },
          { key: 'balance', label: 'Balance', align: 'end', ltr: true },
          { key: 'status', label: 'Status' },
        ]}
        rows={rows.map((r) => ({ ...r, what: t(r.what), status: <Badge tone={r.tone} size="sm">{t(r.status)}</Badge> }))}
        onRowClick={(i) => rows[i].id === 'INV-5521' && navigate('/finance/receivables/INV-5521/payments')}
      />
    </Panel>
  )
}

function Feedback() {
  const t = useT()
  const items = [
    { kind: 'Complaint', tone: 'warning' as const, title: 'Operator arrived 40 minutes late on day 3', ref: 'JB-5490', state: 'Resolved', when: '20 Oct 2025', who: 'Rakesh Thorat' },
    { kind: 'Feedback', tone: 'success' as const, title: 'Rigging crew was careful around the lift shaft. 5 out of 5.', ref: 'JB-5490', state: 'Rated 5 / 5', when: '29 Oct 2025', who: 'Amit Deshmukh' },
    { kind: 'Feedback', tone: 'success' as const, title: 'Good mobilisation at Chakan, ahead of plan. 4 out of 5.', ref: 'BK-2047', state: 'Rated 4 / 5', when: '26 Jun 2025', who: 'Amit Deshmukh' },
  ]
  return (
    <Panel title={t('Feedback and complaints')} bodyClassName="p-0">
      <ul>
        {items.map((i) => (
          <li key={i.title} className="border-b border-border-subtle px-5 py-3.5 last:border-0">
            <p className="flex flex-wrap items-center gap-2">
              <Badge tone={i.tone} size="sm" icon={i.kind === 'Complaint' ? CircleAlert : Star}>{t(i.kind)}</Badge>
              <Ltr className="text-xs text-muted-foreground">{i.ref}</Ltr>
              <span className="text-xs text-muted-foreground">{t(i.state)}</span>
            </p>
            <p className="mt-1 text-sm text-foreground">{t(i.title)}</p>
            <p className="text-xs text-muted-foreground">{i.who} · <Ltr>{i.when}</Ltr></p>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function RepeatBusiness() {
  const t = useT()
  return (
    <div className="flex flex-col gap-4">
      <section aria-label={t('Repeat business')} className="grid gap-3 sm:grid-cols-3">
        <Stat label="Repeat bookings" value="14" hint={t('Of 19 total')} tone="success" />
        <Stat label="Average gap" value="46 days" hint={t('Between bookings')} />
        <Stat label="Next expected" value="Jan 2026" hint={t('Depot phase 2 girders')} />
      </section>
      <Panel title={t('Opportunities')} description={t('Suggested from past work and project plans')} bodyClassName="p-0">
        <ul>
          {[
            { title: 'Two more girder packages in Q1 2026, mentioned during negotiation', value: '₹18,00,000' },
            { title: 'Rate contract renews in March 2026', value: '₹60,00,000' },
          ].map((o) => (
            <li key={o.title} className="flex items-center gap-3 border-b border-border-subtle px-5 py-3.5 last:border-0">
              <Repeat className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="flex-1 text-sm text-foreground">{t(o.title)}</span>
              <Ltr className="text-sm font-semibold">{o.value}</Ltr>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

function Documents() {
  const { readOnly } = useWorkspace()
  return (
    <FileList
      readOnly={readOnly}
      docs={[
        { name: 'Vardhman-GST-certificate.pdf', kind: 'pdf', size: '120 KB', by: 'Rohan Kulkarni', when: '1 Nov 2025' },
        { name: 'Rate-contract-CT-0118.pdf', kind: 'pdf', size: '640 KB', by: 'Priya Nair', when: '2 Apr 2025' },
        { name: 'Credit-application-signed.pdf', kind: 'pdf', size: '310 KB', by: 'Anita Desai', when: '14 Mar 2022' },
      ]}
    />
  )
}

function History() {
  return (
    <Timeline
      items={[
        { what: 'Sent QT-2231 v2', who: 'Rohan Kulkarni', when: '6 Nov, 17:05' },
        { what: 'Recorded payment ₹3,20,000 on INV-5521', who: 'Anita Desai', when: '3 Nov, 12:10', tone: 'success' },
        { what: 'Closed job JB-5490 at Wakad', who: 'Imran Shaikh', when: '28 Oct, 18:45' },
        { what: 'Credit limit raised to ₹25,00,000', who: 'Priya Nair', when: '1 Apr 2025', tone: 'brand' },
        { what: 'Customer created', who: 'Rohan Kulkarni', when: '14 Mar 2022' },
      ]}
    />
  )
}

export const customerModule: TypeModule = {
  tabs: {
    overview: hero(Overview),
    contacts: hero(Contacts),
    sites: hero(Sites),
    'enquiries-quotes': hero(EnquiriesQuotes),
    'bookings-jobs': hero(BookingsJobs),
    'projects-contracts': hero(ProjectsContracts),
    'invoices-payments': hero(InvoicesPayments),
    'feedback-complaints': hero(Feedback),
    'repeat-business': hero(RepeatBusiness),
    documents: hero(Documents),
    history: hero(History),
  },
  meta: (r: RecordData): Record<string, TabMeta> =>
    r.id === HERO
      ? {
          contacts: { count: 4 },
          sites: { count: 3 },
          'enquiries-quotes': { count: 3 },
          'invoices-payments': { count: 3, attention: 'warning', attentionLabel: 'Balance due 15 Nov' },
          documents: { count: 3 },
        }
      : {},
}
