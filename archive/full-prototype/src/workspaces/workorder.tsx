import * as React from 'react'
import { Link, useNavigate } from 'react-router'
import { Ban, CircleCheck, CircleDashed, Clock, FastForward, MapPin, ShieldCheck, Truck, UserRound } from 'lucide-react'
import { useStore, WO_STAGES, type WorkOrderStage } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import { craneMatches, JOB_FOR_WO, operatorsForWO, type RecordData } from '@/data/records'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/controls'
import { Field, Input } from '@/components/ui/input'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useWorkspace, type Store, type TabMeta, type TypeModule, type WsCtx } from '@/workspace/context'
import { KeyValues, Panel, SimpleTable, Timeline } from '@/workspace/ui'
import { ActionButton } from '@/workspace/ActionButton'
import { LinkedChip } from '@/workspace/RightRail'
import { only } from '@/workspace/PlaceholderTab'
import { EmptyState } from '@/workspace/states'

const HERO = 'WO-3318'
const hero = (C: React.ComponentType) => only(HERO, C)
const idx = (s: WorkOrderStage) => WO_STAGES.indexOf(s)

const stageMeta: Record<WorkOrderStage, { label: string; tone: 'neutral' | 'info' | 'success' | 'brand' }> = {
  created: { label: 'Created', tone: 'neutral' },
  allocated: { label: 'Allocated', tone: 'info' },
  ready: { label: 'Ready', tone: 'success' },
  dispatched: { label: 'Dispatched', tone: 'brand' },
}

const checks = [
  { id: 'fitness', label: 'Crane fitness certificate valid', detail: 'Valid to 14 Mar 2026', owner: 'Meera Joshi' },
  { id: 'rigging', label: 'Rigging gear inspected', detail: 'Slings and shackles tagged 8 Nov', owner: 'Vikram Rao' },
  { id: 'lift', label: 'Lift plan signed by customer', detail: 'LP-311-04, rev B', owner: 'Imran Shaikh' },
  { id: 'advance', label: 'Advance received', detail: '₹4,85,000 on ADV-0412', owner: 'Anita Desai' },
  { id: 'gate', label: 'Gate pass issued', detail: 'GP-8821, Gate 2, Maan Road', owner: 'Imran Shaikh' },
  { id: 'induction', label: 'Operator site induction booked', detail: 'Hinjewadi depot, 45 min on arrival', owner: 'Meera Joshi' },
  { id: 'inspection', label: 'Pre-dispatch inspection passed', detail: 'INS-0461, today 15:00', owner: 'Meera Joshi' },
]

const isChecked = (s: Store, id: string) => (id === 'advance' ? s.advancePaid : !!s.woChecks[id])
const openChecks = (s: Store) => checks.filter((c) => !isChecked(s, c.id))

