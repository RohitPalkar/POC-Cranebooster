import * as React from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/input'
import { formatINR } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useStore } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import { Panel } from '@/workspace/ui'
import { Page, PageHeader } from './lists/common'

const back = '/crm/enquiries/ENQ-1042/quotations'
const steps = ['Lines', 'Terms', 'Review']

/** Full-page wizard: finishing or cancelling returns to the Quotations tab. */
export function QuotationWizard() {
  const t = useT()
  const s = useStore()
  const navigate = useNavigate()
  const [step, setStep] = React.useState(0)
  const [rate, setRate] = React.useState(39600)
  const [mob, setMob] = React.useState(55000)
  const [terms, setTerms] = React.useState('Advance of ₹4,85,000 before mobilisation, balance billed fortnightly, 15 days credit.')
  const sub = rate * 18 + mob * 2
  const gst = Math.round(sub * 0.18)
  const belowFloor = rate < 42000
  return (
    <Page>
      <nav aria-label={t('Breadcrumb')} className="text-sm text-muted-foreground">
        <Link to={back} className="inline-flex items-center gap-1.5 rounded hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring">
          <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden />
          <Ltr>ENQ-1042</Ltr> · {t('Quotations')}
        </Link>
      </nav>
      <PageHeader title={t('New quotation version')} description={t('Starts from the requirement and the latest quote')} />
      <ol className="flex items-center gap-2" aria-label={t('Steps')}>
        {steps.map((x, i) => (
          <li key={x} aria-current={i === step ? 'step' : undefined} className="flex items-center gap-2 text-sm">
            <span className={cn('inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold', i < step ? 'bg-success-solid text-white dark:text-background' : i === step ? 'bg-primary text-primary-foreground' : 'border-2 border-border-strong text-muted-foreground')}>
              {i < step ? <Check className="size-4" aria-hidden /> : <Ltr>{i + 1}</Ltr>}
            </span>
            <span className={i === step ? 'font-medium text-foreground' : 'text-muted-foreground'}>{t(x)}</span>
            {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-border-strong sm:w-12" aria-hidden />}
          </li>
        ))}
      </ol>
      <Panel className="max-w-3xl">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('Daily rate')} htmlFor="w-rate" helper={belowFloor ? t('Below the ₹42,000 floor in PR-14. Will need approval.') : t('At or above the pricing rule floor')}>
              <Input id="w-rate" type="number" dir="ltr" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
            </Field>
            <Field label={t('Mobilisation and demobilisation, each')} htmlFor="w-mob">
              <Input id="w-mob" type="number" dir="ltr" value={mob} onChange={(e) => setMob(Number(e.target.value))} />
            </Field>
            <Field label={t('Days')} htmlFor="w-days">
              <Input id="w-days" dir="ltr" value="18" readOnly />
            </Field>
          </div>
        )}
        {step === 1 && (
          <Field label={t('Terms')} htmlFor="w-terms">
            <Textarea id="w-terms" value={terms} onChange={(e) => setTerms(e.target.value)} />
          </Field>
        )}
        {step === 2 && (
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">{t('Subtotal')}</dt><dd><Ltr>{formatINR(sub)}</Ltr></dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">GST <Ltr>18%</Ltr></dt><dd><Ltr>{formatINR(gst)}</Ltr></dd></div>
            <div className="mt-2 flex justify-between border-t border-border-subtle pt-2 text-base font-semibold"><dt>{t('Total')}</dt><dd><Ltr>{formatINR(sub + gst)}</Ltr></dd></div>
          </dl>
        )}
        <div className="mt-6 flex justify-between gap-2">
          <Button onClick={() => (step ? setStep(step - 1) : navigate(back))}>{step ? t('Back') : t('Cancel')}</Button>
          {step < 2 ? (
            <Button variant="primary" onClick={() => setStep(step + 1)}>
              {t('Next')}
              <ArrowRight className="dir-icon" aria-hidden />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                s.setQuoteV3(true)
                if (s.enqStage === 'new' || s.enqStage === 'requirement' || s.enqStage === 'survey') s.setEnqStage('quotation')
                s.toast(t('QT-2231 v3 saved as draft'))
                navigate(back)
              }}
            >
              {t('Save draft')}
            </Button>
          )}
        </div>
      </Panel>
    </Page>
  )
}
