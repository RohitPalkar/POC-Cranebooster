import { assetPathPrefix, cn } from '@/lib/utils'

const logo = `${assetPathPrefix}/61220.png`

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex shrink-0 overflow-hidden rounded-md dark:bg-white', compact ? 'h-8 w-10' : 'h-9 w-18', className)}>
      <img src={logo} alt="Crane Booster" className="size-full object-cover" />
    </span>
  )
}
