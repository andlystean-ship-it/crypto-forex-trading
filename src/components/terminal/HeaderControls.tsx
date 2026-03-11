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
    <div className={cn('border-b border-border/50 bg-card/50 backdrop-blur-sm', className)}>
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-target flex items-center justify-center font-bold text-target-foreground text-sm">
            SC
          </div>
          <span className="text-sm font-medium hidden sm:inline">Crypto and Forex Trading</span>
        </div>

        <div className="flex items-center gap-2">
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
