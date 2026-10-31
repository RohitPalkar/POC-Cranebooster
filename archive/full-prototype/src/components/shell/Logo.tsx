import { assetPathPrefix, cn } from '@/lib/utils'

const logo = `${assetPathPrefix}/61220.png`

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex h-9 w-18 shrink-0 overflow-hidden rounded-md dark:bg-white', className)}>
      <img src={logo} alt="Crane Booster" className="size-full object-cover" />
    </span>
  )
}
