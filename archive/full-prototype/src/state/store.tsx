import * as React from 'react'
import { Direction } from 'radix-ui'
import { LangContext, type Lang } from './i18n'
import { TooltipProvider } from '@/components/ui/tooltip'

export type Role = 'manager' | 'executive'
export type DemoState = 'live' | 'loading' | 'empty' | 'error' | 'no-permission'
export type ApprovalState = 'pending' | 'approved' | 'rejected'

export const ENQ_STAGES = ['new', 'requirement', 'survey', 'quotation', 'negotiation', 'won', 'lost'] as const
export type EnquiryStage = (typeof ENQ_STAGES)[number]

export const WO_STAGES = ['created', 'allocated', 'ready', 'dispatched'] as const
export type WorkOrderStage = (typeof WO_STAGES)[number]

export type PinItem = { path: string; label: string; sub?: string }
export type RecentItem = { id: string; label: string; path: string; type: string }

type Store = {
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
  lang: Lang
  setLang: (l: Lang) => void
  role: Role
  setRole: (r: Role) => void
  branch: string
  setBranch: (b: string) => void
  pins: PinItem[]
  togglePin: (p: PinItem) => void
  isPinned: (path: string) => boolean
  recents: RecentItem[]
  pushRecent: (r: RecentItem) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  // Enquiry ENQ-1042 demo flow
  enqStage: EnquiryStage
  setEnqStage: (s: EnquiryStage) => void
  selectedCrane: string | null
  setSelectedCrane: (id: string | null) => void
  surveyNotRequired: string | null
  setSurveyNotRequired: (reason: string | null) => void
  lostReason: string | null
  setLostReason: (r: string | null) => void
  bookingCreated: boolean
  setBookingCreated: (v: boolean) => void
  // Approvals across records, keyed by approval id
  approvals: Record<string, ApprovalState>
  decide: (id: string, s: ApprovalState) => void
  // Work order WO-3318 demo flow
  woStage: WorkOrderStage
  setWoStage: (s: WorkOrderStage) => void
  woCrane: string | null
  setWoCrane: (id: string | null) => void
  woOperator: string | null
  setWoOperator: (id: string | null) => void
  woChecks: Record<string, boolean>
  setWoCheck: (id: string, v: boolean) => void
  advancePaid: boolean
  setAdvancePaid: (v: boolean) => void
  breakdownReported: boolean
  setBreakdownReported: (v: boolean) => void
  // Unsaved edits per record: tab ids with dirty state
  dirty: Record<string, string[]>
  setDirty: (recordId: string, tab: string, isDirty: boolean) => void
  clearDirty: (recordId: string) => void
  // Chat unread counters
  chatRead: Record<string, boolean>
  markChatRead: (id: string) => void
  completedTasks: Record<string, boolean>
  toggleTask: (id: string) => void
  lastTab: Record<string, string>
  setLastTab: (id: string, tab: string) => void
  quoteV3: boolean
  setQuoteV3: (v: boolean) => void
  toasts: Toast[]
  toast: (message: string, tone?: 'success' | 'info' | 'danger') => void
  dismissToast: (id: number) => void
}

export type Toast = { id: number; message: string; tone: 'success' | 'info' | 'danger' }

// Reused across hot reloads so an edit does not orphan the mounted provider.
const StoreContext: React.Context<Store | null> = import.meta.hot?.data.storeContext ?? React.createContext<Store | null>(null)
if (import.meta.hot) import.meta.hot.data.storeContext = StoreContext

