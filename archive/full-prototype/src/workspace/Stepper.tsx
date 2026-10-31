import { Ban, Check } from 'lucide-react'
import type { WorkspaceConfig } from '@/data/workspaces'
import { stageIndex } from '@/data/workspaces'
import { Ltr, useT } from '@/state/i18n'
import { cn } from '@/lib/utils'

export function Stepper({
  cfg,
  stage,
  blocked,
  onStep,
  activeTab,
}: {
  cfg: WorkspaceConfig
  stage?: string
  blocked?: { stage: string; reason: string }
  onStep: (tab: string) => void
  activeTab: string
}) {
  const t = useT()
  const stages = cfg.stages!
  const cur = stageIndex(cfg, stage)
  const closedAtEnd = cur === stages.length - 1
  return (
    <nav aria-label={`${t(cfg.label)} ${t('stages')}`} className="overflow-x-auto scrollbar-none">
      <ol className="flex min-w-max items-start px-1 sm:min-w-0">
        {stages.map((s, i) => {
          const option = s.options?.find((o) => o.id === stage)
          const isBlocked = blocked && (blocked.stage === s.id || s.options?.some((o) => o.id === blocked.stage)) && i === cur
          const state = isBlocked ? 'blocked' : i < cur || (closedAtEnd && i === cur && !option?.negative) ? 'done' : i === cur ? 'current' : 'upcoming'
          const negative = option?.negative && i === cur
          const label = option ? option.label : s.options ? s.options.map((o) => t(o.label)).join(' / ') : s.label
          const stateText =
            state === 'done' ? t('Done') : state === 'current' ? (negative ? t('Closed') : t('In progress')) : state === 'blocked' ? t('Blocked') : t('Up next')
          return (
            <li key={s.id} className="relative flex w-28 flex-1 flex-col items-center sm:w-auto">
              {i > 0 && (
                <span
                  aria-hidden
                  className={cn('absolute top-5 h-0.5 -translate-y-1/2', 'end-[calc(50%+1.25rem)] start-[calc(-50%+1.25rem)]', i <= cur ? 'bg-success-solid' : 'bg-border')}
                />
              )}
              <button
                type="button"
                onClick={() => onStep(s.tab)}
                aria-current={i === cur ? 'step' : undefined}
                aria-label={`${t(label)}: ${stateText}${isBlocked ? `, ${t(blocked!.reason)}` : ''}. ${t('Opens tab')} ${t(cfg.tabs.find((x) => x.id === s.tab)?.label ?? '')}`}
                className="group flex flex-col items-center gap-1.5 rounded-lg px-2 py-1 focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:min-h-11"
              >
                <span
                  className={cn(
                    'relative z-10 inline-flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-shadow group-hover:ring-4',
                    state === 'done' && 'bg-success-solid text-white group-hover:ring-success-soft dark:text-background',
                    state === 'current' && !negative && 'bg-primary text-primary-foreground group-hover:ring-brand-soft',
                    state === 'current' && negative && 'bg-danger-solid text-white group-hover:ring-danger-soft',
                    state === 'blocked' && 'border-2 border-danger bg-danger-soft text-danger group-hover:ring-danger-soft',
                    state === 'upcoming' && 'border-2 border-border-strong bg-surface text-muted-foreground group-hover:ring-neutral-soft',
                    activeTab === s.tab && 'outline-2 outline-offset-2 outline-border-strong',
                  )}
                >
                  {state === 'done' ? <Check className="size-4" strokeWidth={3} aria-hidden /> : state === 'blocked' ? <Ban className="size-4" aria-hidden /> : <Ltr>{i + 1}</Ltr>}
                </span>
                <span className={cn('text-center text-sm leading-tight', state === 'upcoming' ? 'text-foreground-secondary' : 'font-medium text-foreground')}>{t(label)}</span>
                <span className={cn('text-center text-xs', state === 'blocked' ? 'font-medium text-danger' : 'text-muted-foreground')}>
                  {stateText}
                  {isBlocked && <span className="block max-w-36 truncate">{t(blocked!.reason)}</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
