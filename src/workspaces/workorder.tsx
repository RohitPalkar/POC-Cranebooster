import * as React from 'react'
import { CircleCheck, CircleX, ShieldCheck, Truck } from 'lucide-react'
import { useStore } from '@/state/store'
import { craneMatches, JOB_ID, operators, reliefOperators, type RecordData } from '@/data/records'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useWorkspace, type Store, type TabMeta, type TypeModule, type WsCtx } from '@/workspace/context'
import { KeyValues, Panel, Timeline } from '@/workspace/ui'
import { ActionButton } from '@/workspace/ActionButton'
import { LinkedChip } from '@/workspace/RightRail'
import { only } from '@/workspace/PlaceholderTab'

const HERO = 'WO-3318'
const hero = (C: React.ComponentType) => only(HERO, C)
const stageMeta = {
  created: { label: 'Created', tone: 'neutral' },
  allocated: { label: 'Allocated', tone: 'info' },
  ready: { label: 'Ready', tone: 'success' },
  dispatched: { label: 'Dispatched', tone: 'brand' },
} as const

const opName = (s: Store) => reliefOperators.find((o) => o.id === s.relief)?.name ?? operators.find((o) => o.id === s.woOperator)?.name

function Allocation() {
  const s = useStore()
  const { goTab } = useWorkspace()
  const locked = s.woStage === 'dispatched'
  return (
    <div className="flex flex-col gap-4">
      <Panel title="Crane" bodyClassName="p-0">
        <ul>
          {craneMatches.filter((c) => c.id !== 'CR-031').map((c) => {
            const on = s.woCrane === c.id
            return (
              <li key={c.id} className={cn('flex items-center gap-3 border-b border-border-subtle px-5 py-3.5 last:border-0', on && 'bg-brand-soft/60')}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{c.id} · {c.name}</p>
                  <Badge tone="success" size="sm" icon={ShieldCheck} className="mt-1.5">{c.compliance}</Badge>
                </div>
                <Button size="sm" variant={on ? 'soft' : 'secondary'} aria-pressed={on} disabled={locked} onClick={() => s.setWoCrane(c.id)}>{on ? 'Selected' : c.id === 'CR-014' ? 'Use as alternative' : 'Select'}</Button>
              </li>
            )
          })}
        </ul>
      </Panel>
      <Panel title="Operator" bodyClassName="p-0">
        <ul>
          {operators.map((o) => {
            const on = s.woOperator === o.id
            return (
              <li key={o.id} className={cn('flex items-center gap-3 border-b border-border-subtle px-5 py-3.5 last:border-0', on && 'bg-brand-soft/60')}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{o.id} · {o.name}</p>
                  <div className="mt-1.5 flex gap-2">
                    <Badge tone="success" size="sm" icon={ShieldCheck}>{o.licence}</Badge>
                    <Badge tone="warning" size="sm">{o.induction}</Badge>
                  </div>
                </div>
                <Button size="sm" variant={on ? 'soft' : 'secondary'} aria-pressed={on} disabled={locked} onClick={() => s.setWoOperator(o.id)}>{on ? 'Selected' : 'Select'}</Button>
              </li>
            )
          })}
        </ul>
      </Panel>
      <div className="flex justify-end">
        <Button variant="primary" disabled={locked} onClick={() => { if (s.woStage === 'created') s.setWoStage('allocated'); goTab('readiness-check') }}>Confirm allocation</Button>
      </div>
    </div>
  )
}

function Readiness() {
  const s = useStore()
  const { runAction } = useWorkspace()
  const items = ['Crane documents valid', 'Inspection in date', 'Operator licence valid', 'Gate pass issued', 'Lift plan signed']
  return (
    <Panel title="Readiness check" bodyClassName="p-0">
      <ul>
        {items.map((x) => (
          <li key={x} className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 text-sm text-foreground">
            <CircleCheck className="size-4 text-success" aria-hidden />
            <span className="flex-1">{x}</span>
            <Badge tone="success" size="sm">Pass</Badge>
          </li>
        ))}
        {s.relief ? (
          <li className="flex items-center gap-3 px-5 py-3 text-sm text-foreground">
            <CircleCheck className="size-4 text-success" aria-hidden />
            <span className="flex-1">Relief operator {opName(s)} inducted at this site</span>
            <Badge tone="success" size="sm">Pass</Badge>
          </li>
        ) : (
          <li className="flex items-center gap-3 bg-danger-soft px-5 py-3 text-sm text-foreground">
            <CircleX className="size-4 text-danger" aria-hidden />
            <span className="flex-1 font-medium">Operator site induction expires today</span>
            <Badge tone="danger" size="sm">Fail</Badge>
            <Button size="sm" variant="primary" onClick={() => runAction('relief')}>Assign relief</Button>
          </li>
        )}
      </ul>
    </Panel>
  )
}

