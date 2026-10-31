import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { RadioGroup as R } from 'radix-ui'
import {
  ArrowRight,
  Ban,
  Camera,
  CircleAlert,
  CircleCheck,
  Clock,
  FastForward,
  FilePlus2,
  MapPin,
  MessageSquareQuote,
  Pencil,
  Plus,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  UserRound,
} from 'lucide-react'
import { useStore, ENQ_STAGES, type EnquiryStage } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import { craneMatches, type RecordData } from '@/data/records'
import { photos } from '@/data/photos'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox, Segmented } from '@/components/ui/controls'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/menu'
import { createSignal } from '@/lib/signal'
import { formatINR } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useWorkspace, type TabMeta, type TypeModule, type WsCtx } from '@/workspace/context'
import { Panel, KeyValues, SimpleTable, FileList, Timeline } from '@/workspace/ui'
import { ActionButton } from '@/workspace/ActionButton'
import { ApprovalBanner } from '@/workspace/ApprovalBanner'
import { LinkedChip } from '@/workspace/RightRail'
import { only } from '@/workspace/PlaceholderTab'

const HERO = 'ENQ-1042'
type Deadline = 'close' | 'overdue' | 'ok'
export const deadlineSignal = createSignal<Deadline>('close')

const stageLabel: Record<EnquiryStage, string> = {
  new: 'New',
  requirement: 'Requirement',
  survey: 'Site survey',
  quotation: 'Quotation',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
}
const order = (s: EnquiryStage) => ENQ_STAGES.indexOf(s)

const heroOnly = (C: React.ComponentType) => only(HERO, C)

function DeadlineChip({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const t = useT()
  const d = deadlineSignal.use()
  const map = {
    ok: { tone: 'success' as const, icon: CircleCheck, text: '6 h 10 m left', label: 'On track' },
    close: { tone: 'warning' as const, icon: Clock, text: '1 h 50 m left', label: 'Due soon' },
    overdue: { tone: 'danger' as const, icon: CircleAlert, text: 'Overdue by 25 min', label: 'Overdue' },
  }[d]
  return (
    <div className={cn('flex flex-wrap items-center gap-2', size === 'lg' && 'mt-1')}>
      <span className="text-sm font-semibold text-foreground">
        {t('Today')} <Ltr>16:30</Ltr>
      </span>
      <Badge tone={map.tone} icon={map.icon}>
        {t(map.label)}: <Ltr>{t(map.text)}</Ltr>
      </Badge>
    </div>
  )
}

// ---------------- Overview ----------------
function Overview() {
  const t = useT()
  const s = useStore()
  const ctx = useWorkspace()
  const pending = s.approvals['APR-QT-2231'] === 'pending'
  const stage = s.enqStage
  const nx = enquiryModule.next!(ctx.record, s, ctx)
  const blocking =
    stage === 'lost'
      ? `${t('Closed as lost')}: ${s.lostReason ?? ''}`
      : pending && (stage === 'quotation' || stage === 'negotiation')
        ? t('Discount approval on QT-2231 v2, waiting for Priya Nair')
        : null
  const qs = [
    { q: 'Where is it now?', a: <><span className="font-semibold">{t(stageLabel[stage])}</span>{order(stage) >= 3 && <span className="text-muted-foreground"> · v2 {t('sent')} <Ltr>6 Nov</Ltr></span>}</> },
    { q: "What's next?", a: nx ? t(nx.title) : t('Nothing, enquiry closed') },
    { q: 'Who owns it?', a: <>Rohan Kulkarni <span className="text-muted-foreground">· {t('Sales executive')}</span></> },
    {
      q: "What's blocking it?",
      a: blocking ? (
        <span className="inline-flex items-start gap-1.5 text-danger">
          <Ban className="mt-0.5 size-4 shrink-0" aria-hidden />
          {blocking}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-success">
          <CircleCheck className="size-4" aria-hidden />
          {t('Nothing blocking')}
        </span>
      ),
    },
    { q: "When is it due?", a: <><span className="text-xs text-muted-foreground">{t('Book My Crane response deadline')}</span><DeadlineChip size="lg" /></> },
  ]
  return (
    <div className="flex flex-col gap-4">
      <section aria-label={t('At a glance')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {qs.map((x) => (
          <div key={x.q} className="rounded-xl border border-border bg-surface p-4 shadow-xs">
            <p className="text-xs font-medium text-muted-foreground">{t(x.q)}</p>
            <div className="mt-1.5 text-sm text-foreground">{x.a}</div>
          </div>
        ))}
      </section>
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title={t('Requirement summary')} className="xl:col-span-2" actions={<Button size="sm" variant="ghost" onClick={() => ctx.goTab('requirement-matching')}>{t('Open')} <ArrowRight className="dir-icon" aria-hidden /></Button>}>
          <KeyValues
            items={[
              { label: 'Crane', value: '100 T crawler, min. 90 T at 18 m' },
              { label: 'Dates', value: '12 – 29 Nov 2025 (18 days)', ltr: true },
              { label: 'Hours', value: '10 h/day, day shift' },
              { label: 'Load', value: '64 precast girders, max 42 T' },
              { label: 'Site', value: <LinkedChip id="SITE-311" /> },
              { label: 'Matched crane', value: s.selectedCrane ? <LinkedChip id={s.selectedCrane} /> : <span className="text-warning">{t('Not picked yet')}</span> },
            ]}
          />
        </Panel>
        <Panel title={t('Customer')}>
          <div className="flex flex-col gap-3 text-sm">
            <LinkedChip id="CUS-0184" />
            <div>
              <p className="font-medium text-foreground">Amit Deshmukh</p>
              <p className="text-muted-foreground">{t('Project manager')}</p>
              <p className="mt-1 text-foreground"><Ltr>+91 98220 41187</Ltr></p>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('Book My Crane ref')} <Ltr className="font-medium text-foreground">BMC-PN-58213</Ltr> · {t('Rating')} <Ltr>4.4 / 5</Ltr>
            </p>
          </div>
        </Panel>
      </div>
      <Panel title={t('Quotation status')} actions={<Button size="sm" variant="ghost" onClick={() => ctx.goTab('quotations')}>{t('Open quotations')} <ArrowRight className="dir-icon" aria-hidden /></Button>}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">{t('Latest version')}</p>
            <p className="mt-0.5 text-sm font-semibold"><Ltr>QT-2231 v2</Ltr> · {t('Sent')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('Quoted (before tax)')}</p>
            <p className="mt-0.5 text-sm font-semibold"><Ltr>{formatINR(920000)}</Ltr></p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('Customer asked')}</p>
            <p className="mt-0.5 text-sm font-semibold text-warning"><Ltr>12%</Ltr> {t('discount')} · <Ltr>{formatINR(809600)}</Ltr></p>
          </div>
        </div>
      </Panel>
    </div>
  )
}

