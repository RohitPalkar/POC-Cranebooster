import {
  Banknote,
  Boxes,
  Building2,
  ChartColumn,
  FolderKanban,
  Handshake,
  HardHat,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  ShieldCheck,
  Tags,
  Truck,
  UsersRound,
  Wrench,
  CalendarCheck,
  Construction,
  type LucideIcon,
} from 'lucide-react'
import type { Tone } from '@/components/ui/badge'

export type NavBadge = { count: number; label: string; tone?: Tone }
export type NavItem = { id: string; label: string; badge?: NavBadge }
export type Kpi = { label: string; value: string; delta?: string; tone?: Tone; hint?: string }
export type Queue = { label: string; count: number; item: string; tone: Tone; hint: string }
export type NavModule = {
  id: string
  label: string
  icon: LucideIcon
  group?: GroupId
  items: NavItem[]
  kpis?: Kpi[]
  queues?: Queue[]
}
export type GroupId = 'sell' | 'deliver' | 'assets' | 'money' | 'insight'

export const groups: { id: GroupId; label: string }[] = [
  { id: 'sell', label: 'SELL' },
  { id: 'deliver', label: 'DELIVER' },
  { id: 'assets', label: 'ASSETS' },
  { id: 'money', label: 'MONEY & PEOPLE' },
  { id: 'insight', label: 'INSIGHT & ADMIN' },
]

const q = (label: string, count: number, item: string, tone: Tone, hint: string): Queue => ({ label, count, item, tone, hint })

