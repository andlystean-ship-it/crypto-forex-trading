import { cn } from '@/lib/utils'
import type { MarketBias } from '@/lib/types'

interface BiasBarProps {
  bias: MarketBias
  className?: string
}

export function BiasBar({ bias, className }: BiasBarProps) {
  const { bullishPercent, bearishPercent } = bias

  return (
    <div className={cn('px-4 py-3', className)}>
      <div className="relative h-8 bg-secondary rounded-md overflow-hidden border border-border/50">
        <div
          className="absolute left-0 top-0 bottom-0 bg-primary transition-all duration-500"
          style={{ width: `${bullishPercent}%` }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 bg-destructive transition-all duration-500"
          style={{ width: `${bearishPercent}%` }}
        />
        
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <span className="text-sm font-mono font-semibold text-primary-foreground z-10">
            {bullishPercent}%
          </span>
          <span className="text-sm font-mono font-semibold text-destructive-foreground z-10">
            {bearishPercent}%
          </span>
        </div>
        
        <div className="absolute inset-0 pointer-events-none animate-glow-pulse" 
             style={{ 
               boxShadow: `inset 0 0 20px ${bullishPercent > 50 ? 'var(--primary)' : 'var(--destructive)'}` 
             }} 
        />
      </div>
    </div>
  )
}