// ---------------- Requirement & matching ----------------
function Photos({ items }: { items: { src: string; alt: string; caption: string }[] }) {
  const t = useT()
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((p) => (
        <li key={p.src}>
          <figure className="overflow-hidden rounded-lg border border-border bg-surface-sunken">
            <img src={p.src} alt={p.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <figcaption className="flex items-center gap-1.5 px-2.5 py-2 text-xs text-foreground-secondary">
              <Camera className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="truncate">{t(p.caption)}</span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}

function Requirement() {
  const t = useT()
  const s = useStore()
  const { setDirty, readOnly } = useWorkspace()
  const [editing, setEditing] = React.useState(false)
  const [hours, setHours] = React.useState('10 h/day, 07:00 – 17:00')
  const [notes, setNotes] = React.useState('Girders arrive by trailer from Chakan yard, 4 per day. Customer provides rigging supervisor.')
  const dirty = (s.dirty[HERO] ?? []).includes('requirement-matching')
  const mark = () => setDirty('requirement-matching', true)
  return (
    <div className="flex flex-col gap-4">
      <Panel
        title={t('Requirement')}
        description={t('Captured from Book My Crane and confirmed on call, 1 Nov')}
        actions={
          editing ? (
            <>
              <Button size="sm" onClick={() => { setEditing(false); setDirty('requirement-matching', false) }}>{t('Cancel')}</Button>
              <Button size="sm" variant="primary" disabled={!dirty} onClick={() => { setEditing(false); setDirty('requirement-matching', false); s.toast(t('Requirement saved')) }}>{t('Save')}</Button>
            </>
          ) : (
            <ActionButton size="sm" disabledReason={readOnly ? t('This record is closed and read-only.') : null} onClick={() => setEditing(true)}>
              <Pencil aria-hidden />
              {t('Edit')}
            </ActionButton>
          )
        }
      >
        <KeyValues
          cols={4}
          items={[
            { label: 'Service model', value: t('Daily hire') },
            { label: 'Crane type', value: t('Crawler crane') },
            { label: 'Capacity', value: '100 T (min. 90 T at 18 m radius)' },
            { label: 'Site', value: <LinkedChip id="SITE-311" /> },
            { label: 'Dates', value: '12 – 29 Nov 2025 · 18 days', ltr: true },
            { label: 'Hours', value: editing ? <Input aria-label={t('Hours')} value={hours} onChange={(e) => { setHours(e.target.value); mark() }} /> : <Ltr>{hours}</Ltr> },
            { label: 'Shift', value: t('Day shift') },
            { label: 'Operator', value: t('Included, crawler-certified and site-inducted') },
            { label: 'Fuel', value: t('By provider, included in rate') },
            { label: 'Transport', value: t('Both ways included, 3 trailers plus assist crane') },
            { label: 'Load details', value: '64 precast I-girders · max 42 T · 26 m long · lift height 22 m', wide: true },
            {
              label: 'Notes',
              wide: true,
              value: editing ? <Textarea aria-label={t('Notes')} value={notes} onChange={(e) => { setNotes(e.target.value); mark() }} /> : notes,
            },
          ]}
        />
        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-muted-foreground">{t('Photos from customer')} (<Ltr>3</Ltr>)</p>
          <Photos
            items={[
              { ...photos.concrete, caption: 'Depot structure, bay 4' },
              { ...photos.bridge, caption: 'Girder seat level, 22 m' },
              { ...photos.siteRoad, caption: 'Access road from Gate 2' },
            ]}
          />
        </div>
      </Panel>

      <Panel title={t('Ranked crane matches')} description={t('Scored on capacity at radius, dates, distance, compliance and cost')} bodyClassName="p-0">
        <ol>
          {craneMatches.map((c, i) => {
            const selected = s.selectedCrane === c.id
            return (
              <li key={c.id} className={cn('flex flex-col gap-3 border-b border-border-subtle px-5 py-4 last:border-0 md:flex-row md:items-center', selected && 'bg-brand-soft/60')}>
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className={cn('inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold', i === 0 ? 'bg-brand-deep text-white' : 'bg-neutral-soft text-foreground-secondary')}>
                    <Ltr>{i + 1}</Ltr>
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                      <Ltr>{c.id}</Ltr> · {c.name}
                      {selected && <Badge tone="brand" icon={CircleCheck} size="sm">{t('Selected for quote')}</Badge>}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{t(c.note)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone={c.availTone} size="sm">{t(c.availability)}</Badge>
                      <Badge tone={c.compliant ? 'success' : 'danger'} icon={c.compliant ? ShieldCheck : Ban} size="sm">
                        {c.compliant ? t('Compliant') : t('Non-compliant')}: {t(c.compliance)}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5" aria-hidden /><Ltr>{c.distance}</Ltr></span>
                      <span className="text-xs text-muted-foreground"><Ltr>{c.rate}</Ltr></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:w-64 md:justify-end">
                  <div className="w-24" aria-label={`${t('Match score')} ${c.score}`}>
                    <div className="flex justify-between text-xs text-muted-foreground"><span>{t('Score')}</span><Ltr className="font-semibold text-foreground">{c.score}</Ltr></div>
                    <div className="mt-1 h-1.5 rounded-full bg-neutral-soft"><div className={cn('h-full rounded-full', c.compliant ? 'bg-success-solid' : 'bg-danger-solid')} style={{ width: `${c.score}%` }} /></div>
                  </div>
                  <ActionButton
                    size="sm"
                    variant={selected ? 'soft' : 'secondary'}
                    disabledReason={!c.compliant ? `${c.id}: ${t(c.compliance)}. ${t('Re-inspect before quoting.')}` : readOnly ? t('This record is closed and read-only.') : null}
                    onClick={() => {
                      s.setSelectedCrane(selected ? null : c.id)
                      if (!selected) s.toast(`${c.id} ${t('selected for QT-2231')}`)
                    }}
                    aria-pressed={selected}
                  >
                    {selected ? t('Selected') : t('Select')}
                  </ActionButton>
                </div>
              </li>
            )
          })}
        </ol>
      </Panel>
    </div>
  )
}

// ---------------- Site survey ----------------
function SiteSurvey() {
  const t = useT()
  const s = useStore()
  const { runAction, readOnly } = useWorkspace()
  if (s.surveyNotRequired)
    return (
      <Panel title={t('Site survey not required')} actions={<Button size="sm" disabled={readOnly} onClick={() => s.setSurveyNotRequired(null)}>{t('Undo')}</Button>}>
        <p className="text-sm text-foreground">
          <span className="font-medium">{t('Reason')}:</span> {s.surveyNotRequired}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{t('Marked by')} Priya Nair · <Ltr>{t('Today')}</Ltr></p>
      </Panel>
    )
  return (
    <div className="flex flex-col gap-4">
      <Panel
        title={t('Survey report')}
        description={<><Badge tone="success" size="sm">{t('Completed')}</Badge></>}
        actions={<Button size="sm" variant="ghost" disabled={readOnly} onClick={() => runAction('survey-not-required')}>{t('Mark as not required')}</Button>}
      >
        <KeyValues
          items={[
            { label: 'Date', value: '5 Nov 2025, 11:00 – 13:30', ltr: true },
            { label: 'Surveyor', value: 'Imran Shaikh, Operations planner' },
            { label: 'Customer contact', value: 'Amit Deshmukh' },
            { label: 'Summary', wide: true, value: t('Crawler can work from the east pad between bays 3 and 5. Ground needs steel mats under tracks. Assist crane needed for boom assembly on the access road. Trailer must enter by Gate 2.') },
          ]}
        />
        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-muted-foreground">{t('Survey photos')} (<Ltr>3</Ltr>)</p>
          <Photos
            items={[
              { ...photos.craneBuilding, caption: 'East pad, crane position' },
              { ...photos.craneOrange, caption: 'Boom swing clearance' },
              { ...photos.siteRoad, caption: 'Assembly area on access road' },
            ]}
          />
        </div>
      </Panel>
      <Panel title={t('Site restrictions')}>
        <ul className="flex flex-col gap-3">
          {[
            { icon: CircleAlert, tone: 'danger', text: '11 kV overhead line 14 m north of the crane pad. Keep 6 m clearance, spotter required.' },
            { icon: CircleAlert, tone: 'warning', text: 'Ground bearing 22 T/m². Steel mats 6 × 1.5 m needed under both tracks.' },
            { icon: Clock, tone: 'neutral', text: 'Working hours 07:00 to 19:00. No heavy vehicle entry 08:30 to 10:30 (school traffic on Maan Road).' },
            { icon: MapPin, tone: 'neutral', text: 'Gate 1 is 6 m wide; trailers must use Gate 2. Gate pass needed 24 h before arrival.' },
          ].map((r) => (
            <li key={r.text} className="flex items-start gap-3 text-sm text-foreground">
              <r.icon className={cn('mt-0.5 size-4 shrink-0', r.tone === 'danger' ? 'text-danger' : r.tone === 'warning' ? 'text-warning' : 'text-muted-foreground')} aria-hidden />
              {t(r.text)}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

// ---------------- Quotations ----------------
type Quote = { v: string; status: string; tone: 'neutral' | 'info' | 'brand' | 'warning'; date: string; rate: number; mob: number; validity: string; by: string }
const quotes: Quote[] = [
  { v: 'v2', status: 'Sent', tone: 'info', date: '6 Nov 2025', rate: 45000, mob: 55000, validity: '13 Nov 2025', by: 'Rohan Kulkarni' },
  { v: 'v1', status: 'Revised', tone: 'neutral', date: '2 Nov 2025', rate: 48000, mob: 65000, validity: '9 Nov 2025', by: 'Rohan Kulkarni' },
]
const v3: Quote = { v: 'v3', status: 'Draft', tone: 'neutral', date: '11 Nov 2025', rate: 39600, mob: 55000, validity: '18 Nov 2025', by: 'Priya Nair' }

function quoteTotals(q: Quote, discount: number) {
  const hire = q.rate * 18
  const sub = hire + q.mob * 2
  const disc = Math.round(sub * discount)
  const taxable = sub - disc
  const gst = Math.round(taxable * 0.18)
  return { hire, sub, disc, taxable, gst, total: taxable + gst }
}

function QuoteDrawer({ q, onClose }: { q: Quote | null; onClose: () => void }) {
  const t = useT()
  const s = useStore()
  const { record, runAction } = useWorkspace()
  if (!q) return null
  const isV2 = q.v === 'v2'
  const discount = isV2 ? 0.12 : 0
  const x = quoteTotals(q, discount)
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="end"
        className="max-w-2xl"
        title={<><Ltr>QT-2231 {q.v}</Ltr> · {t(q.status)}</>}
        description={`${t('Prepared by')} ${q.by} · ${q.date} · ${t('Valid until')} ${q.validity}`}
      >
        <div className="flex flex-col gap-5 p-5">
          {isV2 && <div className="-mt-3"><ApprovalBanner record={record} /></div>}
          <section aria-labelledby="q-lines">
            <h3 id="q-lines" className="mb-2 text-sm font-semibold text-foreground">{t('Line items')}</h3>
            <div className="rounded-lg border border-border">
              <table className="w-full text-sm">
                <caption className="sr-only">{t('Line items')}</caption>
                <thead>
                  <tr className="border-b border-border-subtle text-xs text-muted-foreground">
                    <th scope="col" className="px-3 py-2 text-start font-medium">{t('Item')}</th>
                    <th scope="col" className="px-3 py-2 text-end font-medium">{t('Qty')}</th>
                    <th scope="col" className="px-3 py-2 text-end font-medium">{t('Rate')}</th>
                    <th scope="col" className="px-3 py-2 text-end font-medium">{t('Amount')}</th>
                  </tr>
                </thead>
                <tbody className="[&_td]:px-3 [&_td]:py-2.5">
                  <tr className="border-b border-border-subtle"><td>{t('100 T crawler, daily hire with operator and fuel')}<p className="text-xs text-muted-foreground"><Ltr>{s.selectedCrane ?? 'CR-050'}</Ltr> · 10 h/day</p></td><td className="text-end"><Ltr>18 days</Ltr></td><td className="text-end"><Ltr>{formatINR(q.rate)}</Ltr></td><td className="text-end"><Ltr>{formatINR(x.hire)}</Ltr></td></tr>
                  <tr className="border-b border-border-subtle"><td>{t('Mobilisation, 3 trailers plus assist crane')}</td><td className="text-end"><Ltr>1</Ltr></td><td className="text-end"><Ltr>{formatINR(q.mob)}</Ltr></td><td className="text-end"><Ltr>{formatINR(q.mob)}</Ltr></td></tr>
                  <tr><td>{t('Demobilisation')}</td><td className="text-end"><Ltr>1</Ltr></td><td className="text-end"><Ltr>{formatINR(q.mob)}</Ltr></td><td className="text-end"><Ltr>{formatINR(q.mob)}</Ltr></td></tr>
                </tbody>
              </table>
            </div>
          </section>
          <section aria-labelledby="q-extra">
            <h3 id="q-extra" className="mb-2 text-sm font-semibold text-foreground">{t('Extra charges (if used)')}</h3>
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              {[
                ['Overtime beyond 10 h', '₹3,200 / h'],
                ['Night shift', '+25% of daily rate'],
                ['Standby if site not ready', '₹22,000 / day'],
                ['Extra rigging crew', '₹6,500 / day'],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between gap-3 rounded-lg bg-surface-subtle px-3 py-2"><span className="text-foreground-secondary">{t(k)}</span><Ltr className="font-medium">{v}</Ltr></li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="q-tax" className="rounded-lg border border-border p-4">
            <h3 id="q-tax" className="mb-3 text-sm font-semibold text-foreground">{t('Tax and total')}</h3>
            <dl className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('Subtotal')}</dt><dd><Ltr>{formatINR(x.sub)}</Ltr></dd></div>
              {isV2 && <div className="flex justify-between text-warning"><dt>{t('Requested discount')} (<Ltr>12%</Ltr>)</dt><dd><Ltr>−{formatINR(x.disc)}</Ltr></dd></div>}
              <div className="flex justify-between"><dt className="text-muted-foreground">CGST <Ltr>9%</Ltr></dt><dd><Ltr>{formatINR(x.gst / 2)}</Ltr></dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">SGST <Ltr>9%</Ltr></dt><dd><Ltr>{formatINR(x.gst / 2)}</Ltr></dd></div>
              <div className="mt-2 flex justify-between border-t border-border-subtle pt-2 text-base font-semibold"><dt>{t('Total')}</dt><dd><Ltr>{formatINR(x.total)}</Ltr></dd></div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">SAC <Ltr>997319</Ltr> · {t('Place of supply')}: {t('Maharashtra')} (<Ltr>27</Ltr>)</p>
          </section>
          <section aria-labelledby="q-terms">
            <h3 id="q-terms" className="mb-2 text-sm font-semibold text-foreground">{t('Terms')}</h3>
            <ul className="list-disc space-y-1 ps-5 text-sm text-foreground-secondary">
              <li>{t('Advance of ₹4,85,000 before mobilisation, balance billed fortnightly, 15 days credit.')}</li>
              <li>{t('Minimum hire 18 days. Ground preparation, mats placement and permits by customer.')}</li>
              <li>{t('Rates valid until')} <Ltr>{q.validity}</Ltr>. {t('Subject to crane availability on confirmation.')}</li>
            </ul>
          </section>
          {isV2 && (
            <section aria-labelledby="q-neg">
              <h3 id="q-neg" className="mb-3 text-sm font-semibold text-foreground">{t('Negotiation')}</h3>
              <ol className="flex flex-col gap-3">
                {[
                  { who: 'Amit Deshmukh, Vardhman Buildcon', when: '7 Nov, 11:20', text: 'Your rate is higher than the Chakan fleet quote at ₹40,000 per day. Can you match?', tag: 'Counter-offer: ₹40,000 / day', tone: 'info' as const, ext: true },
                  { who: 'Rohan Kulkarni', when: '7 Nov, 15:05', text: 'We cannot go to ₹40,000 for CR-050 with transport both ways. We can offer 5% if you confirm by Monday.' },
                  { who: 'Amit Deshmukh, Vardhman Buildcon', when: 'Today, 09:40', text: 'Please give 12% on v2. We have two more girder packages in Q1 2026.', tag: 'Discount request: 12%', tone: 'warning' as const, ext: true },
                  { who: 'System', when: 'Today, 10:11', text: '12% puts the daily rate at ₹39,600, below the ₹42,000 floor in pricing rule PR-14. Approval requested from Priya Nair.', sys: true },
                ].map((m, i) => (
                  <li key={i} className={cn('rounded-lg border px-3.5 py-3', m.sys ? 'border-warning/30 bg-warning-soft' : m.ext ? 'border-border bg-surface-subtle' : 'border-border bg-surface')}>
                    <p className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-foreground">{t(m.who)}</span>
                      <Ltr className="text-muted-foreground">{t(m.when)}</Ltr>
                      {m.tag && <Badge tone={m.tone} size="sm" icon={MessageSquareQuote}>{t(m.tag)}</Badge>}
                    </p>
                    <p className="mt-1 text-sm text-foreground">{t(m.text)}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <div className="sticky bottom-0 -mx-5 -mb-5 flex flex-wrap justify-end gap-2 border-t border-border-subtle bg-surface px-5 py-4">
            <Button onClick={onClose}>{t('Close')}</Button>
            {isV2 && (
              <ActionButton
                variant="primary"
                disabledReason={s.approvals['APR-QT-2231'] === 'pending' ? t('Waiting for discount approval on QT-2231 v2.') : order(s.enqStage) > 4 ? t('Response already recorded.') : null}
                onClick={() => { onClose(); runAction('record-response') }}
              >
                {t('Record response')}
              </ActionButton>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Quotations() {
  const t = useT()
  const s = useStore()
  const navigate = useNavigate()
  const { readOnly } = useWorkspace()
  const [params, setParams] = useSearchParams()
  const list = s.quoteV3 ? [v3, ...quotes] : quotes
  const open = list.find((q) => q.v === params.get('quote')) ?? null
  const pending = s.approvals['APR-QT-2231'] === 'pending'
  return (
    <div className="flex flex-col gap-4">
      <Panel
        title={<>{t('Quotation')} <Ltr>QT-2231</Ltr></>}
        description={t('Each revision is kept as a version. Open one to see lines, tax, terms and negotiation.')}
        actions={
          <ActionButton size="sm" disabledReason={readOnly ? t('This record is closed and read-only.') : null} onClick={() => navigate('/crm/enquiries/ENQ-1042/quotations/new')}>
            <FilePlus2 aria-hidden />
            {t('New version')}
          </ActionButton>
        }
        bodyClassName="pb-1"
      >
        <SimpleTable
          caption={t('Quotation versions')}
          columns={[
            { key: 'v', label: 'Version', ltr: true },
            { key: 'status', label: 'Status' },
            { key: 'date', label: 'Date', ltr: true },
            { key: 'rate', label: 'Daily rate', align: 'end', ltr: true },
            { key: 'total', label: 'Total incl. GST', align: 'end', ltr: true },
            { key: 'note', label: 'Note' },
          ]}
          rows={list.map((q) => ({
            v: `QT-2231 ${q.v}`,
            status: <Badge tone={q.tone} size="sm">{t(q.status)}</Badge>,
            date: q.date,
            rate: formatINR(q.rate),
            total: formatINR(quoteTotals(q, q.v === 'v2' && s.approvals['APR-QT-2231'] === 'approved' ? 0.12 : 0).total),
            note:
              q.v === 'v2' ? (
                pending ? <Badge tone="warning" size="sm" icon={Clock}>{t('Discount approval pending')}</Badge> : s.approvals['APR-QT-2231'] === 'approved' ? <Badge tone="success" size="sm">{t('12% discount approved')}</Badge> : <Badge tone="danger" size="sm">{t('Discount rejected')}</Badge>
              ) : q.v === 'v1' ? <span className="text-xs text-muted-foreground">{t('Superseded by v2')}</span> : <span className="text-xs text-muted-foreground">{t('Not sent')}</span>,
          }))}
          onRowClick={(i) => setParams({ quote: list[i].v })}
          rowLabel={(i) => `${t('Open')} QT-2231 ${list[i].v}`}
        />
      </Panel>
      <QuoteDrawer q={open} onClose={() => { params.delete('quote'); setParams(params, { replace: true }) }} />
    </div>
  )
}

// ---------------- Follow-ups ----------------
function FollowUps() {
  const t = useT()
  const s = useStore()
  const { readOnly } = useWorkspace()
  const [extra, setExtra] = React.useState<{ id: string; title: string; due: string }[]>([])
  const [title, setTitle] = React.useState('')
  const tasks = [
    { id: 'f1', title: 'Call Amit Deshmukh to confirm Gate 2 access for trailers', due: '10 Nov 2025', state: 'overdue', note: '1 day overdue' },
    { id: 'f2', title: 'Reply on Book My Crane before the response deadline', due: 'Today, 16:30', state: 'soon', note: 'Due today' },
    { id: 'f3', title: 'Send revised v2 with the approved discount', due: 'Today, 18:00', state: 'open', note: '' },
    { id: 'f4', title: 'Share draft lift plan with Vardhman safety officer', due: '13 Nov 2025', state: 'open', note: '' },
    ...extra.map((e) => ({ ...e, state: 'open', note: '' })),
  ]
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Panel title={t('Follow-ups')} description={t('Sorted by due date')} className="xl:col-span-2" bodyClassName="p-0">
        <ul>
          {tasks.map((k) => {
            const done = !!s.completedTasks[k.id]
            const overdue = k.state === 'overdue' && !done
            return (
              <li key={k.id} className={cn('flex items-start gap-3 border-b border-border-subtle px-5 py-3.5 last:border-0', overdue && 'bg-danger-soft')}>
                <Checkbox id={k.id} checked={done} disabled={readOnly} onCheckedChange={() => s.toggleTask(k.id)} className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <label htmlFor={k.id} className={cn('block text-sm font-medium', done ? 'text-muted-foreground line-through' : 'text-foreground')}>{t(k.title)}</label>
                  <p className={cn('mt-0.5 flex flex-wrap items-center gap-1.5 text-xs', overdue ? 'font-medium text-danger' : 'text-muted-foreground')}>
                    {overdue ? <CircleAlert className="size-3.5" aria-hidden /> : <Clock className="size-3.5" aria-hidden />}
                    {t('Due')} <Ltr>{t(k.due)}</Ltr>
                    {k.note && !done && <span>· {t(k.note)}</span>}
                    {done && <span>· {t('Done')}</span>}
                  </p>
                </div>
                <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex"><UserRound className="size-3.5" aria-hidden />Rohan Kulkarni</span>
              </li>
            )
          })}
          <li className="flex items-center gap-3 px-5 py-3.5 text-sm text-muted-foreground">
            <CircleCheck className="size-4 text-success" aria-hidden />
            <span className="line-through">{t('Site survey with Imran Shaikh')}</span>
            <Ltr className="text-xs">5 Nov</Ltr>
          </li>
        </ul>
      </Panel>
      <Panel title={t('Add follow-up')}>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!title.trim()) return
            setExtra((p) => [...p, { id: `x${p.length}`, title, due: '14 Nov 2025' }])
            setTitle('')
            s.toast(t('Follow-up added'))
          }}
        >
          <Field label={t('Task')} htmlFor="fu-title">
            <Input id="fu-title" value={title} disabled={readOnly} onChange={(e) => setTitle(e.target.value)} placeholder={t('For example, confirm crane mats delivery')} />
          </Field>
          <Field label={t('Due date')} htmlFor="fu-due">
            <Input id="fu-due" type="date" defaultValue="2025-11-14" disabled={readOnly} />
          </Field>
          <Button type="submit" variant="primary" disabled={readOnly}><Plus aria-hidden />{t('Add')}</Button>
        </form>
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
        { name: 'QT-2231-v2.pdf', kind: 'pdf', size: '214 KB', by: 'Rohan Kulkarni', when: '6 Nov 2025' },
        { name: 'QT-2231-v1.pdf', kind: 'pdf', size: '208 KB', by: 'Rohan Kulkarni', when: '2 Nov 2025' },
        { name: 'Site-survey-report-SITE-311.pdf', kind: 'pdf', size: '3.1 MB', by: 'Imran Shaikh', when: '5 Nov 2025' },
        { name: 'Girder-schedule-Vardhman.xlsx', kind: 'xls', size: '86 KB', by: 'Amit Deshmukh', when: '1 Nov 2025' },
        { name: 'Depot-layout-drawing-rev-C.pdf', kind: 'pdf', size: '1.8 MB', by: 'Amit Deshmukh', when: '1 Nov 2025' },
        { name: 'East-pad-photo-01.jpg', kind: 'img', size: '2.4 MB', by: 'Imran Shaikh', when: '5 Nov 2025' },
        { name: 'Vardhman-GST-certificate.pdf', kind: 'pdf', size: '120 KB', by: 'Rohan Kulkarni', when: '1 Nov 2025' },
      ]}
    />
  )
}

function History() {
  return (
    <Timeline
      items={[
        { what: 'Approval requested for 12% discount on QT-2231 v2', who: 'System', when: 'Today, 10:11', tone: 'brand' },
        { what: 'Customer requested 12% discount', who: 'Vardhman Buildcon', when: 'Today, 09:40' },
        { what: 'Counter-offer received at ₹40,000 per day', who: 'Vardhman Buildcon', when: '7 Nov, 11:20' },
        { what: 'QT-2231 v2 sent to customer', who: 'Rohan Kulkarni', when: '6 Nov, 17:05', tone: 'success' },
        { what: 'Site survey completed', who: 'Imran Shaikh', when: '5 Nov, 13:30', tone: 'success' },
        { what: 'QT-2231 v1 sent', who: 'Rohan Kulkarni', when: '2 Nov, 12:40' },
        { what: 'Requirement captured and stage moved to Requirement', who: 'Rohan Kulkarni', when: '1 Nov, 11:05' },
        { what: 'Enquiry received from Book My Crane (BMC-PN-58213)', who: 'Book My Crane', when: '1 Nov, 10:12' },
      ]}
    />
  )
}

// ---------------- Dialogs ----------------
function ChoiceCards({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; label: string; options: { value: string; title: string; body: string; icon: React.ComponentType<{ className?: string }> }[] }) {
  const t = useT()
  return (
    <R.Root value={value} onValueChange={onChange} aria-label={label} className="grid gap-2">
      {options.map((o) => (
        <R.Item
          key={o.value}
          value={o.value}
          className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3 text-start transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-ring data-[state=checked]:border-primary data-[state=checked]:bg-brand-soft"
        >
          <o.icon className="mt-0.5 size-5 shrink-0 text-foreground-secondary" aria-hidden />
          <span>
            <span className="block text-sm font-semibold text-foreground">{t(o.title)}</span>
            <span className="block text-sm text-muted-foreground">{t(o.body)}</span>
          </span>
        </R.Item>
      ))}
    </R.Root>
  )
}

function Extras() {
  const t = useT()
  const s = useStore()
  const navigate = useNavigate()
  const ctx = useWorkspace()
  const { action, runAction, record } = ctx
  const [choice, setChoice] = React.useState('won')
  const [reason, setReason] = React.useState('')
  const [reasonErr, setReasonErr] = React.useState('')
  const [lostNote, setLostNote] = React.useState('')
  const [po, setPo] = React.useState('')
  if (record.id !== HERO) return null
  const close = () => {
    runAction(null)
    setReasonErr('')
  }
  const approved = s.approvals['APR-QT-2231'] === 'approved'
  const crane = s.selectedCrane ?? 'CR-050'
  return (
    <>
      <Dialog open={action === 'record-response'} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Record customer response')}</DialogTitle>
            <DialogDescription><Ltr>QT-2231 v2</Ltr> · Vardhman Buildcon</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <ChoiceCards
              label={t('Customer response')}
              value={choice}
              onChange={setChoice}
              options={[
                { value: 'won', title: 'Won: customer accepted', body: 'Creates a booking from the requirement and accepted quote.', icon: Trophy },
                { value: 'counter', title: 'Counter-offer', body: 'Moves the enquiry to Negotiation and keeps the quote open.', icon: MessageSquareQuote },
                { value: 'lost', title: 'Lost', body: 'Closes the enquiry as read-only. A reason is required.', icon: ThumbsDown },
              ]}
            />
          </DialogBody>
          <DialogFooter>
            <Button onClick={close}>{t('Cancel')}</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (choice === 'won') runAction('create-booking')
                else if (choice === 'lost') runAction('mark-lost')
                else {
                  s.setEnqStage('negotiation')
                  s.toast(t('Moved to Negotiation'))
                  close()
                }
              }}
            >
              {t('Continue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={action === 'create-booking'} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-2xl">
          <form
            className="contents"
            onSubmit={(e) => {
              e.preventDefault()
              s.setEnqStage('won')
              s.setBookingCreated(true)
              s.toast(t('Booking BK-2207 created from ENQ-1042'))
              runAction(null)
              navigate('/bookings/bookings/BK-2207/overview', { state: { listPath: '/bookings/bookings', listLabel: 'Bookings' } })
            }}
          >
            <DialogHeader>
              <DialogTitle>{t('Create booking')}</DialogTitle>
              <DialogDescription>{t('Prefilled from the requirement and accepted quote. Check and confirm.')}</DialogDescription>
            </DialogHeader>
            <DialogBody className="grid gap-4 sm:grid-cols-2">
              <Field label={t('Customer')} htmlFor="bk-cust"><Input id="bk-cust" defaultValue="Vardhman Buildcon Pvt Ltd" readOnly /></Field>
              <Field label={t('Site')} htmlFor="bk-site"><Input id="bk-site" defaultValue="SITE-311 · Hinjewadi Phase 3 metro depot" readOnly /></Field>
              <Field label={t('Crane')} htmlFor="bk-crane" helper={t('From the selected match')}><Input id="bk-crane" defaultValue={`${crane} · 100 T crawler`} dir="ltr" /></Field>
              <Field label={t('Operator')} htmlFor="bk-op"><Input id="bk-op" defaultValue={t('Included, assigned on the work order')} /></Field>
              <Field label={t('Start')} htmlFor="bk-start"><Input id="bk-start" type="date" defaultValue="2025-11-12" dir="ltr" /></Field>
              <Field label={t('End')} htmlFor="bk-end"><Input id="bk-end" type="date" defaultValue="2025-11-29" dir="ltr" /></Field>
              <Field label={t('Daily rate')} htmlFor="bk-rate" helper={approved ? t('Includes approved 12% discount') : t('Discount not approved, list rate applies')}>
                <Input id="bk-rate" defaultValue={approved ? '₹39,600' : '₹45,000'} dir="ltr" readOnly />
              </Field>
              <Field label={t('Booking value incl. GST')} htmlFor="bk-val"><Input id="bk-val" defaultValue={approved ? '₹9,55,328' : '₹10,85,600'} dir="ltr" readOnly /></Field>
              <Field label={t('Advance due before mobilisation')} htmlFor="bk-adv"><Input id="bk-adv" defaultValue="₹4,85,000" dir="ltr" /></Field>
              <Field label={t('Customer PO number')} htmlFor="bk-po" helper={t('Optional now, needed before first invoice')}>
                <Input id="bk-po" value={po} onChange={(e) => setPo(e.target.value)} placeholder="VBPL/PO/25-26/0981" dir="ltr" />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button onClick={close}>{t('Cancel')}</Button>
              <Button type="submit" variant="primary"><ThumbsUp aria-hidden />{t('Create booking')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={action === 'mark-lost'} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <form
            className="contents"
            onSubmit={(e) => {
              e.preventDefault()
              if (!reason) return setReasonErr(t('Choose a lost reason to close the enquiry.'))
              s.setEnqStage('lost')
              s.setLostReason(t(reason) + (lostNote ? `. ${lostNote}` : ''))
              s.toast(t('ENQ-1042 closed as lost'), 'info')
              close()
            }}
          >
            <DialogHeader>
              <DialogTitle>{t('Mark enquiry as lost')}</DialogTitle>
              <DialogDescription>{t('The enquiry becomes read-only. The reason feeds the win-loss report.')}</DialogDescription>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-4">
              <fieldset aria-describedby={reasonErr ? 'lost-err' : undefined}>
                <legend className="mb-2 text-sm font-medium text-foreground">{t('Lost reason')}<span className="ms-0.5 text-danger" aria-hidden>*</span></legend>
                <R.Root value={reason} onValueChange={(v) => { setReason(v); setReasonErr('') }} className="grid gap-2 sm:grid-cols-2" aria-required>
                  {['Price too high', 'Lost to competitor', 'Crane not available', 'Project postponed', 'Customer went silent', 'Other'].map((r) => (
                    <R.Item key={r} value={r} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-start text-sm hover:border-border-strong focus-visible:outline-2 focus-visible:outline-ring data-[state=checked]:border-primary data-[state=checked]:bg-brand-soft pointer-coarse:min-h-11">
                      <span className="inline-flex size-4 items-center justify-center rounded-full border border-border-strong"><R.Indicator className="size-2 rounded-full bg-primary" /></span>
                      {t(r)}
                    </R.Item>
                  ))}
                </R.Root>
                {reasonErr && <p id="lost-err" role="alert" className="mt-2 text-sm text-danger">{reasonErr}</p>}
              </fieldset>
              <Field label={t('Details')} htmlFor="lost-note" helper={t('Optional, for example the competitor rate')}>
                <Textarea id="lost-note" value={lostNote} onChange={(e) => setLostNote(e.target.value)} />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button onClick={close}>{t('Cancel')}</Button>
              <Button type="submit" variant="destructive">{t('Mark as lost')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={action === 'survey-not-required'} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <form
            className="contents"
            onSubmit={(e) => {
              e.preventDefault()
              if (!reason.trim()) return setReasonErr(t('Add a reason so ops know why the site was not visited.'))
              s.setSurveyNotRequired(reason)
              setReason('')
              close()
            }}
          >
            <DialogHeader>
              <DialogTitle>{t('Site survey not required')}</DialogTitle>
              <DialogDescription>{t('Skipping the survey needs a reason. It is shown to the operations team.')}</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Field label={t('Reason')} htmlFor="ns-reason" required error={reasonErr}>
                <Textarea id="ns-reason" value={reason} onChange={(e) => setReason(e.target.value)} aria-invalid={!!reasonErr} placeholder={t('For example, repeat site with job JB-5490 in October')} />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button onClick={close}>{t('Cancel')}</Button>
              <Button type="submit" variant="primary">{t('Confirm')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={action === 'schedule-survey'} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <form
            className="contents"
            onSubmit={(e) => {
              e.preventDefault()
              s.setEnqStage('survey')
              s.toast(t('Site survey scheduled'))
              close()
            }}
          >
            <DialogHeader>
              <DialogTitle>{t('Schedule site survey')}</DialogTitle>
              <DialogDescription>SITE-311 · Hinjewadi Phase 3 metro depot</DialogDescription>
            </DialogHeader>
            <DialogBody className="grid gap-4 sm:grid-cols-2">
              <Field label={t('Date')} htmlFor="sv-date"><Input id="sv-date" type="date" defaultValue="2025-11-12" dir="ltr" /></Field>
              <Field label={t('Time')} htmlFor="sv-time"><Input id="sv-time" type="time" defaultValue="11:00" dir="ltr" /></Field>
              <Field label={t('Surveyor')} htmlFor="sv-who" className="sm:col-span-2"><Input id="sv-who" defaultValue="Imran Shaikh" /></Field>
            </DialogBody>
            <DialogFooter>
              <Button onClick={close}>{t('Cancel')}</Button>
              <Button type="submit" variant="primary">{t('Schedule')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function DemoControls() {
  const t = useT()
  const s = useStore()
  const { record } = useWorkspace()
  const d = deadlineSignal.use()
  if (record.id !== HERO) return null
  const nextStage = (): EnquiryStage => {
    const i = order(s.enqStage)
    return s.enqStage === 'won' || s.enqStage === 'lost' ? 'new' : ENQ_STAGES[i + 1]
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="hidden md:inline-flex"><Clock aria-hidden />{t('Deadline')}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup value={d} onValueChange={(v) => deadlineSignal.set(v as Deadline)}>
            <DropdownMenuRadioItem value="ok">{t('On track')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="close">{t('Due soon')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="overdue">{t('Overdue')}</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="sm" onClick={() => s.setEnqStage(nextStage())} aria-label={`${t('Demo: next stage')}, ${t(stageLabel[nextStage()])}`}>
        <FastForward className="dir-icon" aria-hidden />
        <span className="hidden sm:inline">{t('Demo: next stage')}</span>
      </Button>
    </>
  )
}

export const enquiryModule: TypeModule = {
  tabs: {
    overview: heroOnly(Overview),
    'requirement-matching': heroOnly(Requirement),
    'site-survey': heroOnly(SiteSurvey),
    quotations: heroOnly(Quotations),
    'follow-ups': heroOnly(FollowUps),
    documents: heroOnly(Documents),
    history: heroOnly(History),
  },
  live: (r: RecordData, s) => {
    if (r.id !== HERO) return r
    const stage = s.enqStage
    const inQuote = stage === 'quotation' || stage === 'negotiation'
    const pending = s.approvals['APR-QT-2231'] === 'pending'
    return {
      ...r,
      stage,
      status: { label: stageLabel[stage], tone: stage === 'won' ? 'success' : stage === 'lost' ? 'danger' : stage === 'negotiation' ? 'warning' : 'brand' },
      closed: stage === 'lost',
      blocked: pending && inQuote ? { stage, reason: 'Discount approval' } : undefined,
      approval: inQuote ? r.approval : undefined,
      linked: s.bookingCreated ? ['BK-2207', ...r.linked] : r.linked,
      activity: stage === 'won' && s.bookingCreated ? [{ who: 'Priya Nair', what: 'Won. Booking BK-2207 created', when: 'Today, 10:05' }, ...(r.activity ?? [])] : r.activity,
    }
  },
  meta: (r, s): Record<string, TabMeta> => {
    if (r.id !== HERO) return {}
    const pending = s.approvals['APR-QT-2231'] === 'pending'
    const inQuote = s.enqStage === 'quotation' || s.enqStage === 'negotiation'
    return {
      'requirement-matching': !s.selectedCrane && inQuote ? { attention: 'brand', attentionLabel: 'Pick a crane' } : {},
      quotations: { count: s.quoteV3 ? 3 : 2, ...(pending && inQuote ? { attention: 'warning', attentionLabel: 'Discount approval pending' } : {}) },
      'follow-ups': { count: 4, ...(!s.completedTasks.f1 ? { attention: 'danger', attentionLabel: '1 overdue' } : {}) },
      documents: { count: 7 },
    }
  },
  primaryBlocked: (r, s) => {
    if (r.id !== HERO) return null
    const st = s.enqStage
    if ((st === 'quotation' || st === 'negotiation') && s.approvals['APR-QT-2231'] === 'pending') return 'Waiting for discount approval on QT-2231 v2.'
    if (st === 'won' && s.bookingCreated) return 'Booking BK-2207 already created from this enquiry.'
    return null
  },
  next: (r, s, ctx: WsCtx) => {
    if (r.id !== HERO) return null
    const st = s.enqStage
    const pending = s.approvals['APR-QT-2231'] === 'pending'
    const due = deadlineSignal.get() === 'overdue' ? 'BMC reply overdue by 25 min' : 'BMC reply due today 16:30'
    const tone = deadlineSignal.get() === 'overdue' ? 'danger' : 'warning'
    if (st === 'lost') return null
    if (st === 'won')
      return s.bookingCreated
        ? { title: 'Booking BK-2207 created', detail: 'Mobilisation is planned on WO-3318.', cta: { label: 'Open BK-2207', onClick: () => ctx.runAction('open-booking') } }
        : { title: 'Create booking', detail: 'Customer accepted QT-2231 v2.', cta: { label: 'Create booking', onClick: () => ctx.runAction('create-booking') } }
    if ((st === 'quotation' || st === 'negotiation') && pending)
      return { title: 'Approve discount on QT-2231 v2', detail: 'Customer asked for 12% off, below pricing rule PR-14.', due, tone, cta: { label: 'Open quotation v2', onClick: () => ctx.goTab('quotations', '?quote=v2') } }
    if (st === 'quotation' || st === 'negotiation')
      return { title: 'Record customer response', detail: 'Send the revised v2 with the approved discount, then record the reply.', due, tone, cta: { label: 'Record response', onClick: () => { ctx.goTab('quotations'); ctx.runAction('record-response') } } }
    if (st === 'survey') return { title: 'Create quotation', detail: 'Survey is done. Build v1 from the requirement.', due, tone, cta: { label: 'Create quotation', onClick: () => ctx.runAction('new-quotation') } }
    if (st === 'requirement') return { title: 'Schedule survey', detail: 'Site visit before quoting a crawler.', due, tone, cta: { label: 'Schedule survey', onClick: () => ctx.runAction('schedule-survey') } }
    return { title: 'Capture requirement', detail: 'Confirm crane, dates and load with the customer.', due, tone, cta: { label: 'Capture requirement', onClick: () => ctx.goTab('requirement-matching') } }
  },
  notStarted: (r, s) => {
    if (r.id !== HERO) return {}
    const i = order(s.enqStage)
    if (s.enqStage === 'lost') return {}
    return {
      'requirement-matching':
        i < 1
          ? { title: 'No requirement captured yet', body: 'Capture crane type, capacity, dates and load so we can match cranes.', action: 'Capture requirement', run: () => s.setEnqStage('requirement') }
          : undefined,
      'site-survey':
        i < 2 && !s.surveyNotRequired
          ? { title: 'No site survey yet', body: 'Book a visit to check ground, access and overhead lines before quoting.', action: 'Schedule survey', run: (c) => c.runAction('schedule-survey') }
          : undefined,
      quotations:
        i < 3 && !s.quoteV3
          ? { title: 'No quotation yet', body: 'Build the first version from the requirement and the selected crane.', action: 'Create quotation', run: (c) => c.runAction('new-quotation') }
          : undefined,
    }
  },
  reopen: (s) => {
    s.setLostReason(null)
    s.setEnqStage('negotiation')
  },
  Extras: function EnquiryExtras() {
    const ctx = useWorkspace()
    const navigate = useNavigate()
    React.useEffect(() => {
      if (ctx.action === 'new-quotation') {
        ctx.runAction(null)
        navigate('/crm/enquiries/ENQ-1042/quotations/new')
      }
      if (ctx.action === 'open-booking') {
        ctx.runAction(null)
        navigate('/bookings/bookings/BK-2207/overview')
      }
    }, [ctx, navigate])
    return <Extras />
  },
  DemoControls,
}

export { quoteTotals }