export const modules: NavModule[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, items: [] },
  {
    id: 'crm',
    label: 'CRM & Sales',
    icon: Handshake,
    group: 'sell',
    items: [
      { id: 'leads', label: 'Leads' },
      { id: 'enquiries', label: 'Enquiries', badge: { count: 12, label: 'new' } },
      { id: 'quotations', label: 'Quotations', badge: { count: 4, label: 'awaiting approval' } },
      { id: 'activities', label: 'Activities', badge: { count: 2, label: 'overdue', tone: 'danger' } },
      { id: 'retention', label: 'Retention' },
    ],
    kpis: [
      { label: 'Open enquiries', value: '38', delta: '+6 this week', tone: 'neutral' },
      { label: 'Quotes sent (Nov)', value: '₹1,84,60,000', delta: '24 quotes', tone: 'neutral' },
      { label: 'Win rate (90 days)', value: '41%', delta: '+3 pts', tone: 'success' },
      { label: 'BMC replies due today', value: '5', delta: '2 within 2 h', tone: 'warning' },
    ],
    queues: [
      q('New enquiries', 12, 'enquiries', 'brand', 'Unassigned or not yet qualified'),
      q('Quotes awaiting approval', 4, 'quotations', 'warning', 'Discounts below pricing rules'),
      q('Overdue follow-ups', 2, 'activities', 'danger', 'Past their due date'),
      q('Expiring quotes', 3, 'quotations', 'neutral', 'Validity ends in 3 days'),
    ],
  },
  {
    id: 'services',
    label: 'Services & Pricing',
    icon: Tags,
    group: 'sell',
    items: [
      { id: 'catalogue', label: 'Catalogue' },
      { id: 'rate-cards', label: 'Rate cards' },
      { id: 'pricing-rules', label: 'Pricing rules' },
      { id: 'service-areas', label: 'Service areas' },
      { id: 'policies-tax', label: 'Policies & tax' },
    ],
    kpis: [
      { label: 'Active services', value: '27' },
      { label: 'Rate cards', value: '9', delta: '2 expire in Dec' },
      { label: 'Pricing rules', value: '41' },
      { label: 'Listed on Book My Crane', value: '18' },
    ],
    queues: [q('Rate cards to renew', 2, 'rate-cards', 'warning', 'Expire before 31 Dec'), q('Draft services', 3, 'catalogue', 'neutral', 'Not yet listed')],
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Building2,
    group: 'sell',
    items: [
      { id: 'customers', label: 'Customers' },
      { id: 'sites', label: 'Sites' },
    ],
    kpis: [
      { label: 'Active customers', value: '212' },
      { label: 'Active sites', value: '64' },
      { label: 'Repeat business', value: '58%', tone: 'success', delta: '+4 pts' },
      { label: 'Credit on hold', value: '3', tone: 'danger' },
    ],
    queues: [q('Credit on hold', 3, 'customers', 'danger', 'Overdue beyond limit'), q('Sites missing induction pack', 4, 'sites', 'warning', 'Required before first job')],
  },
  {
    id: 'bookings',
    label: 'Bookings',
    icon: CalendarCheck,
    group: 'deliver',
    items: [
      { id: 'bookings', label: 'Bookings' },
      { id: 'sos', label: 'SOS', badge: { count: 1, label: 'live', tone: 'danger' } },
    ],
    kpis: [
      { label: 'Upcoming (7 days)', value: '14' },
      { label: 'Active now', value: '22' },
      { label: 'Booked value (Nov)', value: '₹2,36,40,000' },
      { label: 'Awaiting advance', value: '5', tone: 'warning' },
    ],
    queues: [q('Awaiting advance', 5, 'bookings', 'warning', 'Mobilisation blocked'), q('Live SOS', 1, 'sos', 'danger', 'Breakdown support on site')],
  },
  {
    id: 'projects',
    label: 'Projects & Contracts',
    icon: FolderKanban,
    group: 'deliver',
    items: [
      { id: 'projects', label: 'Projects' },
      { id: 'contracts', label: 'Contracts', badge: { count: 2, label: 'renewal due', tone: 'warning' } },
    ],
    kpis: [
      { label: 'Active projects', value: '9' },
      { label: 'Active contracts', value: '17' },
      { label: 'Renewals due (30 days)', value: '2', tone: 'warning' },
      { label: 'Project margin', value: '23.4%', tone: 'success' },
    ],
    queues: [q('Renewals due', 2, 'contracts', 'warning', 'Within 30 days'), q('Projects over budget', 1, 'projects', 'danger', 'Expenses above plan')],
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: HardHat,
    group: 'deliver',
    items: [
      { id: 'todays-jobs', label: "Today's jobs", badge: { count: 3, label: 'not ready', tone: 'warning' } },
      { id: 'allocation-planner', label: 'Allocation planner' },
      { id: 'work-orders', label: 'Work orders' },
      { id: 'jobs', label: 'Jobs' },
      { id: 'timesheets', label: 'Timesheets & approvals', badge: { count: 8, label: 'to approve' } },
      { id: 'gate-passes', label: 'Gate passes & permits' },
    ],
    kpis: [
      { label: "Today's jobs", value: '19', delta: '3 not ready', tone: 'warning' },
      { label: 'Cranes on site', value: '31 / 46' },
      { label: 'On-time mobilisation', value: '92%', tone: 'success' },
      { label: 'Timesheets to approve', value: '8', tone: 'brand' },
    ],
    queues: [
      q('Jobs not ready', 3, 'todays-jobs', 'warning', 'Readiness checks open'),
      q('Timesheets to approve', 8, 'timesheets', 'brand', 'Submitted by operators'),
      q('Unallocated work orders', 4, 'work-orders', 'neutral', 'Need crane and operator'),
      q('Gate passes pending', 2, 'gate-passes', 'warning', 'Site approval awaited'),
    ],
  },
  {
    id: 'fleet',
    label: 'Fleet',
    icon: Construction,
    group: 'assets',
    items: [
      { id: 'cranes', label: 'Cranes' },
      { id: 'documents', label: 'Documents & expiry', badge: { count: 5, label: 'expiring', tone: 'warning' } },
      { id: 'claims', label: 'Insurance & warranty claims' },
      { id: 'utilisation', label: 'Utilisation & profitability' },
    ],
    kpis: [
      { label: 'Fleet size', value: '46' },
      { label: 'Utilisation (30 days)', value: '74%', tone: 'success' },
      { label: 'Under maintenance', value: '4', tone: 'warning' },
      { label: 'Revenue per crane (Nov)', value: '₹5,12,000' },
    ],
    queues: [q('Documents expiring', 5, 'documents', 'warning', 'Within 30 days'), q('Open claims', 2, 'claims', 'neutral', 'With insurer')],
  },
  {
    id: 'operators',
    label: 'Operators',
    icon: UsersRound,
    group: 'assets',
    items: [
      { id: 'operators', label: 'Operators' },
      { id: 'availability', label: 'Availability & assignments' },
      { id: 'licences', label: 'Licences & training', badge: { count: 3, label: 'expiring', tone: 'warning' } },
    ],
    kpis: [
      { label: 'Operators', value: '58' },
      { label: 'Assigned today', value: '41' },
      { label: 'Licences expiring', value: '3', tone: 'warning' },
      { label: 'Avg. rating', value: '4.6 / 5' },
    ],
    queues: [q('Licences expiring', 3, 'licences', 'warning', 'Within 30 days'), q('Unassigned today', 6, 'availability', 'neutral', 'Available for allocation')],
  },
  {
    id: 'compliance',
    label: 'Inspection & Compliance',
    icon: ShieldCheck,
    group: 'assets',
    items: [
      { id: 'inspections', label: 'Inspections' },
      { id: 'certificates', label: 'Certificates & expiry', badge: { count: 4, label: 'expiring', tone: 'warning' } },
      { id: 'failures', label: 'Failures & actions', badge: { count: 2, label: 'open', tone: 'danger' } },
      { id: 'site-safety', label: 'Site safety & inductions' },
      { id: 'incidents', label: 'Incidents' },
    ],
    kpis: [
      { label: 'Inspections due (7 days)', value: '7' },
      { label: 'Pass rate (90 days)', value: '94%', tone: 'success' },
      { label: 'Open failures', value: '2', tone: 'danger' },
      { label: 'Days since last incident', value: '43' },
    ],
    queues: [q('Open failures', 2, 'failures', 'danger', 'Crane blocked from dispatch'), q('Certificates expiring', 4, 'certificates', 'warning', 'Within 30 days')],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: Wrench,
    group: 'assets',
    items: [
      { id: 'breakdowns', label: 'Breakdowns', badge: { count: 2, label: 'open', tone: 'danger' } },
      { id: 'work-orders', label: 'Work orders' },
      { id: 'preventive', label: 'Preventive schedule' },
      { id: 'amc-warranty', label: 'AMC & warranty' },
      { id: 'technicians', label: 'Technicians' },
    ],
    kpis: [
      { label: 'Open breakdowns', value: '2', tone: 'danger' },
      { label: 'PM due (7 days)', value: '6' },
      { label: 'Mean time to repair', value: '9.5 h' },
      { label: 'Maintenance cost (Nov)', value: '₹6,84,500' },
    ],
    queues: [q('Open breakdowns', 2, 'breakdowns', 'danger', 'Cranes off hire'), q('PM overdue', 1, 'preventive', 'warning', 'Past service hours')],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Boxes,
    group: 'assets',
    items: [
      { id: 'items', label: 'Items' },
      { id: 'stock-movements', label: 'Stock movements' },
      { id: 'requests', label: 'Requests & issues', badge: { count: 3, label: 'to issue' } },
      { id: 'purchasing', label: 'Purchasing' },
      { id: 'vendors', label: 'Vendors' },
    ],
    kpis: [
      { label: 'Stock value', value: '₹38,72,000' },
      { label: 'Below reorder level', value: '7', tone: 'warning' },
      { label: 'Open POs', value: '5' },
      { label: 'Requests to issue', value: '3', tone: 'brand' },
    ],
    queues: [q('Requests to issue', 3, 'requests', 'brand', 'From maintenance'), q('Below reorder', 7, 'items', 'warning', 'Raise purchase request')],
  },
  {
    id: 'finance',
    label: 'Finance & Accounting',
    icon: Banknote,
    group: 'money',
    items: [
      { id: 'receivables', label: 'Receivables', badge: { count: 6, label: 'overdue', tone: 'danger' } },
      { id: 'payables', label: 'Payables & expenses' },
      { id: 'banking', label: 'Banking' },
      { id: 'tax', label: 'Tax' },
      { id: 'accounting', label: 'Accounting' },
      { id: 'assets-loans', label: 'Assets & loans' },
      { id: 'costing', label: 'Costing' },
    ],
    kpis: [
      { label: 'Receivables', value: '₹1,42,18,000' },
      { label: 'Overdue > 30 days', value: '₹18,64,000', tone: 'danger' },
      { label: 'Payables due (7 days)', value: '₹12,40,000' },
      { label: 'Cash in bank', value: '₹74,30,500' },
    ],
    queues: [q('Overdue invoices', 6, 'receivables', 'danger', 'Beyond credit terms'), q('Expenses to approve', 9, 'payables', 'brand', 'Submitted this week')],
  },
  {
    id: 'hr',
    label: 'HR & Payroll',
    icon: UsersRound,
    group: 'money',
    items: [
      { id: 'employees', label: 'Employees' },
      { id: 'attendance', label: 'Attendance' },
      { id: 'leave', label: 'Leave', badge: { count: 4, label: 'to approve' } },
      { id: 'payroll', label: 'Payroll' },
    ],
    kpis: [
      { label: 'Employees', value: '134' },
      { label: 'Present today', value: '121' },
      { label: 'Leave requests', value: '4', tone: 'brand' },
      { label: 'Nov payroll', value: '₹48,20,000' },
    ],
    queues: [q('Leave to approve', 4, 'leave', 'brand', 'Pending manager decision'), q('Payroll run in review', 1, 'payroll', 'warning', 'November 2025')],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: ChartColumn,
    group: 'insight',
    items: [
      { id: 'library', label: 'Report library' },
      { id: 'management', label: 'Management reports' },
      { id: 'saved', label: 'Saved & scheduled' },
    ],
    kpis: [
      { label: 'Reports', value: '64' },
      { label: 'Scheduled', value: '11' },
      { label: 'Shared with me', value: '7' },
      { label: 'Last run', value: '08:00 today' },
    ],
    queues: [q('Failed schedules', 1, 'saved', 'danger', 'Email delivery failed')],
  },
  {
    id: 'comms',
    label: 'Communications',
    icon: MessagesSquare,
    group: 'insight',
    items: [
      { id: 'inbox', label: 'Inbox', badge: { count: 5, label: 'unread' } },
      { id: 'notifications', label: 'Notifications' },
      { id: 'support', label: 'Support', badge: { count: 3, label: 'open', tone: 'warning' } },
      { id: 'channels', label: 'Channels & templates' },
    ],
    kpis: [
      { label: 'Unread', value: '5', tone: 'brand' },
      { label: 'Open tickets', value: '3', tone: 'warning' },
      { label: 'First response', value: '22 min' },
      { label: 'WhatsApp templates', value: '14' },
    ],
    queues: [q('Tickets breaching SLA', 1, 'support', 'danger', 'Respond within 1 h'), q('Unread conversations', 5, 'inbox', 'brand', 'Customers and operators')],
  },
  { id: 'settings', label: 'Settings', icon: Settings, items: [] },
]

export const moduleById = Object.fromEntries(modules.map((m) => [m.id, m])) as Record<string, NavModule>

export function modulePath(id: string) {
  return id === 'dashboard' ? '/' : `/${id}`
}

export function itemPath(moduleId: string, itemId: string) {
  return `/${moduleId}/${itemId}`
}

export const truckIcon = Truck
