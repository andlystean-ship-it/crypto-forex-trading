import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Symbol, ModeLabel } from '@/lib/types'

interface HeaderControlsProps {
  symbols: Symbol[]
  selectedSymbol: Symbol
  selectedMode: ModeLabel
  onSymbolChange: (symbolId: string) => void
  onModeChange: (mode: ModeLabel) => void
  className?: string
}

export function HeaderControls({
  symbols,
  selectedSymbol,
  selectedMode,
  onSymbolChange,
  onModeChange,
  className,
}: HeaderControlsProps) {
  return (
    <div className={cn('px-4 py-4 border-b border-border/50 bg-card/20', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold tracking-tight">Crypto and Forex Trading</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Terminal Signal Intelligence</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedMode} onValueChange={(v) => onModeChange(v as ModeLabel)}>
            <SelectTrigger className="w-[140px] h-8 text-xs border-accent/50 bg-card hover:border-accent transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lệnh Chờ Long">Lệnh Chờ Long</SelectItem>
              <SelectItem value="Lệnh Chờ Short">Lệnh Chờ Short</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSymbol.id} onValueChange={onSymbolChange}>
            <SelectTrigger className="w-[140px] h-8 text-xs border-accent/50 bg-card hover:border-accent transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {symbols.map((symbol) => (
                <SelectItem key={symbol.id} value={symbol.id}>
                  {symbol.uiLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
