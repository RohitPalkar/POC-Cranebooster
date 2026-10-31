import type { Tone } from '@/components/ui/badge'

export type Fact = { label: string; value: string; ltr?: boolean; tone?: Tone }
export type Activity = { who: string; what: string; when: string }
export type Approval = { id: string; title: string; detail: string; tab: string; requestedBy: string; module: string; amount?: string }
export type RecordData = {
  id: string
  type: string
  name: string
  status: { label: string; tone: Tone }
  stage?: string
  owner: string
  facts: Fact[]
  linked: string[]
  chat?: number
  closed?: boolean
  blocked?: { stage: string; reason: string }
  approval?: Approval
  activity?: Activity[]
}

const s = (label: string, tone: Tone) => ({ label, tone })
const f = (label: string, value: string, tone?: Tone): Fact => ({ label, value, tone })

export const people = { rakesh: 'Rakesh Kulkarni', neha: 'Neha Patil', amol: 'Amol Deshpande', vijay: 'Vijay Shinde' }

export const QUOTE = 'QT-2026-0241'

const list: RecordData[] = [
  {
    id: 'ENQ-1042',
    type: 'enquiry',
    name: 'Pride Group, Hinjawadi Phase 3, Tower B',
    status: s('Negotiation', 'warning'),
    stage: 'negotiation',
    owner: people.neha,
    facts: [f('Source', 'Book My Crane', 'info'), f('Service', 'Daily hire'), f('Crane', 'ACE NX360'), f('Response due', 'in 3 h', 'warning')],
    linked: ['CUS-0317', 'SITE-0412', 'CR-025'],
    chat: 2,
    approval: {
      id: 'APR-QT',
      title: `Discount on ${QUOTE} v3`,
      detail: 'The 8% discount takes the daily rate to ₹29,440, below the ₹30,000 floor in pricing rule PR-14.',
      tab: 'quotations',
      requestedBy: people.neha,
      module: 'CRM & Sales',
      amount: '₹13,712 discount',
    },
    activity: [
      { who: 'Pride Group', what: 'Countered v2 and asked for 8% off', when: 'Today, 10:40' },
      { who: people.neha, what: `Sent ${QUOTE} v2`, when: 'Yesterday, 17:05' },
      { who: people.amol, what: 'Completed the site survey', when: '2 days ago' },
      { who: 'Book My Crane', what: 'Enquiry received', when: '4 days ago' },
    ],
  },
  ...[
    ['ENQ-1041', 'Bharat Forge, press shop shifting', 'Book My Crane', 'Lifting & shifting', 'Escorts TRX 1850', 'in 5 h', 'New'],
    ['ENQ-1040', 'Mahindra Lifespaces, Pimpri site', 'Website', 'Monthly hire', 'Sany STC250', 'Tomorrow', 'Requirement'],
    ['ENQ-1039', 'Kolte Patil, Wakad towers', 'WhatsApp', 'Daily hire', 'ACE NX360', 'Tomorrow', 'Site survey'],
    ['ENQ-1038', 'Vascon Engineers, Kharadi', 'Phone', 'Project hire', 'Sany STC250', 'In 2 days', 'Quotation'],
    ['ENQ-1037', 'Shree Cement, Daund plant', 'Website', 'Lifting & shifting', 'Escorts TRX 1850', 'In 3 days', 'New'],
  ].map(
    ([id, name, source, service, crane, due, stage]): RecordData => ({
      id,
      type: 'enquiry',
      name,
      status: s(stage, stage === 'New' ? 'brand' : 'neutral'),
      stage: stage === 'Site survey' ? 'survey' : stage.toLowerCase(),
      owner: people.neha,
      facts: [f('Source', source, source === 'Book My Crane' ? 'info' : undefined), f('Service', service), f('Crane', crane), f('Response due', due)],
      linked: [],
    }),
  ),
  {
    id: 'BK-2207',
    type: 'booking',
    name: 'Pride Group, ACE NX360, daily hire',
    status: s('Confirmed', 'brand'),
    stage: 'confirmed',
    owner: people.amol,
    facts: [f('Customer', 'Pride Group'), f('Site', 'Hinjawadi Phase 3'), f('Source', 'Book My Crane', 'info'), f('Value', '₹1,86,000'), f('Escrow', 'Held', 'success')],
    linked: ['ENQ-1042', 'CUS-0317', 'SITE-0412', 'WO-3318'],
    chat: 1,
    activity: [
      { who: 'System', what: 'Work order WO-3318 generated', when: 'Today' },
      { who: 'Book My Crane', what: '₹1,86,000 held in escrow', when: 'Today' },
      { who: people.rakesh, what: 'Booking created from ENQ-1042', when: 'Today' },
    ],
  },
  {
    id: 'WO-3318',
    type: 'workorder',
    name: 'Daily hire at Hinjawadi Phase 3, Tower B',
    status: s('Created', 'neutral'),
    stage: 'created',
    owner: people.amol,
    facts: [f('Booking', 'BK-2207'), f('Site', 'Hinjawadi Phase 3'), f('Crane required', 'ACE NX360'), f('Shift', 'Day, 10 h')],
    linked: ['BK-2207', 'SITE-0412', 'CUS-0317'],
    activity: [{ who: 'System', what: 'Created from BK-2207', when: 'Today' }],
  },
  {
    id: 'CR-025',
    type: 'crane',
    name: 'ACE NX360',
    status: s('Available', 'success'),
    owner: people.vijay,
    facts: [f('Registration', 'MH-12-KD-3321'), f('Yard', 'Chakan'), f('Hour meter', '8,412 h'), f('Insurance', 'Expires in 7 days', 'warning')],
    linked: [],
    activity: [{ who: people.vijay, what: 'Oil and filter service done', when: '12 days ago' }],
  },
  {
    id: 'CR-014',
    type: 'crane',
    name: 'Escorts TRX 1850',
    status: s('Available', 'success'),
    owner: people.vijay,
    facts: [f('Registration', 'MH-14-GT-7718'), f('Yard', 'Chakan')],
    linked: [],
  },
  {
    id: 'CR-031',
    type: 'crane',
    name: 'Sany STC250',
    status: s('Blocked', 'danger'),
    owner: people.vijay,
    facts: [f('Registration', 'MH-12-RN-4406'), f('Insurance', 'Expired', 'danger')],
    linked: [],
  },
  {
    id: 'CUS-0317',
    type: 'customer',
    name: 'Pride Group',
    status: s('Active', 'success'),
    owner: people.neha,
    facts: [f('City', 'Pune'), f('Credit limit', '₹6.4 L'), f('Outstanding', '₹1,12,500', 'warning'), f('Customer since', '2021')],
    linked: ['ENQ-1042', 'SITE-0412'],
    activity: [{ who: people.neha, what: 'Sent a renewal proposal', when: 'Last week' }],
  },
  {
    id: 'SITE-0412',
    type: 'site',
    name: 'Hinjawadi Phase 3, Tower B',
    status: s('Active', 'success'),
    owner: people.amol,
    facts: [f('Customer', 'Pride Group'), f('City', 'Pune')],
    linked: ['CUS-0317', 'ENQ-1042'],
  },
]