function Dispatch() {
  const s = useStore()
  const { runAction, goTab } = useWorkspace()
  const sent = s.woStage === 'dispatched'
  return (
    <Panel
      title="Dispatch"
      actions={
        sent ? <Badge tone="brand" icon={Truck}>Dispatched</Badge> : (
          <>
            <Button size="sm" onClick={s.later}>Request a mover</Button>
            <ActionButton size="sm" variant="primary" disabledReason={s.relief ? null : 'Readiness check has a failed item.'} onClick={() => runAction('dispatch')}>Dispatch</ActionButton>
          </>
        )
      }
    >
      <KeyValues items={[{ label: 'Crane', value: <LinkedChip id={s.woCrane} /> }, { label: 'Operator', value: opName(s) }, { label: 'ETA at site', value: 'Monday, 06:30' }]} />
      {!s.relief && <Button className="mt-4" size="sm" onClick={() => goTab('readiness-check')}>Open readiness check</Button>}
    </Panel>
  )
}

function History() {
  return <Timeline items={[{ what: 'Created from BK-2207', who: 'System', when: 'Today' }]} />
}

function Extras() {
  const s = useStore()
  const { action, runAction, record, goTab } = useWorkspace()
  const [pick, setPick] = React.useState(reliefOperators[0].id)
  if (record.id !== HERO) return null
  return (
    <>
      <Dialog open={action === 'relief'} onOpenChange={(o) => !o && runAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign relief operator</DialogTitle>
            <DialogDescription>Santosh Jadhav's induction for this site expires today.</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-2">
            {reliefOperators.map((o) => (
              <button key={o.id} type="button" aria-pressed={pick === o.id} onClick={() => setPick(o.id)} className={cn('rounded-lg border p-3 text-start focus-visible:outline-2 focus-visible:outline-ring', pick === o.id ? 'border-primary bg-brand-soft' : 'border-border hover:border-border-strong')}>
                <span className="block text-sm font-semibold text-foreground">{o.id} · {o.name}</span>
                <span className="block text-sm text-muted-foreground">{o.note}</span>
              </button>
            ))}
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => runAction(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                s.setRelief(pick)
                s.decide('APR-RELIEF', 'approved')
                s.setWoStage('ready')
                s.toast('Relief assigned. Dispatch is unlocked.')
                runAction(null)
                goTab('dispatch')
              }}
            >
              Assign relief
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={action === 'dispatch'} onOpenChange={(o) => !o && runAction(null)}>
        <DialogContent>
          <form
            className="contents"
            onSubmit={(e) => {
              e.preventDefault()
              s.setWoStage('dispatched')
              s.toast(`WO-3318 dispatched. Job ${JOB_ID} created.`)
              runAction(null)
            }}
          >
            <DialogHeader>
              <DialogTitle>Dispatch crane</DialogTitle>
              <DialogDescription>{s.woCrane} · {opName(s)}</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Field label="ETA at site" htmlFor="eta"><Input id="eta" defaultValue="Monday, 06:30" /></Field>
            </DialogBody>
            <DialogFooter>
              <Button onClick={() => runAction(null)}>Cancel</Button>
              <Button type="submit" variant="primary"><Truck aria-hidden />Confirm dispatch</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const workOrderModule: TypeModule = {
  tabs: { allocation: hero(Allocation), 'readiness-check': hero(Readiness), dispatch: hero(Dispatch), history: hero(History) },
  live: (r: RecordData, s) => ({
    ...r,
    stage: s.woStage,
    status: stageMeta[s.woStage],
    blocked: s.woStage === 'allocated' && !s.relief ? { stage: 'allocated', reason: 'Readiness failed' } : undefined,
    linked: [s.woCrane, ...r.linked],
  }),
  meta: (_r, s): Record<string, TabMeta> => (s.relief ? {} : { 'readiness-check': { attention: 'danger', attentionLabel: '1 item failed' } }),
  next: (_r, s, ctx: WsCtx) => {
    if (s.woStage === 'created') return { title: 'Confirm allocation', detail: 'CR-025 is selected.', cta: { label: 'Open allocation', onClick: () => ctx.goTab('allocation') } }
    if (!s.relief) return { title: 'Assign relief', detail: 'Operator site induction expires today.', tone: 'danger', cta: { label: 'Open readiness check', onClick: () => ctx.goTab('readiness-check') } }
    if (s.woStage === 'ready') return { title: 'Dispatch', cta: { label: 'Open dispatch', onClick: () => ctx.goTab('dispatch') } }
    return { title: 'On the way', detail: `Job ${JOB_ID} is created.` }
  },
  handlers: (ctx) => ({ 'Re-allocate': () => ctx.goTab('allocation') }),
  Extras,
}
