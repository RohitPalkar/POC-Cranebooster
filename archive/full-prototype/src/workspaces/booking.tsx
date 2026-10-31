import * as React from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, CircleCheck, CircleDashed, FileCheck2, Info, Wallet } from 'lucide-react'
import { useStore } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import { JOB_FOR_WO, type RecordData } from '@/data/records'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { formatINR } from '@/lib/format'
import { useWorkspace, type Store, type TabMeta, type TypeModule, type WsCtx } from '@/workspace/context'
import { FileList, KeyValues, Panel, SimpleTable, Stat, Timeline } from '@/workspace/ui'
import { LinkedChip } from '@/workspace/RightRail'
import { only } from '@/workspace/PlaceholderTab'
import { EmptyState } from '@/workspace/states'

const HERO = 'BK-2207'
const hero = (C: React.ComponentType) => only(HERO, C)

const value = (s: Store) => (s.approvals['APR-QT-2231'] === 'approved' ? 955328 : 1085600)
const rate = (s: Store) => (s.approvals['APR-QT-2231'] === 'approved' ? 39600 : 45000)

function liveStage(s: Store) {
  return s.woStage === 'dispatched' ? 'in-progress' : s.woStage === 'created' ? 'confirmed' : 'allocated'
}
const stageLabel: Record<string, { label: string; tone: 'brand' | 'info' }> = {
  confirmed: { label: 'Confirmed', tone: 'brand' },
  allocated: { label: 'Allocated', tone: 'info' },
  'in-progress': { label: 'In progress', tone: 'info' },
}

