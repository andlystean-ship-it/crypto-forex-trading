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
    { id: 'analysis' as const, label: 'Phân tích thị trường', icon: Target },
    { id: 'trendlines' as const, label: `Đường xu hướng (${trendlineCount})`, icon: ChartLine },
  ]

  return (
    <div className={cn('px-4 py-3 border-b border-border/50 bg-card/30', className)}>
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-all border',
                isActive
                  ? 'bg-accent/20 border-accent text-accent shadow-lg shadow-accent/20'
                  : 'bg-secondary/30 border-border/50 text-muted-foreground hover:text-foreground hover:border-accent/30'
              )}
            >
              <Icon size={14} weight={isActive ? 'fill' : 'regular'} />
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
