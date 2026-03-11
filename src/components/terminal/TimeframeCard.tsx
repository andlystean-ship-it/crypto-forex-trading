import { cn } from '@/lib/utils'
import type { TimeframeSignal } from '@/lib/types'

interface TimeframeCardProps {
  signal: TimeframeSignal
  className?: string
}

export function TimeframeCard({ signal, className }: TimeframeCardProps) {
  const { timeframe, bullishLevel, bearishLevel, bias, strength } = signal

  const isStrongSignal = strength > 0.35
  
  const cardBg = bias === 'bullish' 
    ? 'bg-primary/10 border-primary/40' 
    : bias === 'bearish' 
    ? 'bg-destructive/10 border-destructive/40' 
    : 'bg-card/50 border-border/50'

  const glowStyle = isStrongSignal && bias !== 'neutral'
    ? {
        boxShadow: bias === 'bullish'
          ? '0 0 12px -2px var(--primary)'
          : '0 0 12px -2px var(--destructive)'
      }
    : {}

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between p-2 rounded-md border transition-all duration-300 min-w-[68px] shrink-0',
        cardBg,
        className
      )}
      style={glowStyle}
    >
      <span className="text-[10px] font-mono text-primary font-semibold leading-tight">
        {bullishLevel}
      </span>
      
      <span className="text-sm font-bold my-1.5 tracking-tight">
        {timeframe}
      </span>
      
      <span className="text-[10px] font-mono text-destructive font-semibold leading-tight">
        {bearishLevel}
      </span>
    </div>
  )
}
