import * as React from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'

export type ApprovalState = 'pending' | 'approved' | 'rejected'
export const WO_STAGES = ['created', 'allocated', 'ready', 'dispatched'] as const
export type WorkOrderStage = (typeof WO_STAGES)[number]
export type EnquiryStage = 'negotiation' | 'won' | 'lost'

export type PinItem = { path: string; label: string; sub?: string }
export type RecentItem = { id: string; label: string; path: string; type: string }
export type Toast = { id: number; message: string; tone: 'success' | 'info' | 'danger' }

type Store = {
  navMode: 'before' | 'after'
  setNavMode: (m: 'before' | 'after') => void
  sidebarPinned: boolean
  setSidebarPinned: (v: boolean) => void
  pins: PinItem[]
  setPins: (p: PinItem[]) => void
  togglePin: (p: PinItem) => void
  isPinned: (path: string) => boolean
  recents: RecentItem[]
  pushRecent: (r: RecentItem) => void
  enqStage: EnquiryStage
  setEnqStage: (s: EnquiryStage) => void
  heldCrane: string | null
  setHeldCrane: (id: string | null) => void
  bookingCreated: boolean
  setBookingCreated: (v: boolean) => void
  approvals: Record<string, ApprovalState>
  decide: (id: string, s: ApprovalState) => void
  woStage: WorkOrderStage
  setWoStage: (s: WorkOrderStage) => void
  woCrane: string
  setWoCrane: (id: string) => void
  woOperator: string
  setWoOperator: (id: string) => void
  relief: string | null
  setRelief: (id: string) => void
  completedTasks: Record<string, boolean>
  toggleTask: (id: string) => void
  chatRead: Record<string, boolean>
  markChatRead: (id: string) => void
  lastTab: Record<string, string>
  setLastTab: (id: string, tab: string) => void
  toasts: Toast[]
  toast: (message: string, tone?: Toast['tone']) => void
  /** For actions that are not on the demo path. */
  later: () => void
  dismissToast: (id: number) => void
}

// Reused across hot reloads so an edit does not orphan the mounted provider.
const StoreContext: React.Context<Store | null> = import.meta.hot?.data.storeContext ?? React.createContext<Store | null>(null)
if (import.meta.hot) import.meta.hot.data.storeContext = StoreContext

const defaultPins: PinItem[] = [
  { path: '/operations/todays-jobs', label: "Today's jobs" },
  { path: '/crm/enquiries', label: 'Enquiries' },
  { path: '/crm/enquiries/ENQ-1042', label: 'ENQ-1042 · Pride Group' },
]

const defaultRecents: RecentItem[] = [
  { id: 'ENQ-1042', label: 'Pride Group', path: '/crm/enquiries/ENQ-1042/quotations', type: 'Enquiry' },
  { id: 'BK-2207', label: 'Pride Group, ACE NX360', path: '/bookings/bookings/BK-2207/overview', type: 'Booking' },
  { id: 'WO-3318', label: 'Hinjawadi Phase 3', path: '/operations/work-orders/WO-3318/allocation', type: 'Work order' },
  { id: 'CR-025', label: 'ACE NX360', path: '/fleet/cranes/CR-025/documents', type: 'Crane' },
]

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [navMode, setNavMode] = React.useState<'before' | 'after'>('after')
  const [sidebarPinned, setSidebarPinned] = React.useState(true)
  const [pins, setPins] = React.useState(defaultPins)
  const [recents, setRecents] = React.useState(defaultRecents)
  const [enqStage, setEnqStage] = React.useState<EnquiryStage>('negotiation')
  const [heldCrane, setHeldCrane] = React.useState<string | null>(null)
  const [bookingCreated, setBookingCreated] = React.useState(false)
  const [approvals, setApprovals] = React.useState<Record<string, ApprovalState>>({ 'APR-QT': 'pending', 'APR-RELIEF': 'pending' })
  const [woStage, setWoStage] = React.useState<WorkOrderStage>('created')
  const [woCrane, setWoCrane] = React.useState('CR-025')
  const [woOperator, setWoOperator] = React.useState('OP-0213')
  const [relief, setRelief] = React.useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = React.useState<Record<string, boolean>>({})
  const [chatRead, setChatRead] = React.useState<Record<string, boolean>>({})
  const [lastTab, setLastTabMap] = React.useState<Record<string, string>>({})
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const toastId = React.useRef(0)
  const dismissToast = React.useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])
  const toast = React.useCallback(
    (message: string, tone: Toast['tone'] = 'success') => {
      const id = ++toastId.current
      setToasts((prev) => [...prev.slice(-2), { id, message, tone }])
      window.setTimeout(() => dismissToast(id), 4000)
    },
    [dismissToast],
  )

  const value: Store = {
    navMode,
    setNavMode,
    sidebarPinned,
    setSidebarPinned,
    pins,
    setPins,
    togglePin: (p) => {
      if (pins.some((x) => x.path === p.path)) return setPins(pins.filter((x) => x.path !== p.path))
      if (pins.length >= 5) return toast('You can pin up to 5. Unpin one first.', 'info')
      setPins([...pins, p])
    },
    isPinned: (path) => pins.some((p) => p.path === path),
    recents,
    pushRecent: (r) => setRecents((prev) => [r, ...prev.filter((x) => x.id !== r.id)].slice(0, 8)),
    enqStage,
    setEnqStage,
    heldCrane,
    setHeldCrane,
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
    relief,
    setRelief,
    completedTasks,
    toggleTask: (id) => setCompletedTasks((prev) => ({ ...prev, [id]: !prev[id] })),
    chatRead,
    markChatRead: (id) => setChatRead((prev) => ({ ...prev, [id]: true })),
    lastTab,
    setLastTab: (id, tab) => setLastTabMap((prev) => (prev[id] === tab ? prev : { ...prev, [id]: tab })),
    toasts,
    toast,
    later: () => toast('Available in the full build', 'info'),
    dismissToast,
  }

  return (
    <StoreContext.Provider value={value}>
      <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
    </StoreContext.Provider>
  )
}

export function useStore() {
  const s = React.useContext(StoreContext)
  if (!s) throw new Error('useStore outside StoreProvider')
  return s
}