function Overview() {
  const t = useT()
  const s = useStore()
  const { goTab } = useWorkspace()
  const items = [
    { label: 'Quote accepted', done: true, tab: 'quote-confirmation' },
    { label: 'Advance received', done: s.advancePaid, tab: 'po-advance' },
    { label: 'Crane and operator allocated', done: !!s.woCrane, tab: 'work-orders' },
    { label: 'Readiness check done', done: s.woStage === 'ready' || s.woStage === 'dispatched', tab: 'work-orders' },
    { label: 'Dispatched', done: s.woStage === 'dispatched', tab: 'work-orders' },
  ]
  return (
    <div className="flex flex-col gap-4">
      <section aria-label={t('At a glance')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Booking value" value={formatINR(value(s))} hint={t('Including GST')} />
        <Stat label="Advance" value={formatINR(485000)} hint={s.advancePaid ? t('Received') : t('Due before mobilisation')} tone={s.advancePaid ? 'success' : 'warning'} />
        <Stat label="Mobilise by" value="12 Nov, 06:00" hint={t('Tomorrow morning')} tone="warning" />
        <Stat label="Hire period" value="18 days" hint="12 – 29 Nov 2025" />
      </section>
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title={t('Booking details')} className="xl:col-span-2">
          <KeyValues
            items={[
              { label: 'Customer', value: <LinkedChip id="CUS-0184" /> },
              { label: 'Site', value: <LinkedChip id="SITE-311" /> },
              { label: 'From enquiry', value: <LinkedChip id="ENQ-1042" /> },
              { label: 'Accepted quote', value: <LinkedChip id="QT-2231" /> },
              { label: 'Crane', value: <LinkedChip id={s.woCrane ?? s.selectedCrane ?? 'CR-050'} /> },
              { label: 'Service model', value: t('Daily hire') },
              { label: 'Daily rate', value: formatINR(rate(s)), ltr: true },
              { label: 'Hours', value: t('10 h/day, day shift') },
              { label: 'Includes', value: t('Operator, fuel, transport both ways') },
            ]}
          />
        </Panel>
        <Panel title={t('Getting to site')}>
          <ul className="flex flex-col gap-1">
            {items.map((i) => (
              <li key={i.label}>
                <button type="button" onClick={() => goTab(i.tab)} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-start text-sm hover:bg-neutral-soft focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:min-h-11">
                  {i.done ? <CircleCheck className="size-4 shrink-0 text-success" aria-hidden /> : <CircleDashed className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
                  <span className={i.done ? 'text-foreground' : 'text-foreground-secondary'}>{t(i.label)}</span>
                  <span className="sr-only">: {i.done ? t('Done') : t('Open')}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}

function QuoteConfirmation() {
  const t = useT()
  const s = useStore()
  const approved = s.approvals['APR-QT-2231'] === 'approved'
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Panel
        title={<>{t('Accepted quote')} <Ltr>QT-2231 v2</Ltr></>}
        className="xl:col-span-2"
        actions={
          <Button asChild size="sm" variant="ghost">
            <Link to="/crm/enquiries/ENQ-1042/quotations?quote=v2">
              {t('Open quote')} <ArrowRight className="dir-icon" aria-hidden />
            </Link>
          </Button>
        }
      >
        <KeyValues
          items={[
            { label: 'Daily rate', value: formatINR(rate(s)), ltr: true },
            { label: 'Mobilisation and demobilisation', value: formatINR(110000), ltr: true },
            { label: 'Discount', value: approved ? t('12%, approved by Priya Nair') : t('None') },
            { label: 'Total incl. GST', value: formatINR(value(s)), ltr: true },
            { label: 'Validity', value: '13 Nov 2025', ltr: true },
            { label: 'Credit terms', value: t('Fortnightly billing, 15 days credit') },
          ]}
        />
      </Panel>
      <Panel title={t('Confirmation')}>
        <div className="flex flex-col gap-3">
          <Badge tone="success" icon={FileCheck2}>{t('Confirmed by customer')}</Badge>
          <p className="text-sm text-foreground">Amit Deshmukh, {t('Project manager')}</p>
          <p className="text-xs text-muted-foreground">{t('Accepted on Book My Crane')} · <Ltr>BMC-PN-58213</Ltr></p>
          <p className="text-xs text-muted-foreground">{t('Confirmation email sent')} · <Ltr>{t('Today, 10:05')}</Ltr></p>
        </div>
      </Panel>
    </div>
  )
}

function Contract() {
  const t = useT()
  return (
    <Panel title={t('Governing contract')} description={t('This booking is billed under the customer rate contract')} actions={<LinkedChip id="CT-0118" />}>
      <KeyValues
        items={[
          { label: 'Contract', value: t('Rate contract, Vardhman Buildcon FY 25-26') },
          { label: 'Valid', value: 'Apr 2025 – Mar 2026', ltr: true },
          { label: 'Mobilisation SLA', value: t('Within 48 h of confirmation') },
          { label: 'Billing', value: t('Fortnightly') },
          { label: 'Overtime', value: '₹3,200 / h', ltr: true },
          { label: 'Standby', value: '₹22,000 / day', ltr: true },
          { label: 'Liability', value: t('Capped at the value of this booking. Lifts stay under the customer rigging supervisor.'), wide: true },
        ]}
      />
    </Panel>
  )
}

function PoAdvance() {
  const t = useT()
  const s = useStore()
  const { readOnly, setDirty } = useWorkspace()
  const [po, setPo] = React.useState('')
  const [saved, setSaved] = React.useState('')
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel title={t('Customer PO')} description={t('Needed before the first running invoice')}>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            setSaved(po)
            setDirty('po-advance', false)
            s.toast(t('PO saved'))
          }}
        >
          <Field label={t('PO number')} htmlFor="po-no" helper={saved ? `${t('Saved')}: ${saved}` : t('Not received yet')}>
            <Input
              id="po-no"
              dir="ltr"
              value={po}
              placeholder="VBPL/PO/25-26/0981"
              disabled={readOnly}
              onChange={(e) => {
                setPo(e.target.value)
                setDirty('po-advance', e.target.value !== saved)
              }}
            />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" size="sm" variant="primary" disabled={po === saved}>{t('Save PO')}</Button>
          </div>
        </form>
      </Panel>
      <Panel
        title={t('Advance')}
        description={<><Ltr>ADV-0412</Ltr> · {t('Sent today')}</>}
        actions={s.advancePaid ? <Badge tone="success" icon={CircleCheck}>{t('Received')}</Badge> : <Badge tone="warning">{t('Due')}</Badge>}
      >
        <div className="flex flex-col gap-3">
          <p className="text-2xl font-semibold text-foreground tabular"><Ltr>{formatINR(485000)}</Ltr></p>
          <p className="text-sm text-muted-foreground">{t('Must be received before dispatch. It is a readiness check on WO-3318.')}</p>
          {!s.advancePaid && (
            <div>
              <Button size="sm" onClick={() => { s.setAdvancePaid(true); s.toast(t('Advance ₹4,85,000 recorded')) }}>
                <Wallet aria-hidden />
                {t('Record advance')}
              </Button>
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}

function WorkOrders() {
  const t = useT()
  const s = useStore()
  const navigate = useNavigate()
  const ids = ['WO-3318', 'WO-3319']
  const label = s.woStage[0].toUpperCase() + s.woStage.slice(1)
  const rows = [
    { id: 'WO-3318', title: t('Mobilise 100 T crawler and lift precast girders'), date: '12 Nov 2025', crane: s.woCrane ?? '—', status: <Badge tone={s.woStage === 'created' ? 'neutral' : 'info'} size="sm">{t(label)}</Badge> },
    { id: 'WO-3319', title: t('Demobilise 100 T crawler, Hinjewadi'), date: '29 Nov 2025', crane: '—', status: <Badge size="sm">{t('Created')}</Badge> },
  ]
  return (
    <Panel title={t('Work orders')} description={t('Generated from this booking. Open one to allocate, check and dispatch.')} bodyClassName="pb-1">
      <SimpleTable
        caption={t('Work orders')}
        columns={[
          { key: 'id', label: 'ID', ltr: true },
          { key: 'title', label: 'Work' },
          { key: 'date', label: 'Mobilise', ltr: true },
          { key: 'crane', label: 'Crane', ltr: true },
          { key: 'status', label: 'Status' },
        ]}
        rows={rows}
        rowLabel={(i) => `${t('Open')} ${ids[i]}`}
        onRowClick={(i) => navigate(`/operations/work-orders/${ids[i]}/${i === 0 && s.woStage === 'created' ? 'allocation' : 'overview'}`, { state: { ids, listLabel: 'Work orders', listPath: '/bookings/bookings/BK-2207/work-orders' } })}
      />
    </Panel>
  )
}

function Jobs() {
  const t = useT()
  const { goTab } = useWorkspace()
  const s = useStore()
  if (s.woStage !== 'dispatched')
    return (
      <EmptyState
        title={t('No job yet')}
        body={t('A job starts when WO-3318 is dispatched. Timesheets and daily logs are recorded there.')}
        action={<Button variant="primary" onClick={() => goTab('work-orders')}>{t('Open work orders')}</Button>}
      />
    )
  return (
    <Panel title={t('Jobs')} description={t('Created when the crane was dispatched')} actions={<LinkedChip id={JOB_FOR_WO} />}>
      <KeyValues items={[{ label: 'Status', value: t('Mobilised') }, { label: 'Check-in', value: '12 Nov 2025, 06:00', ltr: true }, { label: 'Crane', value: s.woCrane, ltr: true }]} />
    </Panel>
  )
}

function Payments() {
  const t = useT()
  const s = useStore()
  const total = value(s)
  const rest = total - 485000
  const part = Math.round(rest / 3)
  return (
    <Panel title={t('Payment schedule')} description={<>{t('Total')} <Ltr>{formatINR(total)}</Ltr></>} bodyClassName="pb-1">
      <SimpleTable
        caption={t('Payment schedule')}
        columns={[
          { key: 'what', label: 'Milestone' },
          { key: 'date', label: 'Due', ltr: true },
          { key: 'amount', label: 'Amount', align: 'end', ltr: true },
          { key: 'status', label: 'Status' },
        ]}
        rows={[
          { what: t('Advance, ADV-0412'), date: '11 Nov 2025', amount: formatINR(485000), status: <Badge tone={s.advancePaid ? 'success' : 'warning'} size="sm">{s.advancePaid ? t('Received') : t('Due')}</Badge> },
          { what: t('Running bill 1'), date: '26 Nov 2025', amount: formatINR(part), status: <Badge size="sm">{t('Upcoming')}</Badge> },
          { what: t('Running bill 2'), date: '10 Dec 2025', amount: formatINR(part), status: <Badge size="sm">{t('Upcoming')}</Badge> },
          { what: t('Final bill'), date: '14 Dec 2025', amount: formatINR(rest - part * 2), status: <Badge size="sm">{t('Upcoming')}</Badge> },
        ]}
      />
    </Panel>
  )
}

function Documents() {
  const { readOnly } = useWorkspace()
  return (
    <FileList
      readOnly={readOnly}
      docs={[
        { name: 'BK-2207-confirmation.pdf', kind: 'pdf', size: '164 KB', by: 'Priya Nair', when: '11 Nov 2025' },
        { name: 'QT-2231-v2-accepted.pdf', kind: 'pdf', size: '214 KB', by: 'Rohan Kulkarni', when: '11 Nov 2025' },
        { name: 'ADV-0412-advance-invoice.pdf', kind: 'pdf', size: '92 KB', by: 'Anita Desai', when: '11 Nov 2025' },
        { name: 'Lift-plan-LP-311-04-rev-B.pdf', kind: 'pdf', size: '1.2 MB', by: 'Imran Shaikh', when: '10 Nov 2025' },
      ]}
    />
  )
}

function History() {
  return (
    <Timeline
      items={[
        { what: 'Advance invoice ADV-0412 sent', who: 'Anita Desai', when: 'Today, 10:20' },
        { what: 'Work orders WO-3318 and WO-3319 generated', who: 'System', when: 'Today, 10:05', tone: 'brand' },
        { what: 'Booking created from ENQ-1042', who: 'Priya Nair', when: 'Today, 10:05', tone: 'success' },
      ]}
    />
  )
}

export const bookingModule: TypeModule = {
  tabs: {
    overview: hero(Overview),
    'quote-confirmation': hero(QuoteConfirmation),
    contract: hero(Contract),
    'po-advance': hero(PoAdvance),
    'work-orders': hero(WorkOrders),
    jobs: hero(Jobs),
    payments: hero(Payments),
    documents: hero(Documents),
    history: hero(History),
  },
  live: (r: RecordData, s) => {
    if (r.id !== HERO) return r
    const stage = liveStage(s)
    return {
      ...r,
      stage,
      status: stageLabel[stage],
      facts: r.facts.map((f) =>
        f.label === 'Value' ? { ...f, value: formatINR(value(s)) } : f.label === 'Advance' ? { ...f, value: s.advancePaid ? '₹4,85,000 received' : f.value, tone: s.advancePaid ? ('success' as const) : f.tone } : f,
      ),
      linked: s.woStage === 'dispatched' ? [JOB_FOR_WO, ...r.linked] : r.linked,
    }
  },
  meta: (r, s): Record<string, TabMeta> => {
    if (r.id !== HERO) return {}
    return {
      'po-advance': s.advancePaid ? {} : { attention: 'warning', attentionLabel: 'Advance due' },
      'work-orders': { count: 2, ...(s.woStage === 'created' ? { attention: 'brand', attentionLabel: 'WO-3318 needs allocation' } : {}) },
      jobs: { count: s.woStage === 'dispatched' ? 1 : 0 },
      documents: { count: 4 },
    }
  },
  primaryBlocked: (r, s) => {
    if (r.id !== HERO) return null
    return liveStage(s) === 'allocated' ? 'Dispatch WO-3318 before the job can start.' : null
  },
  next: (r, s, ctx: WsCtx) => {
    if (r.id !== HERO) return null
    if (!s.advancePaid && s.woStage === 'created') return { title: 'Allocate WO-3318', detail: 'Crane and operator are needed before mobilisation.', due: 'Mobilise by 12 Nov, 06:00', tone: 'warning', cta: { label: 'Open work orders', onClick: () => ctx.goTab('work-orders') } }
    if (s.woStage !== 'dispatched') return { title: 'Finish WO-3318', detail: 'Readiness and dispatch are on the work order.', due: 'Mobilise by 12 Nov, 06:00', tone: 'warning', cta: { label: 'Open work orders', onClick: () => ctx.goTab('work-orders') } }
    return { title: 'Crane on the way', detail: 'Follow the job for check-in.', cta: { label: 'Open jobs', onClick: () => ctx.goTab('jobs') } }
  },
  Banner: function BookingBanner() {
    const t = useT()
    const s = useStore()
    const { record } = useWorkspace()
    if (record.id !== HERO || s.bookingCreated) return null
    return (
      <p role="status" className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-info-soft px-4 py-3 text-sm text-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
        <span>
          {t('Demo preview: this booking is created when ENQ-1042 is won.')}{' '}
          <Link to="/crm/enquiries/ENQ-1042/quotations" className="font-medium underline underline-offset-4">{t('Go to the enquiry')}</Link>
        </span>
      </p>
    )
  },
}
