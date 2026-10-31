import type { Tone } from '@/components/ui/badge'

export type SimpleList = { hint: string; columns: string[]; rows: string[][]; status?: number }

const statusTones: Record<string, Tone> = {
  Active: 'success', Valid: 'success', Done: 'success', Approved: 'success', Paid: 'success', Present: 'success', Available: 'success', Published: 'success', Delivered: 'success', Sent: 'success', 'On track': 'success',
  Draft: 'neutral', Upcoming: 'neutral', Scheduled: 'neutral', Closed: 'neutral', Assigned: 'info', 'In review': 'info', 'With insurer': 'info', Filed: 'success', Reconciled: 'success',
  Pending: 'warning', 'To approve': 'warning', 'Expiring soon': 'warning', 'Due soon': 'warning', 'To issue': 'brand', 'Below reorder': 'warning', 'On leave': 'neutral', Unread: 'brand', 'At risk': 'warning', Due: 'warning', 'Not due': 'neutral',
  Expired: 'danger', Overdue: 'danger', Open: 'danger', Failed: 'danger', Absent: 'danger',
}

export const statusTone = (s: string): Tone => statusTones[s] ?? 'neutral'

/** Queues that are not record workspaces. Status cells render as chips; record IDs render as links. */
export const simpleLists: Record<string, SimpleList> = {
  'crm/retention': { hint: 'Customers who have gone quiet or are due for a repeat', status: 3, columns: ['Customer', 'Last job', 'Value (12 months)', 'Status'], rows: [['CUS-0149', '25 Oct 2025', '₹76,800', 'At risk'], ['CUS-0177', '14 Nov 2025', '₹42,60,000', 'On track'], ['CUS-0192', '2 Oct 2025', '₹18,20,000', 'At risk']] },
  'services/rate-cards': { hint: 'Standard rates by crane class and branch', status: 3, columns: ['Rate card', 'Branch', 'Valid until', 'Status'], rows: [['Crawler 100 T, Pune', 'Pune HQ', '31 Dec 2025', 'Expiring soon'], ['Hydra 50 T, Pune', 'Pune HQ', '31 Dec 2025', 'Expiring soon'], ['All-terrain 220 T, Mumbai', 'Mumbai', '31 Mar 2026', 'Active'], ['Crawler 100 T, Dubai', 'Dubai', '30 Jun 2026', 'Active']] },
  'services/pricing-rules': { hint: 'Floors and discounts. Going below a rule needs approval', status: 3, columns: ['Rule', 'Applies to', 'Limit', 'Status'], rows: [['PR-14', '100 T crawler, Pune, 15+ days', '₹42,000 / day floor', 'Active'], ['PR-11', '50 T hydra, Pune', '10% max discount', 'Active'], ['PR-19', '220 T all-terrain, monthly', '₹72,000 / day floor', 'Active']] },
  'services/service-areas': { hint: 'Where each branch can mobilise and at what cost', status: 3, columns: ['Area', 'Branch', 'Mobilisation', 'Status'], rows: [['Pune and PCMC', 'Pune HQ', 'Included up to 40 km', 'Active'], ['Mumbai metropolitan', 'Mumbai', '₹55,000 flat', 'Active'], ['Dubai and Sharjah', 'Dubai', 'AED 4,500 flat', 'Active']] },
  'services/policies-tax': { hint: 'Standard terms and tax codes used on quotes', status: 2, columns: ['Policy', 'Used on', 'Status'], rows: [['Cancellation within 24 h', 'All quotes', 'Active'], ['GST 18%, SAC 997319', 'India branches', 'Active'], ['VAT 5%', 'Dubai branch', 'Active']] },
  'operations/allocation-planner': { hint: 'Who and what is committed this week', status: 3, columns: ['Crane', 'Work order', 'Dates', 'Status'], rows: [['CR-050', 'WO-3318', '12 – 29 Nov 2025', 'Scheduled'], ['CR-044', 'WO-3311', '4 – 14 Nov 2025', 'Assigned'], ['CR-062', 'WO-3309', '6 – 12 Nov 2025', 'Assigned'], ['CR-019', 'WO-3314', '18 Nov 2025', 'Scheduled']] },
  'operations/timesheets': { hint: 'Submitted by operators, signed by site engineers', status: 4, columns: ['Job', 'Operator', 'Date', 'Hours', 'Status'], rows: [['JB-5512', 'Deepak Yadav', '10 Nov 2025', '11.5 h', 'To approve'], ['JB-5512', 'Deepak Yadav', '9 Nov 2025', '12.0 h', 'To approve'], ['JB-5509', 'Sunil Patil', '10 Nov 2025', '10.0 h', 'To approve'], ['JB-5490', 'Rahul Bhosale', '28 Oct 2025', '10.0 h', 'Approved']] },
  'operations/gate-passes': { hint: 'Site access and permits for upcoming jobs', status: 3, columns: ['Pass', 'Work order', 'Site', 'Status'], rows: [['GP-8821', 'WO-3318', 'Hinjewadi Phase 3', 'Pending'], ['GP-8817', 'WO-3316', 'Thane towers', 'Pending'], ['GP-8804', 'WO-3311', 'NH-48 package 3', 'Valid']] },
  'fleet/documents': { hint: 'Fitness, insurance and registration papers by crane', status: 3, columns: ['Crane', 'Document', 'Expires', 'Status'], rows: [['CR-031', 'Load test certificate', '2 Nov 2025', 'Expired'], ['CR-012', 'Insurance policy', '21 Nov 2025', 'Expiring soon'], ['CR-044', 'Road permit', '30 Nov 2025', 'Expiring soon'], ['CR-050', 'Fitness certificate', '14 Mar 2026', 'Valid']] },
  'fleet/claims': { hint: 'Open claims with insurers and manufacturers', status: 3, columns: ['Claim', 'Crane', 'Amount', 'Status'], rows: [['CLM-0044', 'CR-012', '₹1,84,000', 'With insurer'], ['CLM-0041', 'CR-044', '₹62,500', 'With insurer']] },
  'fleet/utilisation': { hint: 'Billed hours and margin per crane, last 30 days', columns: ['Crane', 'Utilisation', 'Revenue', 'Margin'], rows: [['CR-050', '68%', '₹6,84,000', '31%'], ['CR-044', '92%', '₹9,42,000', '38%'], ['CR-062', '81%', '₹14,20,000', '29%'], ['CR-012', '44%', '₹2,10,000', '12%']] },
  'operators/availability': { hint: 'Who is free, on a job or on leave this week', status: 3, columns: ['Operator', 'Class', 'This week', 'Status'], rows: [['OP-118', 'Crawler, up to 250 T', 'Free until allocated', 'Available'], ['OP-124', 'Crawler, up to 150 T', 'JB-5512 until 14 Nov', 'Assigned'], ['OP-142', 'Hydra, up to 50 T', 'Back 17 Nov', 'On leave']] },
  'operators/licences': { hint: 'Licences and training that need renewing', status: 3, columns: ['Operator', 'Licence or course', 'Expires', 'Status'], rows: [['OP-131', 'Crawler licence', '17 Nov 2025', 'Expiring soon'], ['OP-124', 'Crawler licence', 'Feb 2026', 'Valid'], ['OP-118', 'Rigging refresher', 'Aug 2027', 'Valid']] },
  'compliance/certificates': { hint: 'Statutory certificates across the fleet', status: 3, columns: ['Certificate', 'Crane', 'Expires', 'Status'], rows: [['Load test', 'CR-031', '2 Nov 2025', 'Expired'], ['Annual inspection', 'CR-019', '28 Nov 2025', 'Expiring soon'], ['Load test', 'CR-050', '14 Mar 2026', 'Valid']] },
  'compliance/failures': { hint: 'Failed inspections and what is being done', status: 3, columns: ['Inspection', 'Crane', 'Defect', 'Status'], rows: [['INS-0457', 'CR-031', 'Wire rope wear above limit', 'Open'], ['INS-0457', 'CR-031', 'Load indicator out of calibration', 'Open']] },
  'compliance/site-safety': { hint: 'Induction packs and safety briefings by site', status: 3, columns: ['Site', 'Requirement', 'Valid until', 'Status'], rows: [['SITE-311', 'Site induction, 45 min', '31 Mar 2026', 'Valid'], ['SITE-298', 'Induction pack missing', '—', 'Pending']] },
  'maintenance/preventive': { hint: 'Services due by running hours or date', status: 3, columns: ['Crane', 'Service', 'Due', 'Status'], rows: [['CR-050', '250 h service', 'in 38 h', 'Due soon'], ['CR-019', '500 h service', 'in 110 h', 'Upcoming'], ['CR-012', '250 h service', '12 h past due', 'Overdue']] },
  'maintenance/technicians': { hint: 'In-house and AMC technicians', status: 3, columns: ['Technician', 'Skill', 'Assigned to', 'Status'], rows: [['Sachin More', 'Hydraulics', 'MWO-0915', 'Assigned'], ['Nitin Jadhav', 'Electrical', '—', 'Available'], ['Dinesh Pawar', 'Engine', '—', 'Available']] },
  'inventory/stock-movements': { hint: 'Receipts, issues and transfers', columns: ['Date', 'Item', 'Movement', 'Location'], rows: [['10 Nov 2025', 'ITM-2290', '−2 nos, issued to MWO-0915', 'Talegaon store'], ['6 Nov 2025', 'ITM-2290', '+5 nos, received', 'Talegaon store']] },
  'inventory/requests': { hint: 'Part requests from maintenance waiting to be issued', status: 3, columns: ['Request', 'Item', 'For', 'Status'], rows: [['REQ-1188', 'ITM-2290', 'MWO-0915', 'To issue'], ['REQ-1187', 'Slew bearing grease, 18 kg', 'MWO-0915', 'To issue'], ['REQ-1185', 'Filter kit, SCX-1000', 'CR-050', 'To issue']] },
  'finance/payables': { hint: 'Vendor bills and staff expenses', status: 3, columns: ['Bill', 'Vendor', 'Amount', 'Status'], rows: [['BIL-7702', 'VEN-0058', '₹1,18,000', 'To approve'], ['EXP-1203', 'Imran Shaikh, site travel', '₹6,450', 'To approve'], ['BIL-7688', 'Deccan Heavy Equipment Services', '₹84,000', 'Paid']] },
  'finance/banking': { hint: 'Account balances and reconciliation', status: 3, columns: ['Account', 'Bank', 'Balance', 'Status'], rows: [['Current, Pune', 'HDFC Bank', '₹62,10,500', 'Reconciled'], ['Current, Dubai', 'Emirates NBD', 'AED 1,12,400', 'Reconciled'], ['Overdraft', 'Axis Bank', '₹12,20,000', 'Pending']] },
  'finance/tax': { hint: 'Returns and e-invoicing', status: 2, columns: ['Return', 'Period', 'Status'], rows: [['GSTR-1', 'Oct 2025', 'Filed'], ['GSTR-3B', 'Oct 2025', 'Due'], ['VAT return, Dubai', 'Q3 2025', 'Filed']] },
  'finance/accounting': { hint: 'Journals and period close', status: 2, columns: ['Journal', 'Period', 'Status'], rows: [['Depreciation, cranes', 'Oct 2025', 'Done'], ['Accruals', 'Oct 2025', 'In review']] },
  'finance/assets-loans': { hint: 'Fixed assets and crane loans', status: 3, columns: ['Loan', 'Asset', 'Next EMI', 'Status'], rows: [['LN-0031', 'CR-050', '₹2,84,000', 'Active'], ['LN-0034', 'CR-062', '₹4,62,000', 'Active']] },
  'finance/costing': { hint: 'Cost and margin per job', columns: ['Job', 'Revenue', 'Cost', 'Margin'], rows: [['JB-5490', '₹4,32,000', '₹3,02,000', '30%'], ['JB-5512', '₹4,85,000', '₹3,10,000', '36%']] },
  'hr/attendance': { hint: 'Today, from the mobile check-in', status: 3, columns: ['Employee', 'Branch', 'Check-in', 'Status'], rows: [['Imran Shaikh', 'Pune HQ', '09:02', 'Present'], ['Sana Kapoor', 'Pune HQ', '09:17', 'Present'], ['Rahul Bhosale', 'Pune HQ', '—', 'On leave']] },
  'hr/leave': { hint: 'Requests waiting for a decision', status: 3, columns: ['Employee', 'Type', 'Dates', 'Status'], rows: [['Rahul Bhosale', 'Annual leave', '11 – 16 Nov', 'Approved'], ['Sachin More', 'Sick leave', '13 Nov', 'To approve'], ['Meera Joshi', 'Annual leave', '24 – 26 Dec', 'To approve']] },
  'reports/library': { hint: 'All standard reports', columns: ['Report', 'Module', 'Last run'], rows: [['Win-loss by source', 'CRM & Sales', 'Today, 08:00'], ['Crane utilisation', 'Fleet', 'Today, 08:00'], ['Receivables ageing', 'Finance & Accounting', 'Yesterday, 18:00']] },
  'reports/management': { hint: 'Monthly pack for directors', status: 2, columns: ['Pack', 'Period', 'Status'], rows: [['Management pack', 'Oct 2025', 'Published'], ['Management pack', 'Nov 2025', 'Draft']] },
  'reports/saved': { hint: 'Your saved reports and schedules', status: 2, columns: ['Report', 'Schedule', 'Status'], rows: [['Receivables ageing', 'Weekly, Monday 08:00', 'Active'], ['Daily job status', 'Daily, 19:00', 'Failed']] },
  'comms/inbox': { hint: 'Customer and operator conversations', status: 3, columns: ['From', 'About', 'When', 'Status'], rows: [['Amit Deshmukh', 'ENQ-1042', 'Today, 09:40', 'Unread'], ['Deepak Yadav', 'JB-5512', 'Today, 08:15', 'Unread'], ['Pooja Bhide', 'INV-5521', 'Yesterday', 'Closed']] },
  'comms/notifications': { hint: 'Everything sent to you, newest first', status: 2, columns: ['Notification', 'When', 'Status'], rows: [['BMC response due for ENQ-1042', 'Today', 'Unread'], ['CR-050 preventive service due', 'Today', 'Unread'], ['Payment received on INV-5521', '3 Nov', 'Closed']] },
  'comms/channels': { hint: 'WhatsApp, SMS and email templates', status: 2, columns: ['Template', 'Channel', 'Status'], rows: [['Quote sent', 'WhatsApp', 'Approved'], ['Crane dispatched', 'SMS', 'Approved'], ['Invoice reminder', 'Email', 'Draft']] },
}

