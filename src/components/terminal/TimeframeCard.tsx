import { cn } from '@/lib/utils'
import type { TimeframeSignal } from '@/lib/types'

interface TimeframeCardProps {
  signal: TimeframeSignal
  className?: string
}

export function TimeframeCard({ signal, className }: TimeframeCardProps) {
  const { timeframe, bullishLevel, bearishLevel, bias } = signal

  const cardBg = bias === 'bullish' 
    ? 'bg-primary/10 border-primary/30' 
    : bias === 'bearish' 
    ? 'bg-destructive/10 border-destructive/30' 
    : 'bg-card border-border/50'

  const glowColor = bias === 'bullish'
    ? 'shadow-primary/20'
    : bias === 'bearish'
    ? 'shadow-destructive/20'
    : 'shadow-transparent'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between p-2 rounded-md border transition-all duration-300 min-w-[70px]',
        cardBg,
        glowColor,
        'hover:scale-105',
        className
      )}
    >
      <span className="text-xs font-mono text-primary font-semibold">
        {bullishLevel}
      </span>
      
      <span className="text-sm font-medium my-1">
        {timeframe}
      </span>
      
      <span className="text-xs font-mono text-destructive font-semibold">
        {bearishLevel}
      </span>
    </div>
  )
}