export const records: Record<string, RecordData> = Object.fromEntries(list.map((r) => [r.id, r]))
export const allRecords = list

export function recordsOfType(type: string) {
  return list.filter((r) => r.type === type)
}

export const craneMatches = [
  { id: 'CR-025', name: 'ACE NX360', score: 94, distance: '11 km', availability: 'Free for all dates', compliant: true, compliance: 'Insurance expires in 7 days', rate: '₹32,000 / day', note: 'Best fit on capacity, distance and dates' },
  { id: 'CR-014', name: 'Escorts TRX 1850', score: 82, distance: '19 km', availability: 'Free for all dates', compliant: true, compliance: 'All documents valid', rate: '₹33,500 / day', note: 'Works, but a longer move to site' },
  { id: 'CR-031', name: 'Sany STC250', score: 71, distance: '8 km', availability: 'Free for all dates', compliant: false, compliance: 'Insurance expired', rate: '₹41,000 / day', note: 'Cannot be quoted until the insurance is renewed' },
]

export const operators = [
  { id: 'OP-0213', name: 'Santosh Jadhav', licence: 'Licence valid', induction: 'Induction expires today', inductionOk: false },
  { id: 'OP-0198', name: 'Ramesh Gaikwad', licence: 'Licence valid', induction: 'No induction for this site', inductionOk: false },
]

export const reliefOperators = [
  { id: 'OP-0221', name: 'Mahesh Pawar', note: 'Licence valid. Inducted at this site until Mar 2027.' },
  { id: 'OP-0207', name: 'Dinesh More', note: 'Licence valid. Inducted at this site until Jan 2027.' },
]

export const JOB_ID = 'JOB-4410'
