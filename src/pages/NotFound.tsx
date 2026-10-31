import { Link } from 'react-router'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/state/i18n'

export function NotFound() {
  const t = useT()
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
        <Compass className="size-6 text-muted-foreground" aria-hidden />
        <p className="mt-3 text-base font-semibold text-foreground">{t('Page not found')}</p>
        <Button asChild variant="primary" className="mt-4">
          <Link to="/">{t('Go to dashboard')}</Link>
        </Button>
      </div>
    </div>
  )
}
