import { Link } from 'react-router'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatePanel } from '@/workspace/states'
import { useT } from '@/state/i18n'

export function NotFound() {
  const t = useT()
  return (
    <div className="p-4 md:p-6">
      <StatePanel
        icon={Compass}
        title={t('Page not found')}
        body={t('This page or record is not in the prototype. Use search to find a record by its ID.')}
        action={
          <Button asChild variant="primary">
            <Link to="/">{t('Go to dashboard')}</Link>
          </Button>
        }
      />
    </div>
  )
}
