import { records } from '@/data/records'
import { workspaces, type WorkspaceConfig } from '@/data/workspaces'

/** Tabs a linked chip should land on when the record has something needing attention. */
const attentionTab: Record<string, string> = {
  'CR-050': 'maintenance-breakdowns',
  'CR-031': 'inspections',
  'JB-5512': 'overtime-extra-charges',
  'PO-7781': 'order',
  'PR-0611': 'approval',
}

export function configFor(id: string): WorkspaceConfig | undefined {
  const r = records[id]
  return r ? workspaces[r.type] : undefined
}

export function defaultTab(id: string, stage?: string) {
  const cfg = configFor(id)
  if (!cfg) return ''
  if (attentionTab[id]) return attentionTab[id]
  const r = records[id]
  const st = stage ?? r?.stage
  const step = cfg.stages?.find((s) => s.id === st || s.options?.some((o) => o.id === st))
  return step?.tab ?? cfg.tabs[0].id
}

export function recordPath(id: string, tab?: string) {
  const cfg = configFor(id)
  if (!cfg) {
    if (id.startsWith('QT-')) return `/crm/enquiries/ENQ-1042/quotations?quote=v2`
    return '/'
  }
  return `/${cfg.module}/${cfg.list}/${id}/${tab ?? defaultTab(id)}`
}
