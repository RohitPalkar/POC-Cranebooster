import { slugify } from '@/lib/utils'

export type WsTab = { id: string; label: string }
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
  /** Primary action keyed by stage id, or 'default' for records without stages. */
  primary: Record<string, PrimaryAction | null>
}

const tabs = (...labels: string[]): WsTab[] => labels.map((label) => ({ id: slugify(label), label }))
const st = (label: string, tab: string, options?: StageOption[]): Stage => ({ id: options ? 'outcome' : slugify(label), label, tab: slugify(tab), options })
const pa = (label: string, tab?: string, action?: string): PrimaryAction => ({ label, tab: tab ? slugify(tab) : undefined, action })

export const workspaces: Record<string, WorkspaceConfig> = {
  // SELL
  lead: {
    type: 'lead',
    label: 'Lead',
    module: 'crm',
    list: 'leads',
    tabs: tabs('Overview', 'Enquiries', 'Follow-ups', 'History'),
    primary: { default: pa('Convert to enquiry', 'Enquiries') },
  },
  enquiry: {
    type: 'enquiry',
    label: 'Enquiry',
    module: 'crm',
    list: 'enquiries',
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
    tabs: tabs('Overview', 'Requirement & matching', 'Site survey', 'Quotations', 'Follow-ups', 'Documents', 'History'),
    primary: {
      new: pa('Capture requirement', 'Requirement & matching'),
      requirement: pa('Schedule survey', 'Site survey', 'schedule-survey'),
      survey: pa('Create quotation', 'Quotations', 'new-quotation'),
      quotation: pa('Record response', 'Quotations', 'record-response'),
      negotiation: pa('Record response', 'Quotations', 'record-response'),
      won: pa('Create booking', undefined, 'create-booking'),
      lost: null,
    },
  },
  customer: {
    type: 'customer',
    label: 'Customer',
    module: 'customers',
    list: 'customers',
    tabs: tabs(
      'Overview',
      'Contacts',
      'Sites',
      'Enquiries & quotes',
      'Bookings & jobs',
      'Projects & contracts',
      'Invoices & payments',
      'Feedback & complaints',
      'Repeat business',
      'Documents',
      'History',
    ),
    primary: { default: pa('New enquiry', 'Enquiries & quotes') },
  },
  site: {
    type: 'site',
    label: 'Site',
    module: 'customers',
    list: 'sites',
    tabs: tabs('Details & access', 'Gate process & induction', 'Permits required', 'Jobs & service history', 'Incidents', 'Documents'),
    primary: { default: pa('Book induction', 'Gate process & induction') },
  },
  service: {
    type: 'service',
    label: 'Service',
    module: 'services',
    list: 'catalogue',
    tabs: tabs('Details', 'Rate card', 'Pricing rules', 'Areas & availability', 'Policies', 'Book My Crane listing'),
    primary: { default: pa('Update rate card', 'Rate card') },
  },
  // DELIVER
  booking: {
    type: 'booking',
    label: 'Booking',
    module: 'bookings',
    list: 'bookings',
    stages: [
      st('Requested', 'Overview'),
      st('Confirmed', 'Quote & confirmation'),
      st('Allocated', 'Work orders'),
      st('In progress', 'Jobs'),
      st('Completed', 'Jobs'),
      st('Invoiced', 'Payments'),
    ],
    tabs: tabs('Overview', 'Quote & confirmation', 'Contract', 'PO & advance', 'Work orders', 'Jobs', 'Payments', 'Documents', 'History'),
    primary: {
      requested: pa('Confirm booking', 'Quote & confirmation'),
      confirmed: pa('Allocate work orders', 'Work orders'),
      allocated: pa('Start job', 'Jobs'),
      'in-progress': pa('Complete job', 'Jobs'),
      completed: pa('Raise invoice', 'Payments'),
      invoiced: pa('Record payment', 'Payments'),
    },
  },
  sos: {
    type: 'sos',
    label: 'SOS request',
    module: 'bookings',
    list: 'sos',
    stages: [st('Received', 'Request'), st('Assigned', 'Dispatch'), st('En route', 'Live tracking'), st('On site', 'Live tracking'), st('Closed', 'Closure & invoice')],
    tabs: tabs('Request', 'Dispatch', 'Live tracking', 'Closure & invoice', 'History'),
    primary: {
      received: pa('Assign responder', 'Dispatch'),
      assigned: pa('Mark en route', 'Live tracking'),
      'en-route': pa('Mark on site', 'Live tracking'),
      'on-site': pa('Close & invoice', 'Closure & invoice'),
      closed: null,
    },
  },
  project: {
    type: 'project',
    label: 'Project',
    module: 'projects',
    list: 'projects',
    tabs: tabs('Overview', 'Requirements', 'Sites', 'Cranes', 'Operators', 'Work orders', 'Daily logs', 'Billing & payments', 'Expenses', 'Profitability', 'Documents', 'History'),
    primary: { default: pa('Add daily log', 'Daily logs') },
  },
  contract: {
    type: 'contract',
    label: 'Contract',
    module: 'projects',
    list: 'contracts',
    stages: [st('Draft', 'Terms & SLA'), st('Approved', 'Terms & SLA'), st('Active', 'Billing schedule'), st('Renewal due', 'Renewals'), st('Ended', 'History')],
    tabs: tabs('Terms & SLA', 'Customer PO', 'Pricing', 'Renewals', 'Billing schedule', 'Documents', 'History'),
    primary: {
      draft: pa('Send for approval', 'Terms & SLA'),
      approved: pa('Activate contract', 'Billing schedule'),
      active: pa('Raise next bill', 'Billing schedule'),
      'renewal-due': pa('Prepare renewal', 'Renewals'),
      ended: null,
    },
  },
  workorder: {
    type: 'workorder',
    label: 'Work order',
    module: 'operations',
    list: 'work-orders',
    stages: [st('Created', 'Overview'), st('Allocated', 'Allocation'), st('Ready', 'Readiness check'), st('Dispatched', 'Dispatch')],
    tabs: tabs('Overview', 'Allocation', 'Readiness check', 'Dispatch', 'Gate pass & permits', 'History'),
    primary: {
      created: pa('Allocate crane & operator', 'Allocation'),
      allocated: pa('Run readiness check', 'Readiness check'),
      ready: pa('Dispatch', 'Dispatch', 'dispatch'),
      dispatched: pa('Open job', undefined, 'open-job'),
    },
  },
  job: {
    type: 'job',
    label: 'Job',
    module: 'operations',
    list: 'jobs',
    stages: [st('Mobilised', 'Mobilisation & check-in'), st('On site', 'Daily execution'), st('Completed', 'Completion & demobilisation'), st('Demobilised', 'Completion & demobilisation'), st('Closed', 'Closure')],
    tabs: tabs(
      'Overview',
      'Mobilisation & check-in',
      'Daily execution',
      'Timesheets',
      'Overtime & extra charges',
      'Customer approval',
      'Completion & demobilisation',
      'Closure',
      'Documents',
      'History',
    ),
    primary: {
      mobilised: pa('Check in on site', 'Mobilisation & check-in'),
      'on-site': pa('Add daily log', 'Daily execution'),
      completed: pa('Demobilise', 'Completion & demobilisation'),
      demobilised: pa('Close job', 'Closure'),
      closed: null,
    },
  },
  // ASSETS
  crane: {
    type: 'crane',
    label: 'Crane',
    module: 'fleet',
    list: 'cranes',
    tabs: tabs(
      'Overview & status',
      'Availability & bookings',
      'Documents',
      'Inspections',
      'Maintenance & breakdowns',
      'Movements',
      'Cost & revenue',
      'Warranty',
      'AMC & insurance',
      'History',
    ),
    primary: { default: pa('Report breakdown', 'Maintenance & breakdowns', 'report-breakdown') },
  },
  operator: {
    type: 'operator',
    label: 'Operator',
    module: 'operators',
    list: 'operators',
    tabs: tabs('Profile & KYC', 'Documents & licences', 'Training & inductions', 'Availability', 'Assignments', 'Attendance & leave', 'Earnings', 'Performance', 'Logbook'),
    primary: { default: pa('Assign to work order', 'Assignments') },
  },
  inspection: {
    type: 'inspection',
    label: 'Inspection',
    module: 'compliance',
    list: 'inspections',
    stages: [
      st('Scheduled', 'Checklist results'),
      st('Inspected', 'Checklist results'),
      st('Passed / Failed', 'Certificate', [
        { id: 'passed', label: 'Passed' },
        { id: 'failed', label: 'Failed', negative: true },
      ]),
      st('Re-inspected', 'Re-inspection'),
    ],
    tabs: tabs('Checklist results', 'Evidence', 'Defects', 'Certificate', 'Corrective actions', 'Re-inspection', 'History'),
    primary: {
      scheduled: pa('Start inspection', 'Checklist results'),
      inspected: pa('Record result', 'Certificate'),
      passed: pa('Issue certificate', 'Certificate'),
      failed: pa('Schedule re-inspection', 'Re-inspection'),
      're-inspected': null,
    },
  },
  incident: {
    type: 'incident',
    label: 'Incident',
    module: 'compliance',
    list: 'incidents',
    stages: [st('Reported', 'Report'), st('Investigating', 'Investigation'), st('Actions', 'Corrective actions'), st('Closed', 'History')],
    tabs: tabs('Report', 'Investigation', 'Corrective actions', 'Documents', 'History'),
    primary: {
      reported: pa('Start investigation', 'Investigation'),
      investigating: pa('Add corrective action', 'Corrective actions'),
      actions: pa('Close incident', 'Corrective actions'),
      closed: null,
    },
  },
  maintenance: {
    type: 'maintenance',
    label: 'Maintenance work order',
    module: 'maintenance',
    list: 'work-orders',
    stages: [st('Reported', 'Diagnosis'), st('Diagnosed', 'Diagnosis'), st('Repairing', 'Repair log & testing'), st('Testing', 'Repair log & testing'), st('Closed', 'Cost & invoice')],
    tabs: tabs('Diagnosis', 'Warranty / AMC check', 'Parts', 'Technician & schedule', 'Repair log & testing', 'Cost & invoice', 'History'),
    primary: {
      reported: pa('Record diagnosis', 'Diagnosis'),
      diagnosed: pa('Request parts', 'Parts'),
      repairing: pa('Log repair', 'Repair log & testing'),
      testing: pa('Pass load test', 'Repair log & testing'),
      closed: null,
    },
  },
  amc: {
    type: 'amc',
    label: 'AMC & warranty',
    module: 'maintenance',
    list: 'amc-warranty',
    tabs: tabs('Coverage', 'Cranes covered', 'Visits', 'Claims', 'Documents'),
    primary: { default: pa('Log visit', 'Visits') },
  },
  item: {
    type: 'item',
    label: 'Item',
    module: 'inventory',
    list: 'items',
    tabs: tabs('Stock by location', 'Movements', 'Reorder', 'Fits cranes', 'Used in maintenance', 'Vendors & prices', 'Valuation'),
    primary: { default: pa('Raise purchase request', 'Reorder') },
  },
  purchase: {
    type: 'purchase',
    label: 'Purchase',
    module: 'inventory',
    list: 'purchasing',
    stages: [st('Request', 'Lines'), { id: 'rfq', label: 'RFQ', tab: 'rfq-quotes' }, st('Order', 'Order'), st('Received', 'Receipt')],
    tabs: tabs('Lines', 'RFQ quotes', 'Order', 'Receipt', 'Bills', 'Documents'),
    primary: {
      request: pa('Send RFQ', 'RFQ quotes'),
      rfq: pa('Select vendor', 'RFQ quotes'),
      order: pa('Record receipt', 'Receipt'),
      received: pa('Match bill', 'Bills'),
    },
  },
  vendor: {
    type: 'vendor',
    label: 'Vendor',
    module: 'inventory',
    list: 'vendors',
    tabs: tabs('Profile', 'Items & prices', 'Orders', 'Bills & payments', 'Performance', 'Documents'),
    primary: { default: pa('New purchase order', 'Orders') },
  },
  // MONEY & PEOPLE
  invoice: {
    type: 'invoice',
    label: 'Invoice',
    module: 'finance',
    list: 'receivables',
    tabs: tabs('Lines', 'Tax', 'Payments', 'Credit & debit notes', 'E-invoice status', 'Documents', 'History'),
    primary: { default: pa('Record payment', 'Payments') },
  },
  employee: {
    type: 'employee',
    label: 'Employee',
    module: 'hr',
    list: 'employees',
    tabs: tabs('Profile', 'Documents', 'Training', 'Attendance & leave', 'Payroll', 'Performance', 'Expenses'),
    primary: { default: pa('Edit profile', 'Profile') },
  },
  payroll: {
    type: 'payroll',
    label: 'Payroll run',
    module: 'hr',
    list: 'payroll',
    stages: [st('Draft', 'Employees'), st('Reviewed', 'Earnings & deductions'), st('Approved', 'Approval'), st('Paid', 'Payslips')],
    tabs: tabs('Employees', 'Earnings & deductions', 'Advances', 'Payslips', 'Approval'),
    primary: {
      draft: pa('Mark reviewed', 'Earnings & deductions'),
      reviewed: pa('Send for approval', 'Approval'),
      approved: pa('Release payments', 'Payslips'),
      paid: null,
    },
  },
  // INSIGHT & ADMIN
  ticket: {
    type: 'ticket',
    label: 'Support ticket',
    module: 'comms',
    list: 'support',
    stages: [st('Open', 'Conversation'), st('In progress', 'Conversation'), st('Resolved', 'Conversation'), st('Closed', 'History')],
    tabs: tabs('Conversation', 'Linked records', 'SLA', 'History'),
    primary: {
      open: pa('Reply', 'Conversation'),
      'in-progress': pa('Mark resolved', 'Conversation'),
      resolved: pa('Close ticket', 'Conversation'),
      closed: null,
    },
  },
}

export const workspaceByList: Record<string, WorkspaceConfig> = Object.fromEntries(
  Object.values(workspaces).map((w) => [`${w.module}/${w.list}`, w]),
)

export function stageIndex(cfg: WorkspaceConfig, stage?: string) {
  if (!cfg.stages || !stage) return -1
  return cfg.stages.findIndex((s) => s.id === stage || s.options?.some((o) => o.id === stage))
}