export const listRecordType: Record<string, string> = { 'maintenance/breakdowns': 'maintenance' }

export type QuoteRow = { id: string; enquiry: string; customer: string; value: string; validity: string; bucket: 'approval' | 'sent' | 'expiring' | 'expired'; note: string }

export const quotationRows: QuoteRow[] = [
  { id: 'QT-2231', enquiry: 'ENQ-1042', customer: 'Vardhman Buildcon', value: '₹9,20,000', validity: '13 Nov 2025', bucket: 'approval', note: '12% discount below PR-14' },
  { id: 'QT-2238', enquiry: 'ENQ-1044', customer: 'Al Noor Contracting', value: 'AED 18,500', validity: '14 Nov 2025', bucket: 'approval', note: 'Free standby day requested' },
  { id: 'QT-2236', enquiry: 'ENQ-1043', customer: 'Apex Metro Constructions', value: '₹3,84,000', validity: '20 Nov 2025', bucket: 'approval', note: 'Customer on credit hold' },
  { id: 'QT-2233', enquiry: 'ENQ-1045', customer: 'Kaveri Highways', value: '₹42,60,000', validity: '24 Nov 2025', bucket: 'approval', note: '7% discount below PR-19' },
  { id: 'QT-2234', enquiry: 'ENQ-1041', customer: 'Godavari Power EPC', value: '₹16,20,000', validity: '28 Nov 2025', bucket: 'sent', note: 'Viewed 2 times' },
  { id: 'QT-2229', enquiry: 'ENQ-1039', customer: 'Kaveri Highways', value: '₹4,85,000', validity: '21 Nov 2025', bucket: 'sent', note: 'Accepted' },
  { id: 'QT-2226', enquiry: 'ENQ-1047', customer: 'Shivneri Infra Projects', value: '₹21,60,000', validity: '12 Nov 2025', bucket: 'expiring', note: 'Expires tomorrow' },
  { id: 'QT-2225', enquiry: 'ENQ-1046', customer: 'Narmada Steel Structures', value: '₹96,000', validity: '13 Nov 2025', bucket: 'expiring', note: 'Expires in 2 days' },
  { id: 'QT-2219', enquiry: 'ENQ-1036', customer: 'Falcon Ridge Builders', value: 'AED 9,800', validity: '3 Nov 2025', bucket: 'expired', note: 'No reply' },
]

