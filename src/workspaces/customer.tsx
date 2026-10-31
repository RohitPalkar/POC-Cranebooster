import * as React from 'react'
import type { TypeModule } from '@/workspace/context'
import { KeyValues, Panel, SimpleTable, Stat } from '@/workspace/ui'
import { LinkedChip } from '@/workspace/RightRail'
import { only } from '@/workspace/PlaceholderTab'

const HERO = 'CUS-0317'
const hero = (C: React.ComponentType) => only(HERO, C)

function Overview() {
  return (
    <div className="flex flex-col gap-4">
      <section aria-label="At a glance" className="grid grid-cols-3 gap-3">
        <Stat label="Revenue to date" value="₹57.3 L" />
        <Stat label="Outstanding" value="₹1,12,500" tone="warning" hint="Credit limit ₹6.4 L" />
        <Stat label="Repeat bookings" value="9 of 12" tone="success" hint="Since 2021" />
      </section>
      <Panel title="Company">
        <KeyValues items={[{ label: 'Type', value: 'Builder' }, { label: 'City', value: 'Pune' }, { label: 'Main site', value: <LinkedChip id="SITE-0412" /> }]} />
      </Panel>
    </div>
  )
}

function RepeatBusiness() {
  return (
    <Panel title="Repeat business" description="Feedback and repeat business now live with the customer." bodyClassName="pb-1">
      <SimpleTable
        caption="Repeat business"
        columns={[{ key: 'what', label: 'Opportunity' }, { key: 'when', label: 'Due' }, { key: 'value', label: 'Value', align: 'end' }]}
        rows={[
          { what: 'Hired an ACE NX360 three times this year: offer monthly hire', when: 'Next month', value: '₹6.4 L' },
          { what: 'Tower C starts after Tower B', when: 'In 2 months', value: '₹3,20,000' },
        ]}
      />
    </Panel>
  )
}

export const customerModule: TypeModule = { tabs: { overview: hero(Overview), 'repeat-business': hero(RepeatBusiness) } }
