import * as React from 'react'
import { useNavigate } from 'react-router'
import { CalendarClock, Wrench } from 'lucide-react'
import { useStore } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import type { RecordData } from '@/data/records'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, Textarea } from '@/components/ui/input'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { recordPath } from '@/lib/paths'
import { useWorkspace, type TabMeta, type TypeModule } from '@/workspace/context'
import { KeyValues, Panel, SimpleTable, Stat } from '@/workspace/ui'
import { LinkedChip } from '@/workspace/RightRail'
import { only } from '@/workspace/PlaceholderTab'

const HERO = 'CR-050'
const hero = (C: React.ComponentType) => only(HERO, C)

function Maintenance() {
  const t = useT()
  const s = useStore()
  const navigate = useNavigate()
  const allocated = s.woCrane === HERO
  const rows = [
    ...(s.breakdownReported ? [{ id: 'MWO-0916', what: 'Breakdown reported from this workspace', date: '11 Nov 2025', down: '—', cost: '—', status: <Badge tone="danger" size="sm">{t('Reported')}</Badge> }] : []),
    { id: 'MWO-0902', what: t('Hydraulic hose leak, boom hoist circuit'), date: '21 Oct 2025', down: '14 h', cost: '₹38,600', status: <Badge size="sm">{t('Closed')}</Badge> },
    { id: 'MWO-0871', what: t('250 h service'), date: '18 Sep 2025', down: '6 h', cost: '₹24,300', status: <Badge size="sm">{t('Closed')}</Badge> },
  ]
  return (
    <div className="flex flex-col gap-4">
      <section aria-label={t('At a glance')} className="grid gap-3 sm:grid-cols-3">
        <Stat label="Next preventive service" value="in 38 h" hint={t('250 h service at 6,450 h')} tone="warning" />
        <Stat label="Downtime (90 days)" value="20 h" hint={t('2 work orders')} />
        <Stat label="Maintenance cost (90 days)" value="₹62,900" hint={t('Covered by AMC-0031: visits only')} />
      </section>
      {allocated && (
        <p role="status" className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-foreground">
          <CalendarClock className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <span>{t('Service falls due around day 4 of WO-3318. Plan it for a Sunday stop at site or the crane goes out of schedule.')}</span>
        </p>
      )}
      <Panel title={t('Breakdowns and work orders')} bodyClassName="pb-1">
        <SimpleTable
          caption={t('Breakdowns and work orders')}
          columns={[
            { key: 'id', label: 'ID', ltr: true },
            { key: 'what', label: 'Work' },
            { key: 'date', label: 'Date', ltr: true },
            { key: 'down', label: 'Downtime', align: 'end', ltr: true },
            { key: 'cost', label: 'Cost', align: 'end', ltr: true },
            { key: 'status', label: 'Status' },
          ]}
          rows={rows}
          rowLabel={(i) => `${t('Open')} ${rows[i].id}`}
          onRowClick={(i) => rows[i].id === 'MWO-0902' && navigate(recordPath('MWO-0902'))}
        />
      </Panel>
      <Panel title={t('Preventive schedule')} bodyClassName="pb-1">
        <SimpleTable
          caption={t('Preventive schedule')}
          columns={[
            { key: 'what', label: 'Service' },
            { key: 'at', label: 'Due at', ltr: true },
            { key: 'left', label: 'Left', ltr: true },
            { key: 'status', label: 'Status' },
          ]}
          rows={[
            { what: t('250 h service'), at: '6,450 h', left: '38 h', status: <Badge tone="warning" size="sm">{t('Due soon')}</Badge> },
            { what: t('500 h service'), at: '6,700 h', left: '288 h', status: <Badge size="sm">{t('Upcoming')}</Badge> },
            { what: t('Wire rope inspection'), at: '20 Jan 2026', left: '70 days', status: <Badge size="sm">{t('Upcoming')}</Badge> },
          ]}
        />
      </Panel>
    </div>
  )
}

function Overview() {
  const t = useT()
  const s = useStore()
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Panel title={t('Crane details')} className="xl:col-span-2">
        <KeyValues
          items={[
            { label: 'Model', value: 'SCX-1000', ltr: true },
            { label: 'Capacity', value: '100 T', ltr: true },
            { label: 'Year', value: '2019', ltr: true },
            { label: 'Registration', value: 'MH-14 HG 8850', ltr: true },
            { label: 'Hour meter', value: '6,412 h', ltr: true },
            { label: 'Yard', value: t('Pune, Talegaon') },
          ]}
        />
      </Panel>
      <Panel title={t('Current assignment')}>
        {s.woCrane === HERO ? <LinkedChip id="WO-3318" /> : <p className="text-sm text-muted-foreground">{t('Free. Not on any work order.')}</p>}
      </Panel>
    </div>
  )
}

function Extras() {
  const t = useT()
  const s = useStore()
  const { action, runAction, record } = useWorkspace()
  const [text, setText] = React.useState('')
  const [err, setErr] = React.useState('')
  if (record.id !== HERO) return null
  return (
    <Dialog open={action === 'report-breakdown'} onOpenChange={(o) => !o && runAction(null)}>
      <DialogContent>
        <form
          className="contents"
          onSubmit={(e) => {
            e.preventDefault()
            if (!text.trim()) return setErr(t('Describe the fault so a technician can be assigned.'))
            s.setBreakdownReported(true)
            s.toast(t('Breakdown MWO-0916 reported'))
            setText('')
            setErr('')
            runAction(null)
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('Report breakdown')}</DialogTitle>
            <DialogDescription><Ltr>CR-050</Ltr> · 100 T crawler</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field label={t('What went wrong?')} htmlFor="bd-text" required error={err}>
              <Textarea id="bd-text" value={text} onChange={(e) => setText(e.target.value)} aria-invalid={!!err} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => runAction(null)}>{t('Cancel')}</Button>
            <Button type="submit" variant="primary"><Wrench aria-hidden />{t('Report breakdown')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const craneModule: TypeModule = {
  tabs: { 'overview-status': hero(Overview), 'maintenance-breakdowns': hero(Maintenance) },
  live: (r: RecordData, s) => {
    if (r.id !== HERO) return r
    if (s.breakdownReported) return { ...r, status: { label: 'Breakdown', tone: 'danger' } }
    if (s.woCrane !== HERO) return r
    return { ...r, status: { label: s.woStage === 'dispatched' ? 'On hire' : 'Allocated', tone: 'info' }, linked: Array.from(new Set(['WO-3318', ...r.linked])) }
  },
  meta: (r: RecordData): Record<string, TabMeta> => (r.id === HERO ? { 'maintenance-breakdowns': { count: 2, attention: 'warning', attentionLabel: 'Service due in 38 h' } } : {}),
  next: (r) => (r.id === HERO ? { title: 'Plan 250 h service', detail: 'Due in 38 running hours.', tone: 'warning' } : null),
  Extras,
}
