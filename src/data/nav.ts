import { Banknote, Boxes, Building2, CalendarCheck, ChartColumn, Construction, FolderKanban, Handshake, HardHat, MessagesSquare, Settings, ShieldCheck, Tags, UserCog, UsersRound, Wrench, type LucideIcon } from 'lucide-react'
import { slugify } from '@/lib/utils'

export type Action = string | { label: string; isNew?: boolean }
export type ActionGroup = { title?: string; actions: Action[] }
export type NavItem = { id: string; label: string; purpose: string; groups: ActionGroup[]; views?: string[] }
export type NavModule = { id: string; label: string; icon: LucideIcon; group?: string; old: number; items: NavItem[]; purpose?: string; groups?: ActionGroup[] }

const n = (label: string): Action => ({ label, isNew: true })
const it = (label: string, purpose: string, actions: Action[], extra?: { id?: string; more?: ActionGroup[]; views?: string[] }): NavItem => ({
  id: extra?.id ?? slugify(label),
  label,
  purpose,
  groups: [{ actions }, ...(extra?.more ?? [])],
  views: extra?.views,
})

export const groups = ['SELL', 'DELIVER', 'ASSETS', 'MONEY & PEOPLE', 'INSIGHT & ADMIN']

export const modules: NavModule[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Building2, old: 0, items: [], purpose: 'A summary of the business for the signed-in role.', groups: [{ actions: [] }] },
  {
    id: 'crm', label: 'CRM & Sales', icon: Handshake, group: 'SELL', old: 10,
    items: [
      it('Leads', 'Early interest before it becomes an enquiry.', ['New lead', 'Import', 'Assign owner', 'Change stage', 'Saved views']),
      it('Enquiries', 'Every incoming request, from every source.', ['New enquiry', 'Import', 'Match cranes & quote', 'Convert to requirement', 'Decline']),
      it('Quotations', 'All quotes and offer templates.', ['Create quotation', 'Revise', 'Mark as accepted', 'Download PDF', 'New template']),
      it('Activities', 'Tasks, calls and site visits for the sales team.', ['Add task', 'Reassign tasks', 'Call', 'Directions']),
      it('Retention', 'Feedback, renewals and win-back.', ['Send survey', 'Send renewal', 'Propose', 'Create lead']),
    ],
  },
  {
    id: 'services', label: 'Services & Pricing', icon: Tags, group: 'SELL', old: 13,
    items: [
      it('Catalogue', 'The services you sell, and how they list on Book My Crane.', ['New service', 'Preview on Book My Crane']),
      it('Rate cards', 'Standard rates by crane and period.', ['Publish changes']),
      it('Pricing rules', 'Floors, uplifts and discount limits.', ['New rule', 'Test a price']),
      it('Service areas', 'Where you work and at what cost.', ['View on map']),
      it('Policies & tax', 'Terms, cancellation and tax rules.', ['Publish new version', 'Edit SOS rates'], { id: 'policies-tax' }),
    ],
  },
  {
    id: 'customers', label: 'Customers', icon: Building2, group: 'SELL', old: 15,
    items: [
      it('Customers', 'Everyone you work for, with their full history.', ['Add customer', 'Import']),
      it('Sites', 'Customer sites and their access rules.', ['Add site', 'Open in maps']),
    ],
  },
  {
    id: 'bookings', label: 'Bookings', icon: CalendarCheck, group: 'DELIVER', old: 10,
    items: [
      it('Bookings', 'Confirmed work of every booking type.', ['New booking', 'Calendar', 'Export']),
      it('SOS', 'Emergency requests, live.', ['Log phone SOS', 'Accept & assign', 'Decline', 'Track live', 'SOS settings'], { id: 'sos' }),
    ],
  },
  {
    id: 'projects', label: 'Projects & Contracts', icon: FolderKanban, group: 'DELIVER', old: 12,
    items: [
      it('Projects', 'Long-running work across sites and cranes.', ['New project']),
      it('Contracts', 'Contracts, templates and amendments.', ['New contract template', 'Amend contract']),
    ],
  },
  {
    id: 'operations', label: 'Operations', icon: HardHat, group: 'DELIVER', old: 16,
    items: [
      it("Today's jobs", 'Everything mobilising or on site today.', ['New work order'], { id: 'todays-jobs', views: ['Board', 'List', 'Map'] }),
      it('Allocation planner', 'Cranes and operators against the calendar.', ['Allocate crane', 'Re-allocate', 'Assign relief']),
      it('Work orders', 'Crane and operator instructions for each job.', ['New work order', 'Print job card']),
      it('Jobs', 'Work in progress on site.', ['Add work log', 'Swap crane', 'Add fuel entry', 'Generate invoice & close']),
      it('Timesheets & approvals', 'Hours and logbooks waiting for sign-off.', ['Send for approval', 'Remind', 'Resolve', 'Approve selected'], { id: 'timesheets' }),
      it('Gate passes & permits', 'Site access and statutory permits.', [n('New gate pass'), n('Request permit')], { id: 'gate-passes' }),
    ],
  },
  {
    id: 'fleet', label: 'Fleet', icon: Construction, group: 'ASSETS', old: 16,
    items: [
      it('Cranes & assets', 'Every crane and asset you own.', ['Add crane', 'Add asset', 'Scan QR', 'Book inspection', 'Buy via TradeHub'], { id: 'cranes' }),
      it('Documents & expiry', 'Fitness, insurance and registration papers.', ['Upload', 'Remind', 'Alert rules'], { id: 'documents' }),
      it('Insurance & warranty claims', 'Open claims with insurers and makers.', ['New claim', 'Policy documents'], { id: 'claims' }),
      it('Fuel, cost & utilisation', 'What each crane earns and costs.', ['Add fuel entry', 'Export'], { id: 'utilisation' }),
    ],
  },
  {
    id: 'operators', label: 'Operators', icon: UserCog, group: 'ASSETS', old: 13,
    items: [
      it('Operators', 'Your operators and their KYC.', ['Add operator', 'Invite to Operator App', 'Remind (KYC)']),
      it('Availability & assignments', 'Who is free, assigned or on leave.', ['Assign to job'], { id: 'availability' }),
      it('Licences & training', 'Licences and training that need renewing.', ['Upload document', 'Schedule training'], { id: 'licences' }),
    ],
  },
  {
    id: 'compliance', label: 'Inspection & Compliance', icon: ShieldCheck, group: 'ASSETS', old: 11,
    items: [
      it('Inspections', 'Planned and third-party inspections.', ['Schedule inspection', 'Assign inspector', 'New checklist']),
      it('Certificates & expiry', 'Statutory certificates across the fleet.', ['Upload certificate', 'Share pack'], { id: 'certificates' }),
      it('Failures & actions', 'Failed inspections and what is being done.', ['Create maintenance ticket', 'Request re-inspection'], { id: 'failures' }),
      it('Site safety & inductions', 'Inductions and safety briefings by site.', [n('Schedule induction')], { id: 'site-safety' }),
      it('Incidents', 'Reported incidents and investigations.', ['Report incident', 'Assign investigation officer']),
    ],
  },
  {
    id: 'maintenance', label: 'Maintenance', icon: Wrench, group: 'ASSETS', old: 12,
    items: [
      it('Breakdowns', 'Cranes off hire right now.', ['Create work order', 'Call operator']),
      it('Work orders', 'Repairs and job cards.', ['New job card', 'Add part', 'Complete & test']),
      it('Preventive schedule', 'Services due by hours or date.', ['Schedule service'], { id: 'preventive' }),
      it('AMC & warranty', 'Service contracts and warranty cover.', [n('Raise AMC claim')], { id: 'amc-warranty' }),
      it('Technicians', 'In-house and AMC engineers.', ['Add engineer']),
    ],
  },
  {
    id: 'inventory', label: 'Inventory', icon: Boxes, group: 'ASSETS', old: 22,
    items: [
      it('Items', 'Spare parts and consumables.', ['New item']),
      it('Stock movements', 'Receipts, issues and transfers.', ['Stock in / out', 'New transfer', 'New adjustment']),
      it('Requests & issues', 'Part requests from maintenance.', ['Material request', 'Issue remaining'], { id: 'requests' }),
      it('Purchasing', 'RFQs, purchase orders and receipts.', ['Open RFQ on TradeHub', 'Create PO', 'Receive parts']),
      it('Vendors', 'Who you buy from.', ['Add vendor']),
    ],
  },
  {
    id: 'finance', label: 'Finance & Accounting', icon: Banknote, group: 'MONEY & PEOPLE', old: 28,
    items: [
      it('Receivables', 'Invoices, escrow releases and refunds.', ['Create invoice', 'Record payment', 'Send reminders', 'New credit note'], {
        more: [
          { title: 'Escrow', actions: ['Request release', 'Remind customer'] },
          { title: 'Refunds', actions: ['Send response'] },
        ],
      }),
      it('Payables & expenses', 'Vendor bills and expenses.', ['Record bill', 'Payment run', 'Crane expense', 'Office expense'], { id: 'payables' }),
      it('Banking', 'Bank statements and matching.', ['Import statement', 'Find match']),
      it('Tax', 'GST returns.', ['File GSTR-1', 'Download returns']),
      it('Accounting', 'Journals and statements.', ['New journal', 'Download statements']),
      it('Assets & loans', 'Fixed assets, loans and depreciation.', ['Run depreciation'], { id: 'assets-loans' }),
      it('Costing', 'Cost and margin per job.', []),
    ],
  },
  {
    id: 'hr', label: 'HR & Payroll', icon: UsersRound, group: 'MONEY & PEOPLE', old: 14,
    items: [
      it('Employees', 'Staff records.', ['Add employee']),
      it('Attendance', 'Daily attendance.', ['Mark attendance']),
      it('Leave', 'Requests waiting for a decision.', ['Approve with relief', 'Reject leave', 'Apply on behalf']),
      it('Payroll', 'Monthly payroll and advances.', ['Run payroll', 'Give advance', 'Approve & pay']),
    ],
  },
  {
    id: 'reports', label: 'Reports & Analytics', icon: ChartColumn, group: 'INSIGHT & ADMIN', old: 12,
    items: [
      it('Report library', 'All standard reports.', ['Download', 'Schedule'], { id: 'library' }),
      it('Management reports', 'Monthly pack for directors.', ['Download', 'Schedule'], { id: 'management' }),
      it('Saved & scheduled', 'Your saved reports.', ['Scheduled reports'], { id: 'saved' }),
    ],
  },
  {
    id: 'comms', label: 'Communications', icon: MessagesSquare, group: 'INSIGHT & ADMIN', old: 12,
    items: [
      it('Inbox', 'Customer and operator conversations.', ['New message', 'Mark all as read']),
      it('Notifications', 'Everything sent to you.', ['Mark all as read']),
      it('Support', 'Support tickets.', ['New ticket', 'Escalate', 'Resolve']),
      it('Channels & templates', 'WhatsApp, SMS and email templates.', ['Templates', 'New template', 'Test send'], { id: 'channels' }),
    ],
  },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'INSIGHT & ADMIN', old: 14, items: [], purpose: 'Company setup, users and rules.', groups: [{ actions: ['Add branch', 'Invite user', 'Duplicate role', 'New approval rule', 'API keys'] }] },
]

export const moduleById = Object.fromEntries(modules.map((m) => [m.id, m])) as Record<string, NavModule>

export const oldCrmItems = ['Leads', 'Enquiries', 'Book My Crane Leads', 'Requirements', 'Site Surveys', 'Quotations', 'Negotiations', 'Follow-ups', 'Customer Feedback', 'Repeat Business']

export const itemPath = (moduleId: string, itemId: string) => `/${moduleId}/${itemId}`
export const modulePath = (id: string) => (id === 'dashboard' ? '/' : `/${id}`)
