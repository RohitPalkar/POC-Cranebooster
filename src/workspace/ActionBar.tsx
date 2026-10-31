import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Action } from '@/data/nav'
import { useStore } from '@/state/store'

/** Real business actions. Anything off the demo path says it comes with the full build. */
export function ActionBar({ actions, className, handlers }: { actions: Action[]; className?: string; handlers?: Record<string, () => void> }) {
  const { later } = useStore()
  if (!actions.length) return null
  return (
    <div className={className ?? 'flex flex-wrap gap-2'}>
      {actions.map((a) => {
        const label = typeof a === 'string' ? a : a.label
        return (
          <Button key={label} size="sm" onClick={handlers?.[label] ?? later}>
            {label}
            {typeof a !== 'string' && a.isNew && <Badge tone="brand" size="sm" icon={false}>New</Badge>}
          </Button>
        )
      })}
    </div>
  )
}
