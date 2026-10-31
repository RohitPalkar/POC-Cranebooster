import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Ban, CircleCheck, Clock, MapPin, ShieldCheck } from 'lucide-react'
import { useStore } from '@/state/store'
import { craneMatches, QUOTE, type RecordData } from '@/data/records'
import { assetPathPrefix, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/controls'
import { Field, Input } from '@/components/ui/input'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { formatINR } from '@/lib/format'
import { useWorkspace, type TabMeta, type TypeModule, type WsCtx } from '@/workspace/context'
import { FileList, KeyValues, Panel, SimpleTable, Timeline } from '@/workspace/ui'
import { ActionButton } from '@/workspace/ActionButton'
import { ActionBar } from '@/workspace/ActionBar'
import { ApprovalBanner } from '@/workspace/ApprovalBanner'
import { LinkedChip } from '@/workspace/RightRail'
import { only } from '@/workspace/PlaceholderTab'

const HERO = 'ENQ-1042'
const hero = (C: React.ComponentType) => only(HERO, C)
const APPROVAL = 'APR-QT'

type Quote = { v: string; status: string; tone: 'neutral' | 'info' | 'warning'; date: string; rate: number; mob: number; discount: number }
const quotes: Quote[] = [
  { v: 'v3', status: 'Awaiting approval', tone: 'warning', date: 'Today', rate: 32000, mob: 11400, discount: 0.08 },
  { v: 'v2', status: 'Sent', tone: 'info', date: 'Yesterday', rate: 32000, mob: 11400, discount: 0 },
  { v: 'v1', status: 'Revised', tone: 'neutral', date: '3 days ago', rate: 34000, mob: 14000, discount: 0 },
]

/** Round off brings v3 to the ₹1,86,000 that Book My Crane holds in escrow. */
function totals(q: Quote) {
  const hire = q.rate * 5
  const sub = hire + q.mob
  const disc = Math.round(sub * q.discount)
  const taxable = sub - disc
  const gst = Math.round(taxable * 0.18)
  const exact = taxable + gst
  const total = q.v === 'v3' ? 186000 : exact
  return { hire, sub, disc, taxable, gst, roundOff: total - exact, total }
}

function Overview() {
  const s = useStore()
  const { goTab } = useWorkspace()
  const pending = s.approvals[APPROVAL] === 'pending'
  const cards = [
    { q: 'Status', a: s.enqStage === 'won' ? 'Won' : s.enqStage === 'lost' ? 'Lost' : 'Negotiation, v3 with Pride Group' },
    { q: 'Next step', a: pending ? 'Approve the discount on v3' : s.enqStage === 'won' ? 'Work order WO-3318' : 'Mark won and create the booking' },
    { q: 'Owner', a: 'Neha Patil' },
    { q: 'Blocker', a: pending ? 'Discount below PR-14, waiting for Rakesh Kulkarni' : 'Nothing blocking' },
    { q: 'Deadline', a: 'Book My Crane response due in 3 h' },
  ]
  return (
    <div className="flex flex-col gap-4">
      <section aria-label="At a glance" className="grid grid-cols-5 gap-3">
        {cards.map((c) => (
          <div key={c.q} className="rounded-xl border border-border bg-surface p-4 shadow-xs">
            <p className="text-xs font-medium text-muted-foreground">{c.q}</p>
            <p className={cn('mt-1.5 text-sm font-medium', c.q === 'Blocker' && pending ? 'text-danger' : c.q === 'Deadline' ? 'text-warning' : 'text-foreground')}>{c.a}</p>
          </div>
        ))}
      </section>
      <Panel title="Requirement" actions={<Button size="sm" variant="ghost" onClick={() => goTab('requirement-matching')}>Open</Button>}>
        <KeyValues items={[{ label: 'Customer', value: <LinkedChip id="CUS-0317" /> }, { label: 'Site', value: <LinkedChip id="SITE-0412" /> }, { label: 'Crane', value: 'ACE NX360, 14 T' }, { label: 'Period', value: '5 days, day shift' }]} cols={4} />
      </Panel>
    </div>
  )
}

function Requirement() {
  const s = useStore()
  return (
    <div className="flex flex-col gap-4">
      <Panel title="Requirement summary">
        <KeyValues cols={4} items={[{ label: 'Service', value: 'Daily hire' }, { label: 'Capacity', value: '14 T pick and carry' }, { label: 'Period', value: '5 days' }, { label: 'Hours', value: '10 h a day, day shift' }, { label: 'Operator', value: 'Included' }, { label: 'Fuel', value: 'Included' }, { label: 'Transport', value: 'Both ways' }, { label: 'Load', value: 'Precast panels, 9 T' }]} />
      </Panel>
      <Panel title="Ranked crane matches" bodyClassName="p-0">
        <ol>
          {craneMatches.map((c, i) => {
            const held = s.heldCrane === c.id
            return (
              <li key={c.id} className={cn('flex items-center gap-4 border-b border-border-subtle px-5 py-4 last:border-0', held && 'bg-brand-soft/60')}>
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-soft text-sm font-semibold">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {c.id} · {c.name}
                    {held && <Badge tone="brand" size="sm" icon={CircleCheck}>Held</Badge>}
                  </p>
                  <p className="text-sm text-muted-foreground">{c.note}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone="success" size="sm">{c.availability}</Badge>
                    <Badge tone={c.compliant ? 'success' : 'danger'} icon={c.compliant ? ShieldCheck : Ban} size="sm">{c.compliant ? 'Compliant' : 'Non-compliant'}: {c.compliance}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5" aria-hidden />{c.distance}</span>
                    <span className="text-xs text-muted-foreground">{c.rate}</span>
                  </div>
                </div>
                <span className="w-12 text-end text-sm font-semibold" aria-label={`Match score ${c.score}`}>{c.score}</span>
                {c.id === 'CR-025' && (
                  <Button size="sm" variant={held ? 'soft' : 'secondary'} aria-pressed={held} onClick={() => { s.setHeldCrane(held ? null : c.id); if (!held) s.toast('CR-025 held for this enquiry') }}>
                    {held ? 'Held' : 'Hold CR-025'}
                  </Button>
                )}
                {!c.compliant && <ActionButton size="sm" disabledReason={`${c.id}: ${c.compliance}.`}>Hold</ActionButton>}
              </li>
            )
          })}
        </ol>
      </Panel>
    </div>
  )
}

function SiteSurvey() {
  const photo = `${assetPathPrefix}/survey`
  return (
    <Panel title="Survey report" description={<Badge tone="success" size="sm">Done</Badge>}>
      <KeyValues items={[{ label: 'Surveyor', value: 'Amol Deshpande' }, { label: 'Ground', value: 'Compacted, good for a 14 T crane' }, { label: 'Access', value: 'Gate 2 only. 6 m wide.' }]} />
      <ul className="mt-5 grid grid-cols-2 gap-3">
        {[['1', 'Crane position, Tower B'], ['2', 'Access road from Gate 2']].map(([n, caption]) => (
          <li key={n}>
            <figure className="overflow-hidden rounded-lg border border-border bg-surface-sunken">
              <img src={`${photo}-${n}.svg`} alt={caption} className="aspect-[2/1] w-full object-cover" />
              <figcaption className="px-3 py-2 text-xs text-foreground-secondary">{caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function QuoteDrawer({ q, onClose }: { q: Quote | null; onClose: () => void }) {
  const { record } = useWorkspace()
  if (!q) return null
  const x = totals(q)
  const v3 = q.v === 'v3'
  const row = (label: string, value: string, cls?: string) => (
    <div className={cn('flex justify-between', cls)}><dt className="text-muted-foreground">{label}</dt><dd>{value}</dd></div>
  )
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="end" className="max-w-2xl" title={`${QUOTE} ${q.v} · ${q.status}`} description="Pride Group, Hinjawadi Phase 3, Tower B">
        <div className="flex flex-col gap-5 p-5">
          {v3 && <div className="-mt-3"><ApprovalBanner record={record} /></div>}
          <section aria-labelledby="q-lines">
            <h3 id="q-lines" className="mb-2 text-sm font-semibold text-foreground">Line items</h3>
            <table className="w-full rounded-lg border border-border text-sm">
              <caption className="sr-only">Line items</caption>
              <thead><tr className="border-b border-border-subtle text-xs text-muted-foreground"><th scope="col" className="px-3 py-2 text-start font-medium">Item</th><th scope="col" className="px-3 py-2 text-end font-medium">Qty</th><th scope="col" className="px-3 py-2 text-end font-medium">Rate</th><th scope="col" className="px-3 py-2 text-end font-medium">Amount</th></tr></thead>
              <tbody className="[&_td]:px-3 [&_td]:py-2.5">
                <tr className="border-b border-border-subtle"><td>ACE NX360 daily hire, with operator and fuel</td><td className="text-end">5 days</td><td className="text-end">{formatINR(q.rate)}</td><td className="text-end">{formatINR(x.hire)}</td></tr>
                <tr><td>Transport, both ways</td><td className="text-end">1</td><td className="text-end">{formatINR(q.mob)}</td><td className="text-end">{formatINR(q.mob)}</td></tr>
              </tbody>
            </table>
          </section>
          <dl className="flex flex-col gap-1.5 rounded-lg border border-border p-4 text-sm">
            {row('Subtotal', formatINR(x.sub))}
            {v3 && row('Discount, 8%', `−${formatINR(x.disc)}`, 'text-warning')}
            {row('GST, 18%', formatINR(x.gst))}
            {!!x.roundOff && row('Round off', `−${formatINR(-x.roundOff)}`)}
            <div className="mt-2 flex justify-between border-t border-border-subtle pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatINR(x.total)}</dd></div>
          </dl>
          {v3 && (
            <section aria-labelledby="q-neg">
              <h3 id="q-neg" className="mb-2 text-sm font-semibold text-foreground">Negotiation</h3>
              <ol className="flex flex-col gap-2">
                {[
                  ['Pride Group', 'Today, 10:40', 'Your rate is above our other offer. Counter-offer: 8% off v2.'],
                  ['Neha Patil', 'Today, 10:52', 'We can do 8% on this job if they confirm today.'],
                  ['System', 'Today, 10:55', 'The rate falls to ₹29,440 a day, below the ₹30,000 floor in PR-14. Approval requested.'],
                ].map(([who, when, text]) => (
                  <li key={when} className="rounded-lg border border-border bg-surface-subtle px-3.5 py-3">
                    <p className="text-xs"><span className="font-semibold text-foreground">{who}</span> <span className="text-muted-foreground">{when}</span></p>
                    <p className="mt-1 text-sm text-foreground">{text}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
            <ActionBar actions={['Mark lost']} />
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Quotations() {
  const s = useStore()
  const [params, setParams] = useSearchParams()
  const open = quotes.find((q) => q.v === params.get('quote')) ?? null
  const state = s.approvals[APPROVAL]
  const label = (q: Quote) => (q.v !== 'v3' || state === 'pending' ? q.status : state === 'approved' ? 'Approved' : 'Rejected')
  return (
    <>
      <Panel title={`Quotation ${QUOTE}`} description="Open a version to see lines, tax and negotiation." bodyClassName="pb-1">
        <SimpleTable
          caption="Quotation versions"
          columns={[{ key: 'v', label: 'Version' }, { key: 'status', label: 'Status' }, { key: 'date', label: 'Date' }, { key: 'rate', label: 'Daily rate', align: 'end' }, { key: 'total', label: 'Total incl. GST', align: 'end' }]}
          rows={quotes.map((q) => ({
            v: `${QUOTE} ${q.v}`,
            status: <Badge tone={q.v === 'v3' && state === 'approved' ? 'success' : q.v === 'v3' && state === 'rejected' ? 'danger' : q.tone} size="sm">{label(q)}</Badge>,
            date: q.date,
            rate: formatINR(Math.round(q.rate * (1 - q.discount))),
            total: formatINR(totals(q).total),
          }))}
          onRowClick={(i) => setParams({ quote: quotes[i].v })}
          rowLabel={(i) => `Open ${QUOTE} ${quotes[i].v}`}
        />
      </Panel>
      <QuoteDrawer q={open} onClose={() => { params.delete('quote'); setParams(params, { replace: true }) }} />
    </>
  )
}

function FollowUps() {
  const s = useStore()
  const tasks = [
    { id: 'f1', title: 'Call Pride Group about the Gate 2 access', due: 'Yesterday', overdue: true },
    { id: 'f2', title: 'Reply on Book My Crane', due: 'Today, in 3 h' },
    { id: 'f3', title: 'Share the lift plan with the site', due: 'Tomorrow' },
  ]
  return (
    <Panel title="Follow-ups" bodyClassName="p-0">
      <ul>
        {tasks.map((k) => {
          const done = !!s.completedTasks[k.id]
          const late = k.overdue && !done
          return (
            <li key={k.id} className={cn('flex items-start gap-3 border-b border-border-subtle px-5 py-3.5 last:border-0', late && 'bg-danger-soft')}>
              <Checkbox id={k.id} checked={done} onCheckedChange={() => s.toggleTask(k.id)} className="mt-0.5" />
              <div>
                <label htmlFor={k.id} className={cn('block text-sm font-medium', done ? 'text-muted-foreground line-through' : 'text-foreground')}>{k.title}</label>
                <p className={cn('mt-0.5 flex items-center gap-1.5 text-xs', late ? 'font-medium text-danger' : 'text-muted-foreground')}>
                  <Clock className="size-3.5" aria-hidden />
                  {late ? 'Overdue · ' : ''}Due {k.due}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

function Documents() {
  return <FileList docs={[{ name: `${QUOTE}-v2.pdf`, kind: 'pdf', size: '214 KB', by: 'Neha Patil', when: 'Yesterday' }, { name: 'Site-survey-report.pdf', kind: 'pdf', size: '3.1 MB', by: 'Amol Deshpande', when: '2 days ago' }]} />
}

function History() {
  return <Timeline items={[{ what: 'Countered v2 and asked for 8% off', who: 'Pride Group', when: 'Today, 10:40', tone: 'brand' }, { what: `Sent ${QUOTE} v2`, who: 'Neha Patil', when: 'Yesterday' }, { what: 'Completed the site survey', who: 'Amol Deshpande', when: '2 days ago', tone: 'success' }, { what: 'Enquiry received', who: 'Book My Crane', when: '4 days ago' }]} />
}

function Extras() {
  const s = useStore()
  const navigate = useNavigate()
  const { action, runAction, record } = useWorkspace()
  React.useEffect(() => {
    if (action === 'open-booking') {
      runAction(null)
      navigate('/bookings/bookings/BK-2207/overview')
    }
  }, [action, navigate, runAction])
  if (record.id !== HERO) return null
  return (
    <Dialog open={action === 'create-booking'} onOpenChange={(o) => !o && runAction(null)}>
      <DialogContent className="max-w-2xl">
        <form
          className="contents"
          onSubmit={(e) => {
            e.preventDefault()
            s.setEnqStage('won')
            s.setBookingCreated(true)
            s.toast('Booking BK-2207 created')
            runAction(null)
            navigate('/bookings/bookings/BK-2207/overview')
          }}
        >
          <DialogHeader>
            <DialogTitle>Mark won and create booking</DialogTitle>
            <DialogDescription>Prefilled from the requirement and {QUOTE} v3.</DialogDescription>
          </DialogHeader>
          <DialogBody className="grid grid-cols-2 gap-4">
            <Field label="Customer" htmlFor="bk-c"><Input id="bk-c" defaultValue="Pride Group" readOnly /></Field>
            <Field label="Site" htmlFor="bk-s"><Input id="bk-s" defaultValue="Hinjawadi Phase 3, Tower B" readOnly /></Field>
            <Field label="Crane" htmlFor="bk-cr"><Input id="bk-cr" defaultValue={`${s.heldCrane ?? 'CR-025'} · ACE NX360`} /></Field>
            <Field label="Booking type" htmlFor="bk-t"><Input id="bk-t" defaultValue="Daily hire" readOnly /></Field>
            <Field label="Daily rate" htmlFor="bk-r"><Input id="bk-r" defaultValue="₹29,440" readOnly /></Field>
            <Field label="Value incl. GST" htmlFor="bk-v"><Input id="bk-v" defaultValue="₹1,86,000" readOnly /></Field>
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => runAction(null)}>Cancel</Button>
            <Button type="submit" variant="primary">Create booking</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const enquiryModule: TypeModule = {
  tabs: { overview: hero(Overview), 'requirement-matching': hero(Requirement), 'site-survey': hero(SiteSurvey), quotations: hero(Quotations), 'follow-ups': hero(FollowUps), documents: hero(Documents), history: hero(History) },
  live: (r: RecordData, s) => {
    if (r.id !== HERO) return r
    const stage = s.enqStage
    const pending = s.approvals[APPROVAL] === 'pending'
    return {
      ...r,
      stage,
      status: stage === 'won' ? { label: 'Won', tone: 'success' } : stage === 'lost' ? { label: 'Lost', tone: 'danger' } : r.status,
      closed: stage === 'lost',
      blocked: pending && stage === 'negotiation' ? { stage, reason: 'Discount approval' } : undefined,
      approval: stage === 'negotiation' ? r.approval : undefined,
      linked: s.bookingCreated ? ['BK-2207', ...r.linked] : r.linked,
      activity: s.bookingCreated ? [{ who: 'Rakesh Kulkarni', what: 'Won. Booking BK-2207 created', when: 'Today' }, ...(r.activity ?? [])] : r.activity,
    }
  },
  meta: (r, s): Record<string, TabMeta> => {
    if (r.id !== HERO) return {}
    const pending = s.approvals[APPROVAL] === 'pending'
    return {
      quotations: { count: 3, ...(pending ? { attention: 'warning', attentionLabel: 'Discount approval pending' } : {}) },
      'follow-ups': { count: 3, ...(!s.completedTasks.f1 ? { attention: 'danger', attentionLabel: '1 overdue' } : {}) },
    }
  },
  primaryBlocked: (r, s) => {
    if (r.id !== HERO || s.enqStage !== 'negotiation') return null
    const state = s.approvals[APPROVAL]
    return state === 'pending' ? 'Waiting for approval of v3.' : state === 'rejected' ? 'v3 was rejected. Revise the quote first.' : null
  },
  next: (r, s, ctx: WsCtx) => {
    if (r.id !== HERO) return null
    if (s.enqStage === 'won') return { title: 'Booking BK-2207 created', cta: { label: 'Open BK-2207', onClick: () => ctx.runAction('open-booking') } }
    if (s.approvals[APPROVAL] === 'pending') return { title: 'Approve the discount on v3', detail: 'The customer asked for 8% off, below PR-14.', due: 'Response due in 3 h', tone: 'warning', cta: { label: 'Open v3', onClick: () => ctx.goTab('quotations', '?quote=v3') } }
    return { title: 'Mark won → create booking', detail: 'v3 is approved.', due: 'Response due in 3 h', tone: 'warning', cta: { label: 'Create booking', onClick: () => ctx.runAction('create-booking') } }
  },
  Extras,
}
