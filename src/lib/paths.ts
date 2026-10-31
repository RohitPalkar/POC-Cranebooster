import { QUOTE, records } from '@/data/records'
import { workspaces, type WorkspaceConfig } from '@/data/workspaces'

/** Tabs a linked chip opens on. */
const chipTab: Record<string, string> = { 'CR-025': 'documents', 'CUS-0317': 'repeat-business', 'WO-3318': 'allocation' }

export function configFor(id: string): WorkspaceConfig | undefined {
  const r = records[id]
  return r ? workspaces[r.type] : undefined
}

export function defaultTab(id: string, stage?: string) {
  const cfg = configFor(id)
  if (!cfg) return ''
  if (chipTab[id]) return chipTab[id]
  const st = stage ?? records[id]?.stage
  const step = cfg.stages?.find((s) => s.id === st || s.options?.some((o) => o.id === st))
  return step?.tab ?? cfg.tabs[0].id
}

export function recordPath(id: string, tab?: string) {
  const cfg = configFor(id)
  if (!cfg) return id === QUOTE ? '/crm/enquiries/ENQ-1042/quotations' : '/'
  return `/${cfg.module}/${cfg.list}/${id}/${tab ?? defaultTab(id)}`
}
