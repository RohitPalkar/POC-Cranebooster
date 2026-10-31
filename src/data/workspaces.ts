import { slugify } from '@/lib/utils'

export type WsTab = { id: string; label: string; actions?: string[] }
export type StageOption = { id: string; label: string; negative?: boolean }
export type Stage = { id: string; label: string; tab: string; options?: StageOption[] }
export type PrimaryAction = { label: string; tab?: string; action?: string }

export type WorkspaceConfig = {
  type: string
  label: string
  module: string
  list: string
  stages?: Stage[]
  tabs: WsTab[]
  /** Secondary actions shown in the header. */
  actions?: string[]
  /** Primary action keyed by stage id, or 'default' for records without stages. */
  primary: Record<string, PrimaryAction | null>
}

const tabs = (...items: (string | [string, string[]])[]): WsTab[] =>
  items.map((x) => (typeof x === 'string' ? { id: slugify(x), label: x } : { id: slugify(x[0]), label: x[0], actions: x[1] }))
const st = (label: string, tab: string, options?: StageOption[]): Stage => ({ id: options ? 'outcome' : slugify(label), label, tab: slugify(tab), options })
const pa = (label: string, tab?: string, action?: string): PrimaryAction => ({ label, tab: tab ? slugify(tab) : undefined, action })

export const workspaces: Record<string, WorkspaceConfig> = {
  enquiry: {
    type: 'enquiry',
    label: 'Enquiry',
    module: 'crm',
    list: 'enquiries',
    actions: ['Call', 'Message'],
    stages: [
      st('New', 'Overview'),
      st('Requirement', 'Requirement & matching'),
      { id: 'survey', label: 'Site survey', tab: 'site-survey' },
      st('Quotation', 'Quotations'),
      st('Negotiation', 'Quotations'),
      st('Won / Lost', 'Overview', [
        { id: 'won', label: 'Won' },
        { id: 'lost', label: 'Lost', negative: true },
      ]),
    ],
    tabs: tabs(
      'Overview',
      ['Requirement & matching', ['Request site survey', 'Save requirement', 'Create quotation']],
      ['Site survey', ['Share report', 'Update requirement']],
      ['Quotations', ['Add item', 'Apply rate card', 'Preview PDF', 'Send to customer', 'Revise']],
      ['Follow-ups', ['Add task']],
      'Documents',
      'History',
    ),
    primary: {
      new: pa('Match cranes & quote', 'Requirement & matching'),
      requirement: pa('Match cranes & quote', 'Requirement & matching'),
      survey: pa('Open site survey', 'Site survey'),
      quotation: pa('Open quotations', 'Quotations'),
      negotiation: pa('Mark won → create booking', undefined, 'create-booking'),
      won: pa('Open BK-2207', undefined, 'open-booking'),
      lost: null,
    },
  },
  customer: {
    type: 'customer',
    label: 'Customer',
    module: 'customers',
    list: 'customers',
    actions: ['Message', 'New quotation', 'New booking', 'Add site', 'Open ledger'],
    tabs: tabs('Overview', 'Sites', 'Contacts', ['Credit & ledger', ['Send statement', 'Record payment', 'Change limit', 'Put on hold']], 'Enquiries & quotes', 'Bookings & jobs', 'Feedback', ['Repeat business', ['Send renewal', 'Propose']]),
    primary: {},
  },
  site: {
    type: 'site',
    label: 'Site',
    module: 'customers',
    list: 'sites',
    actions: ['Open in maps'],
    tabs: tabs('Details & access', 'Jobs & service history', 'Documents'),
    primary: {},
  },
  booking: {
    type: 'booking',
    label: 'Booking',
    module: 'bookings',
    list: 'bookings',
    actions: ['Reschedule', 'Cancel booking'],
    stages: [st('Requested', 'Overview'), st('Confirmed', 'Quote & confirmation'), st('Allocated', 'Work orders'), st('In progress', 'Work orders'), st('Completed', 'Payments'), st('Invoiced', 'Payments')],
    tabs: tabs('Overview', 'Quote & confirmation', 'Work orders', ['Payments', ['Request release', 'Remind customer']], 'Documents', 'History'),
    primary: {
      confirmed: pa('Create work order', 'Work orders'),
      allocated: pa('Open work orders', 'Work orders'),
      'in-progress': pa('Open work orders', 'Work orders'),
    },
  },
  workorder: {
    type: 'workorder',
    label: 'Work order',
    module: 'operations',
    list: 'work-orders',
    actions: ['Re-allocate', 'Print job card'],
    stages: [st('Created', 'Allocation'), st('Allocated', 'Allocation'), st('Ready', 'Readiness check'), st('Dispatched', 'Dispatch')],
    tabs: tabs('Allocation', ['Readiness check', ['Find crane', 'Upload renewal', 'Propose swap']], 'Dispatch', 'History'),
    primary: {
      created: pa('Confirm allocation', 'Allocation'),
      allocated: pa('Run readiness check', 'Readiness check'),
      ready: pa('Dispatch', 'Dispatch', 'dispatch'),
      dispatched: null,
    },
  },
  crane: {
    type: 'crane',
    label: 'Crane',
    module: 'fleet',
    list: 'cranes',
    actions: ['Edit', 'Schedule service', 'Assign to job'],
    tabs: tabs('Overview', ['Documents', ['Upload']], 'Service history', ['Fuel log', ['Add entry']], 'Maintenance', 'Cost & depreciation', 'GPS / IoT'),
    primary: {},
  },
}

export const workspaceByList: Record<string, WorkspaceConfig> = Object.fromEntries(Object.values(workspaces).map((w) => [`${w.module}/${w.list}`, w]))

export function stageIndex(cfg: WorkspaceConfig, stage?: string) {
  if (!cfg.stages || !stage) return -1
  return cfg.stages.findIndex((s) => s.id === stage || s.options?.some((o) => o.id === stage))
}
