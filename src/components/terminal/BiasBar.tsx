import { cn } from '@/lib/utils'
import type { MarketBias } from '@/lib/types'

interface BiasBarProps {
  bias: MarketBias
  className?: string
}

export function BiasBar({ bias, className }: BiasBarProps) {
  const { bullishPercent, bearishPercent, dominantSide } = bias
  const isDominantBullish = dominantSide === 'bullish'

  return (
    <div className={cn('px-4 py-2', className)}>
      <div className="relative h-10 bg-card/50 rounded-lg overflow-hidden border-2 border-border/50 shadow-lg">
        <div
          className="absolute left-0 top-0 bottom-0 bg-primary transition-all duration-700 ease-out"
          style={{ width: `${bullishPercent}%` }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 bg-destructive transition-all duration-700 ease-out"
          style={{ width: `${bearishPercent}%` }}
        />
        
        <div className="absolute inset-0 flex items-center justify-between px-5">
          <span className="text-base font-mono font-bold text-primary-foreground drop-shadow-lg z-10">
            LONG {bullishPercent}%
          </span>
          <span className="text-base font-mono font-bold text-destructive-foreground drop-shadow-lg z-10">
            {bearishPercent}% SHORT
          </span>
        </div>
        
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-700" 
          style={{ 
            background: isDominantBullish 
              ? 'radial-gradient(ellipse at left, var(--primary) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at right, var(--destructive) 0%, transparent 70%)'
          }} 
        />
      </div>
    </div>
  )
}
