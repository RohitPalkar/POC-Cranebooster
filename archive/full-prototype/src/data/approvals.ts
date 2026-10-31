import { allRecords } from './records'

export const approvalItems = allRecords
  .filter((r) => r.approval)
  .map((r) => ({ record: r, approval: r.approval! }))

export const notifications = [
  { id: 'n1', title: 'BMC response due for ENQ-1042 at 16:30', meta: 'CRM & Sales · 1 h 50 m left', path: '/crm/enquiries/ENQ-1042/overview', tone: 'warning' as const },
  { id: 'n2', title: 'CR-050 preventive service due in 38 h', meta: 'Maintenance · 250 h service', path: '/fleet/cranes/CR-050/maintenance-breakdowns', tone: 'warning' as const },
  { id: 'n3', title: 'SOS-0093 responder en route, ETA 35 min', meta: 'Bookings · Chakan MIDC', path: '/bookings/sos/SOS-0093/live-tracking', tone: 'danger' as const },
  { id: 'n4', title: 'Payment ₹3,20,000 received on INV-5521', meta: 'Finance · Vardhman Buildcon', path: '/finance/receivables/INV-5521/payments', tone: 'success' as const },
  { id: 'n5', title: 'Manoj Gaikwad licence expires 17 Nov', meta: 'Operators · Renewal needed', path: '/operators/operators/OP-131/documents-licences', tone: 'warning' as const },
]
