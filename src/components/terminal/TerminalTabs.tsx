import { cn } from '@/lib/utils'
import { Pulse, ChartLine, Target } from '@phosphor-icons/react'

interface TerminalTabsProps {
  activeTab: 'signals' | 'analysis' | 'trendlines'
  trendlineCount: number
  onTabChange: (tab: 'signals' | 'analysis' | 'trendlines') => void
  className?: string
}

export function TerminalTabs({ activeTab, trendlineCount, onTabChange, className }: TerminalTabsProps) {
  const tabs = [
    { id: 'signals' as const, label: 'Tín hiệu Live', icon: Pulse },
    { id: 'analysis' as const, label: 'Phân tích', icon: Target },
    { id: 'trendlines' as const, label: `Xu hướng (${trendlineCount})`, icon: ChartLine },
  ]

  return (
    <div className={cn('px-3 py-2 border-y border-border/30 bg-card/20', className)}>
      <div className="flex gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border uppercase tracking-wide',
                isActive
                  ? 'bg-accent/20 border-accent text-accent-foreground shadow-md'
                  : 'bg-secondary/20 border-border/40 text-muted-foreground hover:text-foreground hover:border-accent/50'
              )}
            >
              <Icon size={13} weight={isActive ? 'fill' : 'regular'} />
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
