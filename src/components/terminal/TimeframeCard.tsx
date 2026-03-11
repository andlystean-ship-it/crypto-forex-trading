import { cn } from '@/lib/utils'
import type { TimeframeSignal } from '@/lib/types'

interface TimeframeCardProps {
  signal: TimeframeSignal
  className?: string
}

export function TimeframeCard({ signal, className }: TimeframeCardProps) {
  const { timeframe, bullishLevel, bearishLevel, bias, strength } = signal

  const isStrongSignal = strength > 0.3
  
  const cardBg = bias === 'bullish' 
    ? 'bg-primary/15 border-primary/50' 
    : bias === 'bearish' 
    ? 'bg-destructive/15 border-destructive/50' 
    : 'bg-card/40 border-border/40'

  const glowStyle = isStrongSignal && bias !== 'neutral'
    ? {
        boxShadow: bias === 'bullish'
          ? '0 0 16px -3px var(--primary)'
          : '0 0 16px -3px var(--destructive)'
      }
    : {}

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between p-2.5 rounded-md border transition-all duration-300 min-w-[70px] shrink-0',
        cardBg,
        className
      )}
      style={glowStyle}
    >
      <span className="text-[11px] font-mono text-primary font-bold leading-none">
        {bullishLevel}
      </span>
      
      <span className={cn(
        "text-base font-black my-2 tracking-tight",
        bias === 'bullish' && 'text-primary',
        bias === 'bearish' && 'text-destructive'
      )}>
        {timeframe}
      </span>
      
      <span className="text-[11px] font-mono text-destructive font-bold leading-none">
        {bearishLevel}
      </span>
    </div>
  )
}
