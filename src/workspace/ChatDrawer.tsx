import * as React from 'react'
import { Send } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/controls'
import { Ltr, useT } from '@/state/i18n'
import { cn } from '@/lib/utils'

type Msg = { who: string; text: string; when: string; me?: boolean; external?: boolean }

const threads: Record<string, Msg[]> = {
  'ENQ-1042': [
    { who: 'Neha Patil', text: 'Pride Group wants 8% off v2. That is below PR-14.', when: '10:44' },
    { who: 'Amol Deshpande', text: 'CR-025 is free for the dates. We can hold it today.', when: '10:52' },
  ],
  'BK-2207': [{ who: 'Amol Deshpande', text: 'Escrow is held. Moving WO-3318 to allocation.', when: '11:20' }],
}

export function ChatDrawer({ open, onOpenChange, recordId, name }: { open: boolean; onOpenChange: (o: boolean) => void; recordId: string; name: string }) {
  const t = useT()
  const [msgs, setMsgs] = React.useState<Msg[]>(threads[recordId] ?? [{ who: 'Amol Deshpande', text: 'Shared the latest update on this record.', when: 'Yesterday' }])
  const [text, setText] = React.useState('')
  React.useEffect(() => setMsgs(threads[recordId] ?? [{ who: 'Amol Deshpande', text: 'Shared the latest update on this record.', when: 'Yesterday' }]), [recordId])
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="end"
        className="max-w-md"
        title={
          <>
            {t('Chat')} · <Ltr>{recordId}</Ltr>
          </>
        }
        description={name}
      >
        <div className="flex h-full flex-col">
          <ol className="flex flex-1 flex-col gap-4 p-5" aria-live="polite">
            {msgs.map((m, i) => (
              <li key={i} className={cn('flex gap-3', m.me && 'flex-row-reverse')}>
                <Avatar name={m.who} tone={m.me ? 'brand' : 'neutral'} />
                <div className={cn('max-w-[80%] rounded-xl px-3.5 py-2.5', m.me ? 'bg-brand-soft' : 'bg-surface-sunken')}>
                  <p className="text-xs font-semibold text-foreground">
                    {m.who} <span className="font-normal text-muted-foreground"><Ltr>{t(m.when)}</Ltr></span>
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">{t(m.text)}</p>
                </div>
              </li>
            ))}
          </ol>
          <form
            className="sticky bottom-0 flex gap-2 border-t border-border-subtle bg-surface p-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (!text.trim()) return
              setMsgs((p) => [...p, { who: 'Rakesh Kulkarni', text, when: t('Now'), me: true }])
              setText('')
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              {t('Message')}
            </label>
            <Input id="chat-input" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('Write a message, @ to mention')} />
            <Button type="submit" variant="primary" size="icon" aria-label={t('Send')}>
              <Send className="dir-icon" aria-hidden />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
