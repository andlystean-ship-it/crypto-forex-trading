import { TimeframeCard } from './TimeframeCard'
import type { TimeframeSignal } from '@/lib/types'

interface TimeframeStripProps {
  signals: TimeframeSignal[]
  className?: string
}

export function TimeframeStrip({ signals, className }: TimeframeStripProps) {
  return (
    <div className={className}>
      <div className="px-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {signals.map((signal) => (
          <TimeframeCard key={signal.timeframe} signal={signal} />
        ))}
      </div>
    </div>
  )
}