function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = React.useState<T>(() => {
    try {
      const raw = localStorage.getItem(`cb:${key}`)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  React.useEffect(() => {
    try {
      localStorage.setItem(`cb:${key}`, JSON.stringify(v))
    } catch {
      /* storage unavailable */
    }
  }, [key, v])
  return [v, setV] as const
}

const defaultPins: PinItem[] = [
  { path: '/crm/enquiries', label: 'Enquiries', sub: 'CRM & Sales' },
  { path: '/operations/todays-jobs', label: "Today's jobs", sub: 'Operations' },
]

const defaultRecents: RecentItem[] = [
  { id: 'CUS-0184', label: 'Vardhman Buildcon', path: '/customers/customers/CUS-0184/overview', type: 'Customer' },
  { id: 'CR-050', label: '100 T crawler', path: '/fleet/cranes/CR-050/overview-status', type: 'Crane' },
  { id: 'ENQ-1039', label: 'Kaveri Highways', path: '/crm/enquiries/ENQ-1039/overview', type: 'Enquiry' },
]

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = usePersisted<'light' | 'dark'>('theme', 'light')
  const [lang, setLang] = usePersisted<Lang>('lang', 'en')
  const [role, setRole] = React.useState<Role>('manager')
  const [branch, setBranch] = React.useState('Pune HQ')
  const [pins, setPins] = usePersisted<PinItem[]>('pins', defaultPins)
  const [recents, setRecents] = React.useState<RecentItem[]>(defaultRecents)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [enqStage, setEnqStage] = React.useState<EnquiryStage>('quotation')
  const [selectedCrane, setSelectedCrane] = React.useState<string | null>(null)
  const [surveyNotRequired, setSurveyNotRequired] = React.useState<string | null>(null)
  const [lostReason, setLostReason] = React.useState<string | null>(null)
  const [bookingCreated, setBookingCreated] = React.useState(false)
  const [approvals, setApprovals] = React.useState<Record<string, ApprovalState>>({
    'APR-QT-2231': 'pending',
    'APR-JB-5512': 'pending',
    'APR-PO-7781': 'pending',
    'APR-PR-0611': 'pending',
  })
  const [woStage, setWoStage] = React.useState<WorkOrderStage>('created')
  const [woCrane, setWoCrane] = React.useState<string | null>(null)
  const [woOperator, setWoOperator] = React.useState<string | null>(null)
  const [woChecks, setWoChecks] = React.useState<Record<string, boolean>>({ fitness: true, rigging: true, lift: true })
  const [advancePaid, setAdvancePaid] = React.useState(false)
  const [breakdownReported, setBreakdownReported] = React.useState(false)
  const [dirty, setDirtyMap] = React.useState<Record<string, string[]>>({})
  const [chatRead, setChatRead] = React.useState<Record<string, boolean>>({})
  const [completedTasks, setCompletedTasks] = React.useState<Record<string, boolean>>({})
  const [lastTab, setLastTabMap] = React.useState<Record<string, string>>({})
  const [quoteV3, setQuoteV3] = React.useState(false)
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const toastId = React.useRef(0)
  const dismissToast = React.useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])
  const toast = React.useCallback(
    (message: string, tone: Toast['tone'] = 'success') => {
      const id = ++toastId.current
      setToasts((prev) => [...prev.slice(-2), { id, message, tone }])
      window.setTimeout(() => dismissToast(id), 4500)
    },
    [dismissToast],
  )

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  React.useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const value: Store = {
    theme,
    setTheme,
    lang,
    setLang,
    role,
    setRole,
    branch,
    setBranch,
    pins,
    togglePin: (p) =>
      setPins((prev) => (prev.some((x) => x.path === p.path) ? prev.filter((x) => x.path !== p.path) : prev.length >= 5 ? prev : [...prev, p])),
    isPinned: (path) => pins.some((p) => p.path === path),
    recents,
    pushRecent: (r) => setRecents((prev) => [r, ...prev.filter((x) => x.id !== r.id)].slice(0, 5)),
    sidebarCollapsed,
    setSidebarCollapsed,
    enqStage,
    setEnqStage,
    selectedCrane,
    setSelectedCrane,
    surveyNotRequired,
    setSurveyNotRequired,
    lostReason,
    setLostReason,
    bookingCreated,
    setBookingCreated,
    approvals,
    decide: (id, s) => setApprovals((prev) => ({ ...prev, [id]: s })),
    woStage,
    setWoStage,
    woCrane,
    setWoCrane,
    woOperator,
    setWoOperator,
    woChecks,
    setWoCheck: (id, v) => setWoChecks((prev) => ({ ...prev, [id]: v })),
    advancePaid,
    setAdvancePaid,
    breakdownReported,
    setBreakdownReported,
    dirty,
    setDirty: (recordId, tab, isDirty) =>
      setDirtyMap((prev) => {
        const cur = prev[recordId] ?? []
        const next = isDirty ? Array.from(new Set([...cur, tab])) : cur.filter((t) => t !== tab)
        if (next.length === cur.length && next.every((t, i) => t === cur[i])) return prev
        return { ...prev, [recordId]: next }
      }),
    clearDirty: (recordId) => setDirtyMap((prev) => ({ ...prev, [recordId]: [] })),
    chatRead,
    markChatRead: (id) => setChatRead((prev) => ({ ...prev, [id]: true })),
    completedTasks,
    toggleTask: (id) => setCompletedTasks((prev) => ({ ...prev, [id]: !prev[id] })),
    lastTab,
    setLastTab: (id, tab) => setLastTabMap((prev) => (prev[id] === tab ? prev : { ...prev, [id]: tab })),
    quoteV3,
    setQuoteV3,
    toasts,
    toast,
    dismissToast,
  }

  return (
    <StoreContext.Provider value={value}>
      <LangContext.Provider value={lang}>
        <Direction.Provider dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        </Direction.Provider>
      </LangContext.Provider>
    </StoreContext.Provider>
  )
}

export function useStore() {
  const s = React.useContext(StoreContext)
  if (!s) throw new Error('useStore outside StoreProvider')
  return s
}
