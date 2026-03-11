import { cn } from '@/lib/utils'
import type { MarketBias } from '@/lib/types'

interface BiasBarProps {
  bias: MarketBias
  className?: string
}

export function BiasBar({ bias, className }: BiasBarProps) {
  const { bullishPercent, bearishPercent, dominantSide, confidence } = bias
  const isDominantBullish = dominantSide === 'bullish'
  const isStrongBias = confidence > 0.2

  return (
    <div className={cn('px-3 py-3', className)}>
      <div className="relative h-14 bg-card/40 rounded-lg overflow-hidden border-2 border-border/60 shadow-xl">
        <div
          className="absolute left-0 top-0 bottom-0 bg-primary transition-all duration-500 ease-out"
          style={{ 
            width: `${bullishPercent}%`,
            opacity: isDominantBullish && isStrongBias ? 1 : 0.7
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 bg-destructive transition-all duration-500 ease-out"
          style={{ 
            width: `${bearishPercent}%`,
            opacity: !isDominantBullish && isStrongBias ? 1 : 0.7
          }}
        />
        
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <div className="flex flex-col items-start z-10">
            <span className="text-xs font-bold text-primary-foreground/80 uppercase tracking-wider">Long</span>
            <span className="text-xl font-mono font-black text-primary-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {bullishPercent}%
            </span>
          </div>
          <div className="flex flex-col items-end z-10">
            <span className="text-xs font-bold text-destructive-foreground/80 uppercase tracking-wider">Short</span>
            <span className="text-xl font-mono font-black text-destructive-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {bearishPercent}%
            </span>
          </div>
        </div>
        
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-500" 
          style={{ 
            opacity: isStrongBias ? 0.5 : 0.2,
            background: isDominantBullish 
              ? 'radial-gradient(ellipse 120% 100% at left, var(--primary) 0%, transparent 60%)'
              : 'radial-gradient(ellipse 120% 100% at right, var(--destructive) 0%, transparent 60%)'
          }} 
        />
      </div>
    </div>
  )
}
