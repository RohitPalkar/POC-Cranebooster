import * as React from 'react'
import type { RecordData } from '@/data/records'
import type { WorkspaceConfig } from '@/data/workspaces'
import type { Tone } from '@/components/ui/badge'
import type { useStore } from '@/state/store'

export type TabMeta = { count?: number; attention?: Tone; attentionLabel?: string }
export type NextAction = { title: string; detail?: string; due?: string; tone?: Tone; cta?: { label: string; onClick: () => void } }
export type Store = ReturnType<typeof useStore>

export type WsCtx = {
  cfg: WorkspaceConfig
  record: RecordData
  tab: string
  goTab: (tab: string, search?: string) => void
  action: string | null
  runAction: (a: string | null) => void
  setDirty: (tab: string, dirty: boolean) => void
  readOnly: boolean
}

export const WorkspaceContext = React.createContext<WsCtx | null>(null)

export function useWorkspace() {
  const c = React.useContext(WorkspaceContext)
  if (!c) throw new Error('useWorkspace outside workspace')
  return c
}

/** Per record type behaviour. Every field is optional; missing tabs fall back to placeholder content. */
export type TypeModule = {
  tabs?: Record<string, React.ComponentType>
  live?: (r: RecordData, s: Store) => RecordData
  meta?: (r: RecordData, s: Store) => Record<string, TabMeta>
  /** Explains why the primary action is unavailable, or null when it can run. */
  primaryBlocked?: (r: RecordData, s: Store) => string | null
  next?: (r: RecordData, s: Store, ctx: WsCtx) => NextAction | null
  Extras?: React.ComponentType
  DemoControls?: React.ComponentType
  /** Reopens a closed record. Records without it stay closed. */
  reopen?: (s: Store) => void
  /** Record-level notice shown under the approval banner. */
  Banner?: React.ComponentType
  /** Empty state for a tab that has not started, keyed by tab id. */
  notStarted?: (r: RecordData, s: Store) => Record<string, { title: string; body: string; action: string; run: (ctx: WsCtx) => void } | undefined>
}
