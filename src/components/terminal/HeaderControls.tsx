import { cn } from '@/lib/utils'
import type { Symbol, ModeLabel } from '@/lib/types'
import type { Symbol, ModeLabel } from '@/lib/types'

  onSymbolChange: (symbolId: st
  symbols: Symbol[]
  selectedSymbol: Symbol
  selectedMode: ModeLabel
  onSymbolChange: (symbolId: string) => void
  onModeChange: (mode: ModeLabel) => void
  className?: string
}

export function HeaderControls({
          
  selectedSymbol,
          <Sele
              <Se
            <Se
            
          </Select>
          
              <SelectValue />
            <SelectContent>
                <SelectItem key={symbol.id} value
                </SelectItem>
            </
        </div>
    </div>
}


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
