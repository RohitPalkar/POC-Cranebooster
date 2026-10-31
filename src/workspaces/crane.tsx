import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import type { TabMeta, TypeModule } from '@/workspace/context'
import type { RecordData } from '@/data/records'
import { KeyValues, Panel, SimpleTable, Stat } from '@/workspace/ui'
import { only } from '@/workspace/PlaceholderTab'

const HERO = 'CR-025'
const hero = (C: React.ComponentType) => only(HERO, C)

function Overview() {
  return (
    <Panel title="Crane details">
      <KeyValues items={[{ label: 'Model', value: 'ACE NX360' }, { label: 'Capacity', value: '14 T' }, { label: 'Registration', value: 'MH-12-KD-3321' }, { label: 'Year', value: '2019' }, { label: 'Yard', value: 'Chakan' }, { label: 'Hour meter', value: '8,412 h' }]} />
    </Panel>
  )
}

function Documents() {
  return (
    <Panel title="Documents" bodyClassName="pb-1">
      <SimpleTable
        caption="Documents"
        columns={[{ key: 'doc', label: 'Document' }, { key: 'until', label: 'Valid until' }, { key: 'status', label: 'Status' }]}
        rows={[
          { doc: 'Insurance', until: 'In 7 days', status: <Badge tone="warning" size="sm">Expiring in 7 days</Badge> },
          { doc: 'Fitness certificate', until: 'Mar 2027', status: <Badge tone="success" size="sm">Valid</Badge> },
          { doc: 'Registration', until: 'Jan 2034', status: <Badge tone="success" size="sm">Valid</Badge> },
        ]}
      />
    </Panel>
  )
}

const list = (title: string, columns: string[], rows: string[][]) =>
  function Light() {
    return (
      <Panel title={title} bodyClassName="pb-1">
        <SimpleTable caption={title} columns={columns.map((c) => ({ key: c, label: c }))} rows={rows.map((r) => Object.fromEntries(columns.map((c, i) => [c, r[i]])))} />
      </Panel>
    )
  }

function Cost() {
  return (
    <section aria-label="Cost and depreciation" className="grid grid-cols-3 gap-3">
      <Stat label="Revenue this month" value="₹6.4 L" />
      <Stat label="Running cost" value="₹2,84,000" />
      <Stat label="Depreciation" value="₹58,000" />
    </section>
  )
}

function Gps() {
  return (
    <Panel title="GPS / IoT">
      <KeyValues items={[{ label: 'Location', value: 'Chakan yard' }, { label: 'Last signal', value: '4 min ago' }, { label: 'Engine', value: 'Off' }]} />
    </Panel>
  )
}

export const craneModule: TypeModule = {
  tabs: {
    overview: hero(Overview),
    documents: hero(Documents),
    'service-history': hero(list('Service history', ['Service', 'Date', 'Cost'], [['Oil and filter', '12 days ago', '₹18,400'], ['250 h service', '3 months ago', '₹24,300']])),
    'fuel-log': hero(list('Fuel log', ['Date', 'Litres', 'Cost'], [['Yesterday', '120 L', '₹10,800'], ['Last week', '140 L', '₹12,600']])),
    maintenance: hero(list('Maintenance', ['Task', 'Due'], [['500 h service', 'In 88 h'], ['Wire rope check', 'Next month']])),
    'cost-depreciation': hero(Cost),
    'gps-iot': hero(Gps),
  },
  live: (r: RecordData, s) => (r.id === s.woCrane && s.woStage === 'dispatched' ? { ...r, status: { label: 'On hire', tone: 'info' } } : r),
  meta: (r: RecordData): Record<string, TabMeta> => (r.id === HERO ? { documents: { attention: 'warning', attentionLabel: 'Insurance expires in 7 days' } } : {}),
}