/** Response deadline per enquiry. rank sorts the inbox; state drives the chip. */
export const enquiryDeadlines: Record<string, { rank: number; when: string; state: 'overdue' | 'soon' | 'ok' | 'none' }> = {
  'ENQ-1046': { rank: 1, when: 'Today, 11:30', state: 'overdue' },
  'ENQ-1048': { rank: 2, when: 'Today, 13:00', state: 'overdue' },
  'ENQ-1042': { rank: 3, when: 'Today, 16:30', state: 'soon' },
  'ENQ-1047': { rank: 4, when: '12 Nov, 11:00', state: 'ok' },
  'ENQ-1044': { rank: 5, when: '13 Nov, 10:00', state: 'ok' },
  'ENQ-1041': { rank: 6, when: '13 Nov, 12:00', state: 'ok' },
  'ENQ-1045': { rank: 7, when: '14 Nov, 18:00', state: 'ok' },
  'ENQ-1043': { rank: 8, when: '15 Nov, 17:00', state: 'ok' },
  'ENQ-1039': { rank: 9, when: '—', state: 'none' },
  'ENQ-1036': { rank: 10, when: '—', state: 'none' },
}

export const surveys = [
  { day: 5, id: 'ENQ-1042', label: 'Hinjewadi depot', who: 'Imran Shaikh', done: true },
  { day: 12, id: 'ENQ-1047', label: 'Thane towers', who: 'Imran Shaikh' },
  { day: 14, id: 'ENQ-1045', label: 'NH-48 package 3', who: 'Vikram Rao' },
  { day: 18, id: 'ENQ-1041', label: 'Ranjangaon plant', who: 'Imran Shaikh' },
]

