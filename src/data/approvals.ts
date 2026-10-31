import { QUOTE } from './records'

export const approvalItems = [
  { id: 'APR-QT', title: `Discount on ${QUOTE} v3`, meta: 'CRM & Sales · ₹13,712 discount', path: '/crm/enquiries/ENQ-1042/quotations?quote=v3' },
  { id: 'APR-RELIEF', title: 'Relief operator for WO-3318', meta: 'Operations · induction expires today', path: '/operations/work-orders/WO-3318/readiness-check' },
]

export const notifications = [
  { id: 'n1', title: 'Book My Crane response due for ENQ-1042 in 3 h', meta: 'CRM & Sales', path: '/crm/enquiries/ENQ-1042/overview', tone: 'warning' as const },
  { id: 'n2', title: 'CR-025 insurance expires in 7 days', meta: 'Fleet', path: '/fleet/cranes/CR-025/documents', tone: 'warning' as const },
]
