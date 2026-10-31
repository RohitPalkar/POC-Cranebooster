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
  next?: { title: string; due?: string; tone?: Tone }
  activity?: Activity[]
  branch?: string
}

export const TODAY = 'Tue 11 Nov 2025'

const s = (label: string, tone: Tone) => ({ label, tone })
const f = (label: string, value: string, ltr = false, tone?: Tone): Fact => ({ label, value, ltr, tone })

export const people = {
  priya: 'Priya Nair',
  rohan: 'Rohan Kulkarni',
  imran: 'Imran Shaikh',
  anita: 'Anita Desai',
  farhan: 'Farhan Qureshi',
  meera: 'Meera Joshi',
  vikram: 'Vikram Rao',
  sana: 'Sana Kapoor',
}

const list: RecordData[] = [
  // ---------- SELL ----------
  {
    id: 'ENQ-1042',
    type: 'enquiry',
    name: 'Precast girder erection, Hinjewadi metro depot',
    status: s('Quotation', 'brand'),
    stage: 'quotation',
    owner: people.rohan,
    facts: [
      f('Customer', 'Vardhman Buildcon Pvt Ltd'),
      f('Source', 'Book My Crane', false, 'info'),
      f('Service model', 'Daily hire'),
      f('Crane', '100 T crawler'),
      f('Start', '12 Nov 2025', true),
    ],
    linked: ['CUS-0184', 'SITE-311', 'QT-2231', 'LD-0877', 'CR-050'],
    chat: 3,
    approval: {
      id: 'APR-QT-2231',
      title: 'Discount approval on QT-2231 v2',
      detail: '12% discount takes the daily rate to ₹39,600, below the ₹42,000 floor in pricing rule PR-14 (100 T crawler, Pune, 15+ days).',
      tab: 'quotations',
      requestedBy: people.rohan,
      module: 'CRM & Sales',
      amount: '₹1,10,400 discount',
    },
    activity: [
      { who: 'Vardhman Buildcon', what: 'Requested 12% discount on QT-2231 v2', when: 'Today, 09:40' },
      { who: people.rohan, what: 'Sent QT-2231 v2 to customer', when: '6 Nov, 17:05' },
      { who: people.rohan, what: 'Marked site survey complete', when: '5 Nov, 14:20' },
      { who: 'Book My Crane', what: 'Enquiry received', when: '1 Nov, 10:12' },
    ],
  },
  ...[
    ['ENQ-1048', 'Transformer lift, Chakan substation', 'Sahyadri Precast Pvt Ltd', 'Book My Crane', 'New', 'brand', 'Single lift', '50 T hydra', 'Today, 13:00'],
    ['ENQ-1047', 'Tower crane assembly support', 'Shivneri Infra Projects', 'Direct', 'Requirement', 'neutral', 'Monthly hire', '220 T all-terrain', '12 Nov, 11:00'],
    ['ENQ-1046', 'Steel truss lifting, warehouse shed', 'Narmada Steel Structures', 'Book My Crane', 'New', 'brand', 'Daily hire', '50 T hydra', 'Today, 11:30'],
    ['ENQ-1045', 'Bridge girder launch, NH-48 package 3', 'Kaveri Highways Ltd', 'Direct', 'Site survey', 'neutral', 'Project', '220 T all-terrain', '14 Nov, 18:00'],
    ['ENQ-1044', 'Rooftop chiller placement, Jumeirah', 'Al Noor Contracting LLC', 'Book My Crane', 'Negotiation', 'warning', 'Single lift', '100 T crawler', '13 Nov, 10:00'],
    ['ENQ-1043', 'Precast wall panels, Kharadi IT park', 'Apex Metro Constructions', 'Direct', 'Quotation', 'brand', 'Daily hire', '50 T hydra', '15 Nov, 17:00'],
    ['ENQ-1041', 'Boiler drum erection, Ranjangaon', 'Godavari Power EPC', 'Book My Crane', 'Requirement', 'neutral', 'Monthly hire', '220 T all-terrain', '13 Nov, 12:00'],
    ['ENQ-1039', 'Pedestrian bridge segments', 'Kaveri Highways Ltd', 'Direct', 'Won', 'success', 'Daily hire', '100 T crawler', '—'],
    ['ENQ-1036', 'Water tank lift, Sharjah', 'Falcon Ridge Builders', 'Book My Crane', 'Lost', 'danger', 'Single lift', '50 T hydra', '—'],
  ].map(
    ([id, name, cust, src, stage, tone, model, crane, due]): RecordData => ({
      id,
      type: 'enquiry',
      name,
      status: s(stage, tone as Tone),
      stage: stage.toLowerCase().replace(' ', '-') === 'site-survey' ? 'survey' : stage.toLowerCase(),
      owner: id === 'ENQ-1044' ? people.farhan : people.rohan,
      facts: [f('Customer', cust), f('Source', src, false, src === 'Book My Crane' ? 'info' : 'neutral'), f('Service model', model), f('Crane', crane), f('Response due', due, true)],
      linked: [],
      closed: stage === 'Lost' || stage === 'Won',
      branch: id === 'ENQ-1044' || id === 'ENQ-1036' ? 'Dubai' : 'Pune HQ',
    }),
  ),
  ...[
    ['LD-0877', 'Vardhman Buildcon, metro depot works', 'Qualified', 'success'],
    ['LD-0891', 'Sahyadri Precast, Chakan plant expansion', 'New', 'brand'],
    ['LD-0889', 'Godavari Power EPC, Ranjangaon boiler', 'Contacted', 'info'],
    ['LD-0886', 'Shivneri Infra, Thane towers', 'Qualified', 'success'],
    ['LD-0884', 'Falcon Ridge Builders, Sharjah mall', 'Contacted', 'info'],
    ['LD-0880', 'Apex Metro, Kharadi IT park phase 2', 'New', 'brand'],
    ['LD-0872', 'Narmada Steel, Vadodara shed', 'Disqualified', 'neutral'],
  ].map(
    ([id, name, st, tone]): RecordData => ({
      id,
      type: 'lead',
      name,
      status: s(st, tone as Tone),
      owner: people.rohan,
      facts: [f('Source', id === 'LD-0884' ? 'Referral' : 'Book My Crane'), f('Est. value', '₹12,40,000', true), f('Created', '28 Oct 2025', true)],
      linked: id === 'LD-0877' ? ['CUS-0184', 'ENQ-1042'] : [],
      closed: st === 'Disqualified',
    }),
  ),
  {
    id: 'CUS-0184',
    type: 'customer',
    name: 'Vardhman Buildcon Pvt Ltd',
    status: s('Active', 'success'),
    owner: people.rohan,
    facts: [f('City', 'Pune'), f('GSTIN', '27AAFCV4421K1Z8', true), f('Credit limit', '₹25,00,000', true), f('Outstanding', '₹6,42,300', true, 'warning'), f('Customer since', 'Mar 2022', true)],
    linked: ['ENQ-1042', 'BK-2207', 'SITE-311', 'PRJ-0042', 'CT-0118'],
    chat: 1,
    activity: [
      { who: people.rohan, what: 'Sent QT-2231 v2', when: '6 Nov, 17:05' },
      { who: people.anita, what: 'Recorded payment ₹3,20,000 on INV-5521', when: '3 Nov, 12:10' },
      { who: people.imran, what: 'Closed job JB-5490 at Wakad', when: '28 Oct, 18:45' },
    ],
  },
  ...[
    ['CUS-0192', 'Shivneri Infra Projects', 'Mumbai', 'Active', 'success'],
    ['CUS-0177', 'Kaveri Highways Ltd', 'Bengaluru', 'Active', 'success'],
    ['CUS-0203', 'Sahyadri Precast Pvt Ltd', 'Nashik', 'Prospect', 'info'],
    ['CUS-0161', 'Apex Metro Constructions', 'Mumbai', 'Credit hold', 'danger'],
    ['CUS-0155', 'Godavari Power EPC', 'Hyderabad', 'Active', 'success'],
    ['CUS-0149', 'Narmada Steel Structures', 'Vadodara', 'Dormant', 'neutral'],
    ['CUS-0211', 'Al Noor Contracting LLC', 'Dubai', 'Active', 'success'],
    ['CUS-0214', 'Falcon Ridge Builders', 'Sharjah', 'Prospect', 'info'],
  ].map(
    ([id, name, city, st, tone]): RecordData => ({
      id,
      type: 'customer',
      name,
      status: s(st, tone as Tone),
      owner: city === 'Dubai' || city === 'Sharjah' ? people.farhan : people.rohan,
      facts: [f('City', city), f('Credit limit', city === 'Dubai' || city === 'Sharjah' ? 'AED 450,000' : '₹15,00,000', true)],
      linked: [],
      branch: city === 'Dubai' || city === 'Sharjah' ? 'Dubai' : 'Pune HQ',
    }),
  ),
  {
    id: 'SITE-311',
    type: 'site',
    name: 'Hinjewadi Phase 3 metro depot',
    status: s('Active', 'success'),
    owner: people.imran,
    facts: [f('Customer', 'Vardhman Buildcon'), f('Gate', 'Gate 2, Maan Road'), f('Induction', 'Mandatory, 45 min'), f('Ground', 'Compacted murrum, 22 T/m²')],
    linked: ['CUS-0184', 'ENQ-1042', 'BK-2207'],
  },
  {
    id: 'SITE-298',
    type: 'site',
    name: 'Kharadi IT park, Tower B',
    status: s('Active', 'success'),
    owner: people.imran,
    facts: [f('Customer', 'Apex Metro Constructions'), f('Gate', 'Gate 1'), f('Induction', 'Not required')],
    linked: [],
  },
  {
    id: 'SRV-012',
    type: 'service',
    name: '100 T crawler, daily hire',
    status: s('Listed', 'success'),
    owner: people.priya,
    facts: [f('Base rate', '₹48,000 / day', true), f('Floor rate', '₹42,000 / day', true), f('Min. days', '3', true), f('Areas', 'Pune, Mumbai')],
    linked: ['CR-050', 'CR-044'],
  },
  {
    id: 'SRV-004',
    type: 'service',
    name: '50 T hydra, hourly hire',
    status: s('Listed', 'success'),
    owner: people.priya,
    facts: [f('Base rate', '₹2,400 / h', true), f('Min. hours', '4', true), f('Areas', 'Pune')],
    linked: [],
  },
  // ---------- DELIVER ----------
  {
    id: 'BK-2207',
    type: 'booking',
    name: 'Vardhman Buildcon, 100 T crawler, 18 days',
    status: s('Confirmed', 'brand'),
    stage: 'confirmed',
    owner: people.imran,
    facts: [f('Customer', 'Vardhman Buildcon Pvt Ltd'), f('Source', 'Book My Crane', false, 'info'), f('Dates', '12 – 29 Nov 2025', true), f('Value', '₹9,55,328', true), f('Advance', '₹4,85,000 due', true, 'warning')],
    linked: ['ENQ-1042', 'QT-2231', 'CUS-0184', 'SITE-311', 'WO-3318', 'CR-050'],
    chat: 2,
    activity: [
      { who: people.priya, what: 'Booking created from ENQ-1042', when: 'Today, 10:05' },
      { who: 'System', what: 'Work orders WO-3318 and WO-3319 generated', when: 'Today, 10:05' },
      { who: people.anita, what: 'Advance invoice ADV-0412 sent', when: 'Today, 10:20' },
    ],
  },
  ...[
    ['BK-2211', 'Sahyadri Precast, 50 T hydra, 1 day', 'Requested', 'neutral', 'Direct', '18 Nov 2025', '₹38,400'],
    ['BK-2209', 'Shivneri Infra, 220 T all-terrain, monthly', 'Confirmed', 'brand', 'Direct', '15 Nov – 14 Dec', '₹21,60,000'],
    ['BK-2204', 'Kaveri Highways, 100 T crawler, 10 days', 'In progress', 'info', 'Book My Crane', '4 – 14 Nov', '₹4,85,000'],
    ['BK-2201', 'Godavari Power, 220 T all-terrain, 6 days', 'In progress', 'info', 'Direct', '6 – 12 Nov', '₹7,92,000'],
    ['BK-2198', 'Al Noor Contracting, 100 T crawler, single lift', 'Completed', 'success', 'Book My Crane', '2 Nov', 'AED 18,500'],
    ['BK-2193', 'Apex Metro, 50 T hydra, 4 days', 'Invoiced', 'success', 'Direct', '27 – 30 Oct', '₹1,72,800'],
    ['BK-2190', 'Narmada Steel, 50 T hydra, 2 days', 'Cancelled', 'danger', 'Book My Crane', '25 Oct', '₹76,800'],
  ].map(
    ([id, name, st, tone, src, dates, val]): RecordData => ({
      id,
      type: 'booking',
      name,
      status: s(st, tone as Tone),
      stage: st === 'Cancelled' ? undefined : st.toLowerCase().replace(' ', '-'),
      owner: id === 'BK-2198' ? people.farhan : people.imran,
      facts: [f('Source', src, false, src === 'Book My Crane' ? 'info' : 'neutral'), f('Dates', dates, true), f('Value', val, true)],
      linked: [],
      closed: st === 'Cancelled' || st === 'Invoiced',
      branch: id === 'BK-2198' ? 'Dubai' : 'Pune HQ',
    }),
  ),
  {
    id: 'SOS-0093',
    type: 'sos',
    name: 'Hydraulic failure, 50 T hydra at Chakan MIDC',
    status: s('En route', 'danger'),
    stage: 'en-route',
    owner: people.imran,
    facts: [f('Customer', 'Sahyadri Precast'), f('Received', 'Today, 08:52', true), f('ETA', '35 min', true, 'warning'), f('Responder', 'Mobile unit MU-2')],
    linked: ['CR-012', 'CUS-0203'],
  },
  {
    id: 'PRJ-0042',
    type: 'project',
    name: 'Pune Metro Line 3, depot package',
    status: s('Active', 'success'),
    owner: people.imran,
    facts: [f('Customer', 'Vardhman Buildcon'), f('Duration', 'Oct 2025 – Mar 2026', true), f('Budget', '₹1,24,00,000', true), f('Margin', '24.1%', true, 'success')],
    linked: ['CUS-0184', 'CT-0118', 'SITE-311'],
  },
  {
    id: 'CT-0118',
    type: 'contract',
    name: 'Rate contract, Vardhman Buildcon FY 25-26',
    status: s('Active', 'success'),
    stage: 'active',
    owner: people.priya,
    facts: [f('Customer', 'Vardhman Buildcon'), f('Valid', 'Apr 2025 – Mar 2026', true), f('SLA', 'Mobilise within 48 h'), f('Billing', 'Fortnightly')],
    linked: ['CUS-0184', 'PRJ-0042'],
  },
  {
    id: 'CT-0109',
    type: 'contract',
    name: 'AMC, Kaveri Highways cranes on NH-48',
    status: s('Renewal due', 'warning'),
    stage: 'renewal-due',
    owner: people.priya,
    facts: [f('Customer', 'Kaveri Highways'), f('Ends', '30 Nov 2025', true, 'warning')],
    linked: ['CUS-0177'],
  },
  {
    id: 'WO-3318',
    type: 'workorder',
    name: 'Mobilise 100 T crawler and lift precast girders',
    status: s('Created', 'neutral'),
    stage: 'created',
    owner: people.imran,
    facts: [f('Booking', 'BK-2207', true), f('Site', 'Hinjewadi Phase 3'), f('Mobilise', '12 Nov 2025, 06:00', true), f('Shift', 'Day, 10 h')],
    linked: ['BK-2207', 'SITE-311', 'CUS-0184'],
    chat: 1,
    activity: [
      { who: 'System', what: 'Created from BK-2207', when: 'Today, 10:05' },
      { who: people.imran, what: 'Requested gate pass from Vardhman site office', when: 'Today, 10:30' },
    ],
  },
  ...[
    ['WO-3319', 'Demobilise 100 T crawler, Hinjewadi', 'Created', 'neutral', 'BK-2207', '29 Nov 2025'],
    ['WO-3316', 'Shift 220 T all-terrain to Thane tower site', 'Allocated', 'info', 'BK-2209', '15 Nov 2025'],
    ['WO-3317', 'Panel lifts, Kharadi IT park Tower B', 'Allocated', 'info', 'BK-2209', '12 Nov 2025'],
    ['WO-3314', 'Transformer lift, Chakan substation', 'Ready', 'success', 'BK-2211', '18 Nov 2025'],
    ['WO-3311', 'Girder lifts, NH-48 package 3', 'Dispatched', 'brand', 'BK-2204', '4 Nov 2025'],
    ['WO-3309', 'Boiler drum erection support', 'Dispatched', 'brand', 'BK-2201', '6 Nov 2025'],
  ].map(
    ([id, name, st, tone, bk, date]): RecordData => ({
      id,
      type: 'workorder',
      name,
      status: s(st, tone as Tone),
      stage: st.toLowerCase(),
      owner: people.imran,
      facts: [f('Booking', bk, true), f('Mobilise', date, true)],
      linked: [bk],
    }),
  ),
  {
    id: 'JB-5520',
    type: 'job',
    name: 'Precast girder erection, Hinjewadi metro depot',
    status: s('Mobilised', 'info'),
    stage: 'mobilised',
    owner: people.imran,
    facts: [f('Booking', 'BK-2207', true), f('Crane', 'CR-050, 100 T crawler', true), f('Operator', 'Sunil Patil'), f('Check-in', '12 Nov 2025, 06:00', true)],
    linked: ['BK-2207', 'WO-3318', 'CR-050', 'OP-118'],
  },
  {
    id: 'JB-5512',
    type: 'job',
    name: 'Girder lifts, NH-48 package 3, Day 8',
    status: s('On site', 'info'),
    stage: 'on-site',
    owner: people.imran,
    facts: [f('Booking', 'BK-2204', true), f('Crane', 'CR-044, 100 T crawler', true), f('Operator', 'Deepak Yadav'), f('Hours today', '11.5 h', true, 'warning')],
    linked: ['BK-2204', 'WO-3311', 'CR-044', 'OP-124'],
    approval: {
      id: 'APR-JB-5512',
      title: 'Overtime on JB-5512',
      detail: '6.5 h overtime across 3 days at ₹3,200/h, signed by site engineer. Needs ops manager approval before billing.',
      tab: 'overtime-extra-charges',
      requestedBy: 'Deepak Yadav',
      module: 'Operations',
      amount: '₹20,800',
    },
  },
  {
    id: 'JB-5509',
    type: 'job',
    name: 'Boiler drum erection, Ranjangaon',
    status: s('On site', 'info'),
    stage: 'on-site',
    owner: people.imran,
    facts: [f('Booking', 'BK-2201', true), f('Crane', 'CR-062', true)],
    linked: ['BK-2201'],
  },
  {
    id: 'JB-5490',
    type: 'job',
    name: 'Slab formwork lifts, Wakad',
    status: s('Closed', 'neutral'),
    stage: 'closed',
    owner: people.imran,
    facts: [f('Customer', 'Vardhman Buildcon'), f('Closed', '28 Oct 2025', true)],
    linked: ['CUS-0184'],
    closed: true,
  },
  // ---------- ASSETS ----------
  {
    id: 'CR-050',
    type: 'crane',
    name: '100 T crawler, SCX-1000',
    status: s('Available', 'success'),
    owner: people.vikram,
    facts: [f('Yard', 'Pune, Talegaon'), f('Hour meter', '6,412 h', true), f('Next PM', 'in 38 h', true, 'warning'), f('Certificates', 'All valid', false, 'success')],
    linked: ['BK-2207', 'WO-3318', 'MWO-0902', 'AMC-0031'],
  },
  ...[
    ['CR-044', '100 T crawler, SCX-1000', 'On hire', 'info', 'NH-48 package 3'],
    ['CR-031', '120 T crawler, LR-1120', 'Blocked', 'danger', 'Load test certificate expired 2 Nov'],
    ['CR-062', '220 T all-terrain, ATC-220', 'On hire', 'info', 'Ranjangaon'],
    ['CR-012', '50 T hydra, HX-50', 'Breakdown', 'danger', 'Chakan MIDC'],
    ['CR-019', '50 T hydra, HX-50', 'Available', 'success', 'Pune, Talegaon'],
    ['CR-071', '100 T crawler, SCX-1000', 'Available', 'success', 'Dubai, Al Quoz'],
  ].map(
    ([id, name, st, tone, where]): RecordData => ({
      id,
      type: 'crane',
      name,
      status: s(st, tone as Tone),
      owner: people.vikram,
      facts: [f('Location', where), f('Hour meter', '5,180 h', true)],
      linked: [],
      branch: id === 'CR-071' ? 'Dubai' : 'Pune HQ',
    }),
  ),
  ...[
    ['OP-118', 'Sunil Patil', 'Available', 'success', 'Crawler, up to 250 T', 'Valid to Aug 2027'],
    ['OP-124', 'Deepak Yadav', 'On job', 'info', 'Crawler, up to 150 T', 'Valid to Feb 2026'],
    ['OP-131', 'Manoj Gaikwad', 'Available', 'success', 'Crawler, up to 120 T', 'Expires 17 Nov 2025'],
    ['OP-142', 'Rahul Bhosale', 'On leave', 'neutral', 'Hydra, up to 50 T', 'Valid to Jan 2027'],
  ].map(
    ([id, name, st, tone, cls, lic]): RecordData => ({
      id,
      type: 'operator',
      name,
      status: s(st, tone as Tone),
      owner: people.imran,
      facts: [f('Class', cls), f('Licence', lic, true, lic.startsWith('Expires') ? 'warning' : undefined), f('Rating', '4.7 / 5', true)],
      linked: [],
    }),
  ),
  {
    id: 'INS-0457',
    type: 'inspection',
    name: 'Annual load test, CR-031',
    status: s('Failed', 'danger'),
    stage: 'failed',
    owner: people.meera,
    facts: [f('Crane', 'CR-031', true), f('Inspector', 'TÜV Nord, R. Menon'), f('Date', '2 Nov 2025', true), f('Defects', '2 major', false, 'danger')],
    linked: ['CR-031'],
  },
  {
    id: 'INS-0461',
    type: 'inspection',
    name: 'Pre-dispatch check, CR-050',
    status: s('Scheduled', 'neutral'),
    stage: 'scheduled',
    owner: people.meera,
    facts: [f('Crane', 'CR-050', true), f('Date', '11 Nov 2025, 15:00', true)],
    linked: ['CR-050', 'WO-3318'],
  },
  {
    id: 'INC-0027',
    type: 'incident',
    name: 'Near miss: tag line slip during girder lift',
    status: s('Investigating', 'warning'),
    stage: 'investigating',
    owner: people.meera,
    facts: [f('Site', 'NH-48 package 3'), f('Severity', 'Near miss', false, 'warning'), f('Reported', '9 Nov 2025', true)],
    linked: ['JB-5512', 'CR-044'],
  },
  {
    id: 'MWO-0902',
    type: 'maintenance',
    name: 'Hydraulic hose leak, boom hoist circuit',
    status: s('Closed', 'neutral'),
    stage: 'closed',
    owner: people.vikram,
    facts: [f('Crane', 'CR-050', true), f('Downtime', '14 h', true), f('Cost', '₹38,600', true), f('Warranty', 'Not covered')],
    linked: ['CR-050'],
    closed: true,
  },
  {
    id: 'MWO-0915',
    type: 'maintenance',
    name: 'Slew ring noise, CR-012',
    status: s('Diagnosed', 'warning'),
    stage: 'diagnosed',
    owner: people.vikram,
    facts: [f('Crane', 'CR-012', true), f('Reported', '10 Nov 2025', true), f('Warranty', 'AMC covered', false, 'success')],
    linked: ['CR-012', 'AMC-0031', 'SOS-0093'],
  },
  {
    id: 'AMC-0031',
    type: 'amc',
    name: 'SCX series AMC, Pune fleet',
    status: s('Active', 'success'),
    owner: people.vikram,
    facts: [f('Provider', 'Deccan Heavy Equipment Services'), f('Valid', 'Jan – Dec 2025', true), f('Cranes', '6', true), f('Visits left', '3', true)],
    linked: ['CR-050', 'CR-044'],
  },
  {
    id: 'ITM-2290',
    type: 'item',
    name: 'Hydraulic hose assembly, 1/2 in, 4-wire',
    status: s('Below reorder', 'warning'),
    owner: people.sana,
    facts: [f('On hand', '3 nos', true, 'warning'), f('Reorder level', '6 nos', true), f('Avg. cost', '₹4,850', true)],
    linked: ['MWO-0902', 'VEN-0058'],
  },
  {
    id: 'PO-7781',
    type: 'purchase',
    name: 'Wire rope 22 mm, 400 m, for CR-031 re-rope',
    status: s('Awaiting approval', 'warning'),
    stage: 'order',
    owner: people.sana,
    facts: [f('Vendor', 'Usha Wire Ropes Ltd'), f('Value', '₹3,64,000', true), f('Needed by', '20 Nov 2025', true)],
    linked: ['CR-031', 'VEN-0058', 'INS-0457'],
    approval: {
      id: 'APR-PO-7781',
      title: 'Purchase order PO-7781',
      detail: 'Above the ₹2,50,000 buyer limit. Needed to clear the CR-031 load test failure.',
      tab: 'order',
      requestedBy: people.sana,
      module: 'Inventory',
      amount: '₹3,64,000',
    },
  },
  {
    id: 'VEN-0058',
    type: 'vendor',
    name: 'Usha Wire Ropes Ltd',
    status: s('Approved vendor', 'success'),
    owner: people.sana,
    facts: [f('City', 'Ranchi'), f('Payment terms', '30 days'), f('On-time delivery', '96%', true, 'success')],
    linked: ['PO-7781'],
  },
  // ---------- MONEY & PEOPLE ----------
  {
    id: 'INV-5521',
    type: 'invoice',
    name: 'Vardhman Buildcon, October running bill',
    status: s('Part paid', 'warning'),
    owner: people.anita,
    facts: [f('Total', '₹9,62,300', true), f('Paid', '₹3,20,000', true), f('Balance', '₹6,42,300', true, 'warning'), f('Due', '15 Nov 2025', true)],
    linked: ['CUS-0184', 'BK-2193'],
  },
  {
    id: 'INV-5530',
    type: 'invoice',
    name: 'Al Noor Contracting, single lift',
    status: s('Posted', 'info'),
    owner: people.farhan,
    facts: [f('Total', 'AED 19,425', true), f('VAT', 'AED 925', true), f('Due', '2 Dec 2025', true)],
    linked: ['BK-2198', 'CUS-0211'],
    branch: 'Dubai',
  },
  {
    id: 'EMP-0412',
    type: 'employee',
    name: 'Imran Shaikh',
    status: s('Active', 'success'),
    owner: people.priya,
    facts: [f('Role', 'Operations planner'), f('Branch', 'Pune HQ'), f('Joined', 'Jun 2021', true)],
    linked: [],
  },
  {
    id: 'PR-0611',
    type: 'payroll',
    name: 'Payroll, November 2025',
    status: s('Reviewed', 'warning'),
    stage: 'reviewed',
    owner: people.anita,
    facts: [f('Employees', '134', true), f('Net pay', '₹48,20,000', true), f('Pay date', '30 Nov 2025', true)],
    linked: [],
    approval: {
      id: 'APR-PR-0611',
      title: 'Payroll run PR-0611',
      detail: 'November payroll reviewed by finance. Needs director approval before payments are released.',
      tab: 'approval',
      requestedBy: people.anita,
      module: 'HR & Payroll',
      amount: '₹48,20,000',
    },
  },
  // ---------- INSIGHT & ADMIN ----------
  {
    id: 'TCK-0388',
    type: 'ticket',
    name: 'Operator arrived without site induction card',
    status: s('In progress', 'info'),
    stage: 'in-progress',
    owner: people.meera,
    facts: [f('Customer', 'Kaveri Highways'), f('Priority', 'High', false, 'danger'), f('SLA', '42 min left', true, 'warning')],
    linked: ['JB-5512', 'CUS-0177'],
  },
]

