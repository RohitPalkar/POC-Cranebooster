import * as React from 'react'
import { useNavigate } from 'react-router'
import { useStore } from '@/state/store'
import { QUOTE, type RecordData } from '@/data/records'
import { Badge } from '@/components/ui/badge'
import type { Store, TabMeta, TypeModule, WsCtx } from '@/workspace/context'
import { FileList, KeyValues, Panel, SimpleTable, Stat, Timeline } from '@/workspace/ui'
import { LinkedChip } from '@/workspace/RightRail'
import { only } from '@/workspace/PlaceholderTab'

const HERO = 'BK-2207'
const hero = (C: React.ComponentType) => only(HERO, C)

const stage = (s: Store) => (s.woStage === 'dispatched' ? 'in-progress' : s.woStage === 'created' ? 'confirmed' : 'allocated')
const statusOf: Record<string, { label: string; tone: 'brand' | 'info' }> = {
  confirmed: { label: 'Confirmed', tone: 'brand' },
  allocated: { label: 'Allocated', tone: 'info' },
  'in-progress': { label: 'In progress', tone: 'info' },
}

function Overview() {
  return (
    <div className="flex flex-col gap-4">
      <section aria-label="At a glance" className="grid grid-cols-3 gap-3">
        <Stat label="Value incl. GST" value="₹1,86,000" hint="Daily hire, 5 days" />
        <Stat label="Escrow" value="Held" hint="Released T+1 after the job" tone="success" />
        <Stat label="Start" value="Monday, 07:00" hint="Hinjawadi Phase 3, Tower B" />
      </section>
      <Panel title="Booking details">
        <KeyValues items={[{ label: 'Customer', value: <LinkedChip id="CUS-0317" /> }, { label: 'Site', value: <LinkedChip id="SITE-0412" /> }, { label: 'From enquiry', value: <LinkedChip id="ENQ-1042" /> }]} />
      </Panel>
    </div>
  )
}

function QuoteConfirmation() {
  return (
    <Panel title={`Accepted quote ${QUOTE} v3`}>
      <KeyValues items={[{ label: 'Daily rate', value: '₹29,440' }, { label: 'Discount', value: '8%, approved by Rakesh Kulkarni' }, { label: 'Total incl. GST', value: '₹1,86,000' }, { label: 'Confirmed on', value: 'Book My Crane' }]} cols={4} />
    </Panel>
  )
}

function WorkOrders() {
  const s = useStore()
  const navigate = useNavigate()
  const label = s.woStage[0].toUpperCase() + s.woStage.slice(1)
  return (
    <Panel title="Work orders" bodyClassName="pb-1">
      <SimpleTable
        caption="Work orders"
        columns={[{ key: 'id', label: 'ID' }, { key: 'work', label: 'Work' }, { key: 'crane', label: 'Crane' }, { key: 'status', label: 'Status' }]}
        rows={[{ id: 'WO-3318', work: 'Daily hire at Hinjawadi Phase 3, Tower B', crane: 'CR-025', status: <Badge tone={s.woStage === 'created' ? 'neutral' : 'info'} size="sm">{label}</Badge> }]}
        onRowClick={() => navigate('/operations/work-orders/WO-3318/allocation')}
        rowLabel={() => 'Open WO-3318'}
      />
    </Panel>
  )
}

function Payments() {
  return (
    <Panel title="Escrow" description="Book My Crane holds the payment and releases it T+1 after the job." actions={<Badge tone="success">Held</Badge>}>
      <p className="text-2xl font-semibold text-foreground tabular">₹1,86,000</p>
    </Panel>
  )
}

function Documents() {
  return <FileList docs={[{ name: 'BK-2207-confirmation.pdf', kind: 'pdf', size: '164 KB', by: 'Rakesh Kulkarni', when: 'Today' }]} />
}

function History() {
  return <Timeline items={[{ what: 'Work order WO-3318 generated', who: 'System', when: 'Today', tone: 'brand' }, { what: 'Booking created from ENQ-1042', who: 'Rakesh Kulkarni', when: 'Today', tone: 'success' }]} />
}

export const bookingModule: TypeModule = {
  tabs: { overview: hero(Overview), 'quote-confirmation': hero(QuoteConfirmation), 'work-orders': hero(WorkOrders), payments: hero(Payments), documents: hero(Documents), history: hero(History) },
  live: (r: RecordData, s) => (r.id === HERO ? { ...r, stage: stage(s), status: statusOf[stage(s)] } : r),
  meta: (r, s): Record<string, TabMeta> => (r.id === HERO ? { 'work-orders': { count: 1, ...(s.woStage === 'created' ? { attention: 'brand', attentionLabel: 'WO-3318 needs allocation' } : {}) } } : {}),
  next: (r, s, ctx: WsCtx) => (r.id === HERO && s.woStage !== 'dispatched' ? { title: 'Allocate WO-3318', detail: 'Crane, operator and readiness.', cta: { label: 'Open work orders', onClick: () => ctx.goTab('work-orders') } } : null),
}