export const myTasks = [
  { id: 'f1', title: 'Call Amit Deshmukh to confirm Gate 2 access for trailers', due: '10 Nov 2025', record: 'ENQ-1042', overdue: true },
  { id: 't2', title: 'Chase signed quote from Shivneri Infra', due: '10 Nov 2025', record: 'ENQ-1047', overdue: true },
  { id: 'f2', title: 'Reply on Book My Crane before the response deadline', due: 'Today, 16:30', record: 'ENQ-1042' },
  { id: 'f3', title: 'Send revised v2 with the approved discount', due: 'Today, 18:00', record: 'ENQ-1042' },
  { id: 't5', title: 'Confirm boom length with Godavari Power', due: '12 Nov 2025', record: 'ENQ-1041' },
  { id: 'f4', title: 'Share draft lift plan with Vardhman safety officer', due: '13 Nov 2025', record: 'ENQ-1042' },
]

/** Today's jobs board. Column comes from the work order stage. */
export const todaysJobs = [
  { id: 'WO-3318', crane: '100 T crawler', site: 'Hinjewadi Phase 3', when: 'Tomorrow, 06:00', issue: 'Crane and operator not allocated' },
  { id: 'WO-3316', crane: '220 T all-terrain', site: 'Thane tower site', when: 'Today, 22:00', issue: 'Gate pass pending' },
  { id: 'WO-3317', crane: '50 T hydra', site: 'Kharadi IT park', when: 'Today, 14:00', issue: 'Induction pack missing' },
  { id: 'WO-3314', crane: '50 T hydra', site: 'Chakan substation', when: 'Today, 16:00' },
  { id: 'WO-3311', crane: '100 T crawler', site: 'NH-48 package 3', when: 'On site since 4 Nov' },
  { id: 'WO-3309', crane: '220 T all-terrain', site: 'Ranjangaon', when: 'On site since 6 Nov' },
]