export const records: Record<string, RecordData> = Object.fromEntries(list.map((r) => [r.id, r]))
export const allRecords = list

export function recordsOfType(type: string) {
  return list.filter((r) => r.type === type)
}

// Cranes ranked for ENQ-1042 requirement
export const craneMatches = [
  { id: 'CR-050', name: '100 T crawler, SCX-1000', score: 94, distance: '14 km', availability: 'Free 12 – 29 Nov', availTone: 'success' as Tone, compliance: 'All certificates valid', compliant: true, rate: '₹45,000 / day', note: 'Best fit: capacity, distance and full date window' },
  { id: 'CR-044', name: '100 T crawler, SCX-1000', score: 81, distance: '38 km', availability: 'Free from 15 Nov', availTone: 'warning' as Tone, compliance: 'All certificates valid', compliant: true, rate: '₹45,000 / day', note: '3-day gap at start, on hire at NH-48 until 14 Nov' },
  { id: 'CR-031', name: '120 T crawler, LR-1120', score: 76, distance: '22 km', availability: 'Free 12 – 29 Nov', availTone: 'success' as Tone, compliance: 'Load test certificate expired 2 Nov', compliant: false, rate: '₹52,000 / day', note: 'Failed annual load test INS-0457. Cannot be quoted until re-inspected.' },
  { id: 'CR-062', name: '220 T all-terrain, ATC-220', score: 64, distance: '9 km', availability: 'Free from 13 Nov', availTone: 'warning' as Tone, compliance: 'All certificates valid', compliant: true, rate: '₹86,000 / day', note: 'Oversized for a 42 T pick, higher cost to customer' },
]

export const operatorsForWO = [
  { id: 'OP-118', name: 'Sunil Patil', cls: 'Crawler, up to 250 T', licence: 'Valid to Aug 2027', ok: true, note: 'Inducted at Hinjewadi, 3 previous jobs at this site' },
  { id: 'OP-124', name: 'Deepak Yadav', cls: 'Crawler, up to 150 T', licence: 'Valid to Feb 2026', ok: false, note: 'On job JB-5512 until 14 Nov' },
  { id: 'OP-131', name: 'Manoj Gaikwad', cls: 'Crawler, up to 120 T', licence: 'Expires 17 Nov 2025', ok: false, note: 'Licence expires before this job ends on 29 Nov' },
]

// The job created when WO-3318 is dispatched
export const JOB_FOR_WO = 'JB-5520'