// ---------------- Overview ----------------
function Overview() {
  const t = useT()
  const s = useStore()
  const { goTab } = useWorkspace()
  const open = openChecks(s).length
  const stage = s.woStage
  return (
    <div className="flex flex-col gap-4">
      <section aria-label={t('At a glance')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Crane', value: s.woCrane ?? t('Not allocated'), ok: !!s.woCrane, tab: 'allocation' },
          { label: 'Operator', value: operatorsForWO.find((o) => o.id === s.woOperator)?.name ?? t('Not allocated'), ok: !!s.woOperator, tab: 'allocation' },
          { label: 'Readiness', value: open ? `${open} ${t('checks open')}` : t('All checks done'), ok: !open, tab: 'readiness-check' },
          { label: 'Dispatch', value: stage === 'dispatched' ? t('On the way') : t('Not dispatched'), ok: stage === 'dispatched', tab: 'dispatch' },
        ].map((c) => (
          <button key={c.label} type="button" onClick={() => goTab(c.tab)} className="rounded-xl border border-border bg-surface p-4 text-start shadow-xs transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-ring">
            <span className="text-xs font-medium text-muted-foreground">{t(c.label)}</span>
            <span className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-foreground">
              {c.ok ? <CircleCheck className="size-4 shrink-0 text-success" aria-hidden /> : <CircleDashed className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
              <Ltr>{c.value}</Ltr>
            </span>
          </button>
        ))}
      </section>
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title={t('Scope of work')} className="xl:col-span-2">
          <KeyValues
            items={[
              { label: 'Booking', value: <LinkedChip id="BK-2207" /> },
              { label: 'Site', value: <LinkedChip id="SITE-311" /> },
              { label: 'Customer', value: <LinkedChip id="CUS-0184" /> },
              { label: 'Mobilise by', value: '12 Nov 2025, 06:00', ltr: true },
              { label: 'Shift', value: t('Day, 10 h') },
              { label: 'Duration', value: '18 days', ltr: true },
              { label: 'Work', value: t('Assemble crawler on the access road, walk to the east pad, then lift 64 precast I-girders onto bays 3 to 5. Maximum pick 42 T at 18 m radius.'), wide: true },
            ]}
          />
        </Panel>
        <Panel title={t('Site contact')}>
          <div className="flex flex-col gap-3 text-sm">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <UserRound className="size-4 text-muted-foreground" aria-hidden />
              Amit Deshmukh
            </p>
            <p className="text-muted-foreground">{t('Project manager')}</p>
            <p>
              <Ltr>+91 98220 41187</Ltr>
            </p>
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              {t('Gate 2, Maan Road. No heavy vehicle entry 08:30 to 10:30.')}
            </p>
          </div>
        </Panel>
      </div>
    </div>
  )
}

// ---------------- Allocation ----------------
function Allocation() {
  const t = useT()
  const s = useStore()
  const { readOnly, setDirty, goTab } = useWorkspace()
  const locked = idx(s.woStage) >= idx('dispatched')
  const [crane, setCrane] = React.useState<string | null>(s.woCrane ?? s.selectedCrane)
  const [op, setOp] = React.useState<string | null>(s.woOperator)
  const changed = crane !== s.woCrane || op !== s.woOperator
  React.useEffect(() => {
    setDirty('allocation', changed && (!!s.woCrane || !!s.woOperator))
    return () => setDirty('allocation', false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changed])
  const reason = locked ? 'Already dispatched. Cancel the dispatch to change allocation.' : !crane ? 'Pick a crane first.' : !op ? 'Pick an operator first.' : !changed ? 'No changes to save.' : null
  return (
    <div className="flex flex-col gap-4">
      {s.selectedCrane && <p className="flex items-center gap-2 text-sm text-muted-foreground"><CircleCheck className="size-4 text-success" aria-hidden />{t('Preselected from the crane picked on ENQ-1042.')}</p>}
      <Panel title={t('Crane')} description={t('Availability for 12 to 29 Nov and compliance on the mobilisation date')} bodyClassName="p-0">
        <ul>
          {craneMatches.map((c) => {
            const on = crane === c.id
            const unavailable = !c.compliant ? `${c.id}: ${c.compliance}.` : c.availTone === 'warning' ? `${c.id}: ${c.availability}.` : null
            return (
              <li key={c.id} className={cn('flex flex-col gap-3 border-b border-border-subtle px-5 py-3.5 last:border-0 sm:flex-row sm:items-center', on && 'bg-brand-soft/60')}>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                    <Ltr>{c.id}</Ltr> · <span>{c.name}</span>
                    {on && <Badge tone="brand" size="sm" icon={CircleCheck}>{t('Selected')}</Badge>}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <Badge tone={c.availTone} size="sm">{t(c.availability)}</Badge>
                    <Badge tone={c.compliant ? 'success' : 'danger'} size="sm" icon={c.compliant ? ShieldCheck : Ban}>
                      {c.compliant ? t('Compliant') : t('Non-compliant')}: {t(c.compliance)}
                    </Badge>
                  </div>
                </div>
                <ActionButton size="sm" variant={on ? 'soft' : 'secondary'} aria-pressed={on} disabledReason={unavailable ?? (readOnly || locked ? 'Already dispatched. Cancel the dispatch to change allocation.' : null)} onClick={() => setCrane(on ? null : c.id)}>
                  {on ? t('Selected') : t('Select')}
                </ActionButton>
              </li>
            )
          })}
        </ul>
      </Panel>
      <Panel title={t('Operator')} description={t('Must hold a valid crawler licence for the whole job')} bodyClassName="p-0">
        <ul>
          {operatorsForWO.map((o) => {
            const on = op === o.id
            return (
              <li key={o.id} className={cn('flex flex-col gap-3 border-b border-border-subtle px-5 py-3.5 last:border-0 sm:flex-row sm:items-center', on && 'bg-brand-soft/60')}>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                    <Ltr>{o.id}</Ltr> · <span>{o.name}</span>
                    {on && <Badge tone="brand" size="sm" icon={CircleCheck}>{t('Selected')}</Badge>}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t(o.cls)} · {t(o.licence)}</p>
                  <p className={cn('mt-0.5 text-sm', o.ok ? 'text-muted-foreground' : 'text-warning')}>{t(o.note)}</p>
                </div>
                <ActionButton size="sm" variant={on ? 'soft' : 'secondary'} aria-pressed={on} disabledReason={!o.ok ? o.note : locked ? 'Already dispatched. Cancel the dispatch to change allocation.' : null} onClick={() => setOp(on ? null : o.id)}>
                  {on ? t('Selected') : t('Select')}
                </ActionButton>
              </li>
            )
          })}
        </ul>
      </Panel>
      <div className="flex justify-end">
        <ActionButton
          variant="primary"
          disabledReason={reason}
          onClick={() => {
            s.setWoCrane(crane)
            s.setWoOperator(op)
            if (s.woStage === 'created') s.setWoStage('allocated')
            setDirty('allocation', false)
            s.toast(`${crane} ${t('and')} ${operatorsForWO.find((o) => o.id === op)?.name} ${t('allocated to WO-3318')}`)
            goTab('readiness-check')
          }}
        >
          {t('Confirm allocation')}
        </ActionButton>
      </div>
    </div>
  )
}

// ---------------- Readiness check ----------------
function Readiness() {
  const t = useT()
  const s = useStore()
  const { goTab, readOnly } = useWorkspace()
  const open = openChecks(s)
  const stage = s.woStage
  if (idx(stage) < idx('allocated'))
    return (
      <EmptyState
        title={t('No readiness check yet')}
        body={t('Allocate a crane and operator first. The checks depend on who and what is going to site.')}
        action={<Button variant="primary" onClick={() => goTab('allocation')}>{t('Allocate crane & operator')}</Button>}
      />
    )
  const done = checks.length - open.length
  return (
    <Panel
      title={t('Readiness check')}
      description={<><Ltr>{done} / {checks.length}</Ltr> {t('checks done. All are needed before dispatch.')}</>}
      actions={<ActionButton size="sm" variant="primary" disabledReason={stage !== 'allocated' ? 'This work order is already marked ready.' : open.length ? `${open.length} ${t('checks still open')}: ${t(open[0].label)}` : null} onClick={() => { s.setWoStage('ready'); s.toast(t('WO-3318 is ready to dispatch')); goTab('dispatch') }}>{t('Mark as ready')}</ActionButton>}
      bodyClassName="p-0"
    >
      <div role="progressbar" aria-label={t('Readiness progress')} aria-valuenow={done} aria-valuemin={0} aria-valuemax={checks.length} className="h-1 bg-neutral-soft">
        <div className="h-full bg-success-solid transition-all" style={{ width: `${(done / checks.length) * 100}%` }} />
      </div>
      <ul>
        {checks.map((c) => {
          const on = isChecked(s, c.id)
          return (
            <li key={c.id} className="flex items-start gap-3 border-b border-border-subtle px-5 py-3 last:border-0 pointer-coarse:min-h-11">
              <Checkbox
                id={`chk-${c.id}`}
                checked={on}
                disabled={readOnly || idx(stage) >= idx('dispatched')}
                className="mt-0.5"
                onCheckedChange={(v) => (c.id === 'advance' ? s.setAdvancePaid(!!v) : s.setWoCheck(c.id, !!v))}
              />
              <div className="min-w-0 flex-1">
                <label htmlFor={`chk-${c.id}`} className="block text-sm font-medium text-foreground">{t(c.label)}</label>
                <p className="text-xs text-muted-foreground">{c.id === 'advance' && !on ? t('Waiting for customer payment on ADV-0412') : t(c.detail)} · {c.owner}</p>
              </div>
              <Badge tone={on ? 'success' : 'warning'} size="sm">{on ? t('Done') : t('Open')}</Badge>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

// ---------------- Dispatch ----------------
function Dispatch() {
  const t = useT()
  const s = useStore()
  const { goTab, runAction } = useWorkspace()
  const stage = s.woStage
  if (idx(stage) < idx('ready'))
    return (
      <EmptyState
        title={t('Not dispatched yet')}
        body={t('Dispatch opens once allocation and every readiness check are done.')}
        action={<Button variant="primary" onClick={() => goTab(idx(stage) < idx('allocated') ? 'allocation' : 'readiness-check')}>{idx(stage) < idx('allocated') ? t('Allocate crane & operator') : t('Run readiness check')}</Button>}
      />
    )
  const sent = stage === 'dispatched'
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Panel
        title={t('Dispatch plan')}
        className="xl:col-span-2"
        actions={!sent && <Button size="sm" variant="primary" onClick={() => runAction('dispatch')}><Truck aria-hidden />{t('Dispatch')}</Button>}
      >
        <KeyValues
          items={[
            { label: 'Crane', value: <LinkedChip id={s.woCrane ?? 'CR-050'} /> },
            { label: 'Operator', value: <LinkedChip id={s.woOperator ?? 'OP-118'} /> },
            { label: 'Transport', value: t('3 trailers plus assist crane') },
            { label: 'Leaves yard', value: '11 Nov 2025, 22:30', ltr: true },
            { label: 'Arrives Gate 2', value: '12 Nov 2025, 05:30', ltr: true },
            { label: 'Route', value: t('Talegaon yard, NH-48, Maan Road. 14 km, night movement permit held.'), wide: true },
          ]}
        />
      </Panel>
      <Panel title={t('Status')}>
        {sent ? (
          <div className="flex flex-col gap-3">
            <Badge tone="brand" icon={Truck}>{t('Dispatched')}</Badge>
            <p className="text-sm text-muted-foreground">{t('Job created. The site team checks in on arrival.')}</p>
            <LinkedChip id={JOB_FOR_WO} />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Badge tone="success" icon={CircleCheck}>{t('Ready')}</Badge>
            <p className="text-sm text-muted-foreground">{t('All checks are done. Dispatch creates the job.')}</p>
          </div>
        )}
      </Panel>
    </div>
  )
}

// ---------------- Gate pass & permits ----------------
function GatePass() {
  const t = useT()
  const s = useStore()
  const { readOnly } = useWorkspace()
  const issued = !!s.woChecks.gate
  return (
    <div className="flex flex-col gap-4">
      <Panel
        title={<>{t('Gate pass')} <Ltr>GP-8821</Ltr></>}
        description={issued ? t('Issued by Vardhman site office') : t('Requested 24 h before arrival, as the site requires')}
        actions={
          issued ? (
            <Badge tone="success" icon={CircleCheck}>{t('Issued')}</Badge>
          ) : (
            <ActionButton size="sm" disabledReason={readOnly ? 'This record is closed and read-only.' : null} onClick={() => { s.setWoCheck('gate', true); s.toast(t('Gate pass GP-8821 marked as issued')) }}>{t('Mark as issued')}</ActionButton>
          )
        }
      >
        <KeyValues
          items={[
            { label: 'Gate', value: t('Gate 2, Maan Road') },
            { label: 'Valid', value: '12 – 29 Nov 2025', ltr: true },
            { label: 'Vehicles', value: 'MH-14 HG 4471, MH-14 HG 4472, MH-14 KA 0918', ltr: true },
          ]}
        />
      </Panel>
      <Panel title={t('Permits')} bodyClassName="pb-1">
        <SimpleTable
          caption={t('Permits')}
          columns={[
            { key: 'name', label: 'Permit' },
            { key: 'by', label: 'Issued by' },
            { key: 'valid', label: 'Valid until', ltr: true },
            { key: 'status', label: 'Status' },
          ]}
          rows={[
            { name: t('Heavy lift permit'), by: 'Vardhman Buildcon', valid: '29 Nov 2025', status: <Badge tone="success" size="sm">{t('Valid')}</Badge> },
            { name: t('Work near overhead line, 11 kV'), by: 'MSEDCL Hinjewadi', valid: '29 Nov 2025', status: <Badge tone="success" size="sm">{t('Valid')}</Badge> },
            { name: t('Night movement, NH-48'), by: 'Pune Traffic Police', valid: '12 Nov 2025', status: <Badge tone="warning" size="sm">{t('Expires soon')}</Badge> },
          ]}
        />
      </Panel>
    </div>
  )
}

function History() {
  const s = useStore()
  return (
    <Timeline
      items={[
        ...(s.woStage === 'dispatched' ? [{ what: 'Dispatched. Job JB-5520 created', who: 'Imran Shaikh', when: 'Today', tone: 'success' as const }] : []),
        ...(idx(s.woStage) >= idx('ready') ? [{ what: 'Readiness check complete', who: 'Imran Shaikh', when: 'Today', tone: 'success' as const }] : []),
        ...(s.woCrane ? [{ what: `Allocated ${s.woCrane} and ${operatorsForWO.find((o) => o.id === s.woOperator)?.name}`, who: 'Imran Shaikh', when: 'Today', tone: 'brand' as const }] : []),
        { what: 'Requested gate pass from Vardhman site office', who: 'Imran Shaikh', when: 'Today, 10:30' },
        { what: 'Created from BK-2207', who: 'System', when: 'Today, 10:05' },
      ]}
    />
  )
}

function Extras() {
  const t = useT()
  const s = useStore()
  const navigate = useNavigate()
  const { action, runAction, record } = useWorkspace()
  React.useEffect(() => {
    if (action === 'open-job') {
      runAction(null)
      navigate(`/operations/jobs/${JOB_FOR_WO}/overview`)
    }
  }, [action, navigate, runAction])
  if (record.id !== HERO) return null
  return (
    <Dialog open={action === 'dispatch'} onOpenChange={(o) => !o && runAction(null)}>
      <DialogContent>
        <form
          className="contents"
          onSubmit={(e) => {
            e.preventDefault()
            s.setWoStage('dispatched')
            s.toast(t('WO-3318 dispatched. Job JB-5520 created'))
            runAction(null)
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('Dispatch crane')}</DialogTitle>
            <DialogDescription><Ltr>{s.woCrane}</Ltr> · {operatorsForWO.find((o) => o.id === s.woOperator)?.name} · <Ltr>WO-3318</Ltr></DialogDescription>
          </DialogHeader>
          <DialogBody className="grid gap-4 sm:grid-cols-2">
            <Field label={t('Leaves yard')} htmlFor="dp-date"><Input id="dp-date" type="date" defaultValue="2025-11-11" dir="ltr" /></Field>
            <Field label={t('Time')} htmlFor="dp-time"><Input id="dp-time" type="time" defaultValue="22:30" dir="ltr" /></Field>
            <Field label={t('Transport lead')} htmlFor="dp-lead" className="sm:col-span-2"><Input id="dp-lead" defaultValue="Ganesh Pawar" /></Field>
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => runAction(null)}>{t('Cancel')}</Button>
            <Button type="submit" variant="primary"><Truck aria-hidden />{t('Confirm dispatch')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DemoControls() {
  const t = useT()
  const s = useStore()
  const { record } = useWorkspace()
  if (record.id !== HERO) return null
  const i = idx(s.woStage)
  const next = WO_STAGES[(i + 1) % WO_STAGES.length]
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={`${t('Demo: next stage')}, ${t(stageMeta[next].label)}`}
      onClick={() => {
        if (next !== 'created') {
          s.setWoCrane(s.woCrane ?? 'CR-050')
          s.setWoOperator(s.woOperator ?? 'OP-118')
        }
        s.setWoStage(next)
      }}
    >
      <FastForward className="dir-icon" aria-hidden />
      <span className="hidden sm:inline">{t('Demo: next stage')}</span>
    </Button>
  )
}

export const workOrderModule: TypeModule = {
  tabs: {
    overview: hero(Overview),
    allocation: hero(Allocation),
    'readiness-check': hero(Readiness),
    dispatch: hero(Dispatch),
    'gate-pass-permits': hero(GatePass),
    history: hero(History),
  },
  live: (r: RecordData, s) => {
    if (r.id !== HERO) return r
    const m = stageMeta[s.woStage]
    const op = operatorsForWO.find((o) => o.id === s.woOperator)
    return {
      ...r,
      stage: s.woStage,
      status: { label: m.label, tone: m.tone },
      facts: [...r.facts, ...(s.woCrane ? [{ label: 'Crane', value: s.woCrane, ltr: true }] : []), ...(op ? [{ label: 'Operator', value: op.name, ltr: true }] : [])],
      linked: [...(s.woCrane ? [s.woCrane] : []), ...(op ? [op.id] : []), ...(s.woStage === 'dispatched' ? [JOB_FOR_WO] : []), ...r.linked],
      activity: [
        ...(s.woStage === 'dispatched' ? [{ who: 'Imran Shaikh', what: 'Dispatched. Job JB-5520 created', when: 'Today' }] : []),
        ...(s.woCrane ? [{ who: 'Imran Shaikh', what: `Allocated ${s.woCrane} and ${op?.name}`, when: 'Today' }] : []),
        ...(r.activity ?? []),
      ],
    }
  },
  meta: (r, s): Record<string, TabMeta> => {
    if (r.id !== HERO) return {}
    const open = openChecks(s).length
    return {
      allocation: s.woStage === 'created' ? { attention: 'brand', attentionLabel: 'Needs crane and operator' } : {},
      'readiness-check': { count: checks.length - open, ...(s.woStage === 'allocated' && open ? { attention: 'warning', attentionLabel: `${open} checks open` } : {}) },
      'gate-pass-permits': s.woChecks.gate ? {} : { attention: 'warning', attentionLabel: 'Gate pass pending' },
    }
  },
  next: (r, s, ctx: WsCtx) => {
    if (r.id !== HERO) return null
    const go = (label: string, tab: string, detail: string) => ({ title: label, detail, due: 'Mobilise by 12 Nov, 06:00', tone: 'warning' as const, cta: { label, onClick: () => ctx.goTab(tab) } })
    if (s.woStage === 'created') return go('Allocate crane & operator', 'allocation', 'CR-050 is the best match and is free for the whole job.')
    if (s.woStage === 'allocated') return go('Run readiness check', 'readiness-check', `${openChecks(s).length} checks are still open.`)
    if (s.woStage === 'ready') return { ...go('Dispatch', 'dispatch', 'All checks are done.'), cta: { label: 'Dispatch', onClick: () => { ctx.goTab('dispatch'); ctx.runAction('dispatch') } } }
    return { title: 'Open job', detail: 'Crane is on the way to site.', cta: { label: 'Open job', onClick: () => ctx.runAction('open-job') } }
  },
  Banner: function WorkOrderBanner() {
    const t = useT()
    const s = useStore()
    const { record } = useWorkspace()
    if (record.id !== HERO || s.woStage === 'dispatched' || s.woCrane !== 'CR-050') return null
    return (
      <p role="status" className="mt-3 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-foreground">
        <Clock className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
        <span>
          {t('CR-050 reaches its 250 h service during this job.')}{' '}
          <Link to="/fleet/cranes/CR-050/maintenance-breakdowns" className="font-medium underline underline-offset-4">{t('See maintenance')}</Link>
        </span>
      </p>
    )
  },
  Extras,
  DemoControls,
}
