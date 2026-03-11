import { useState } from 'react'
import { HeaderControls } from './components/terminal/HeaderControls'
import { BiasBar } from './components/terminal/BiasBar'
import { TimeframeStrip } from './components/terminal/TimeframeStrip'
import { TradingChart } from './components/terminal/TradingChart'
import { TerminalTabs } from './components/terminal/TerminalTabs'
import { NewsFilterBar } from './components/terminal/NewsFilterBar'
import { NewsCard } from './components/terminal/NewsCard'
import { SYMBOLS } from './lib/signalEngine'
import { NEWS_CATEGORIES, filterNewsByCategory } from './lib/newsData'
import { useMarketState, useNews } from './hooks/use-market-data'
import type { ModeLabel } from './lib/types'
import { Badge } from './components/ui/badge'

function App() {
  const [selectedSymbolId, setSelectedSymbolId] = useState('xau')
  const [selectedMode, setSelectedMode] = useState<ModeLabel>('Lệnh Chờ Long')
  const [activeTab, setActiveTab] = useState<'signals' | 'analysis' | 'trendlines'>('signals')
  const [selectedNewsCategory, setSelectedNewsCategory] = useState('all')

  const selectedSymbol = SYMBOLS.find((s) => s.id === selectedSymbolId) || SYMBOLS[0]
  
  const { data: signalData, isLoading, isStale, error, lastUpdated } = useMarketState(selectedSymbolId)
  const { news } = useNews(selectedSymbolId)
  
  const filteredNews = filterNewsByCategory(selectedNewsCategory, news)

  if (isLoading && !signalData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-primary text-sm font-mono">Loading market data...</div>
        </div>
      </div>
    )
  }

  if (error && !signalData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-destructive text-sm font-semibold mb-2">Error loading market data</div>
          <div className="text-muted-foreground text-xs">{error.message}</div>
        </div>
      </div>
    )
  }

  if (!signalData) {
    return null
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'signals':
        return (
          <div className="px-3 py-2">
            <div className="bg-card/40 border border-border/40 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wide">Tín hiệu Hiện tại</h3>
                {isStale && (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-destructive/50 text-destructive">
                    STALE
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hướng ưu tiên:</span>
                  <span className={signalData.marketBias.dominantSide === 'bullish' ? 'text-primary font-bold' : 'text-destructive font-bold'}>
                    {signalData.marketBias.dominantSide === 'bullish' ? 'LONG' : 'SHORT'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Độ tin cậy:</span>
                  <span className="font-mono font-semibold">{(signalData.marketBias.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mục tiêu:</span>
                  <span className="text-target font-mono font-bold">{signalData.marketScenario.targetPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry Long:</span>
                  <span className="text-primary font-mono">{signalData.marketScenario.pendingLong}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-muted-foreground">Entry Short:</span>
                  <span className="text-destructive font-mono">{signalData.marketScenario.pendingShort}</span>
                </div>
              </div>
            </div>
          </div>
        )
      case 'analysis':
        return (
          <div className="px-3 py-2">
            <div className="bg-card/40 border border-border/40 rounded-md p-3">
              <h3 className="text-xs font-bold mb-2 text-accent uppercase tracking-wide">Phân tích Kỹ thuật</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-muted-foreground mb-0.5 font-semibold">Kịch bản chính:</p>
                  <p className="text-foreground leading-relaxed">{signalData.marketScenario.dominantScenario.reason}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5 font-semibold">Kịch bản thay thế:</p>
                  <p className="text-foreground leading-relaxed">{signalData.marketScenario.alternateScenario.reason}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5 font-semibold">Lưu ý:</p>
                  <p className="text-target leading-relaxed">{signalData.marketScenario.cautionText}</p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'trendlines':
        return (
          <div className="px-3 py-2">
            <div className="bg-card/40 border border-border/40 rounded-md p-3">
              <h3 className="text-xs font-bold mb-2 uppercase tracking-wide">Đường Xu Hướng</h3>
              <div className="space-y-2">
                {signalData.chartData.trendlines.map((trendline) => (
                  <div key={trendline.id} className="flex items-start gap-2 text-xs pb-1.5 border-b border-border/20 last:border-0">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${trendline.type === 'ascending' ? 'bg-primary' : 'bg-destructive'}`} />
                    <div className="flex-1">
                      <p className="font-semibold">{trendline.label}</p>
                      <p className="text-muted-foreground text-[10px] leading-tight">
                        {trendline.type === 'ascending' ? 'Xu hướng tăng' : 'Xu hướng giảm'} • Độ mạnh: {(trendline.strength * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, oklch(0.75 0.15 195) 0px, transparent 1px, transparent 24px),
              repeating-linear-gradient(90deg, oklch(0.75 0.15 195) 0px, transparent 1px, transparent 24px)
            `,
          }}
        />

        <div className="relative z-10">
          <HeaderControls
            symbols={SYMBOLS}
            selectedSymbol={selectedSymbol}
            selectedMode={selectedMode}
            onSymbolChange={setSelectedSymbolId}
            onModeChange={setSelectedMode}
          />

          <BiasBar bias={signalData.marketBias} />

          <TimeframeStrip signals={signalData.timeframeSignals} className="py-2.5" />

          <div className="px-3 pt-2 pb-2">
            <div 
              className="bg-card/30 rounded-lg border border-border/50 overflow-hidden" 
              style={{ 
                boxShadow: signalData.marketBias.dominantSide === 'bullish' 
                  ? '0 4px 32px -6px oklch(0.85 0.22 150 / 0.2)' 
                  : '0 4px 32px -6px oklch(0.65 0.25 25 / 0.2)'
              }}
            >
              <TradingChart chartData={signalData.chartData} scenario={signalData.marketScenario} />
            </div>
          </div>

          <TerminalTabs
            activeTab={activeTab}
            trendlineCount={signalData.chartData.trendlines.length}
            onTabChange={setActiveTab}
          />

          {renderTabContent()}

          <div className="mt-3 border-t border-border/30 bg-card/10">
            <div className="pt-3">
              <h2 className="px-3 text-[10px] font-bold mb-2.5 uppercase tracking-wider text-muted-foreground">Tin tức & Cảm xúc thị trường</h2>

              <NewsFilterBar
                categories={NEWS_CATEGORIES}
                selectedCategory={selectedNewsCategory}
                onCategoryChange={setSelectedNewsCategory}
              />

              <div className="px-3 py-2.5 space-y-2.5">
                {filteredNews.map((newsItem) => (
                  <NewsCard key={newsItem.id} news={newsItem} />
                ))}
              </div>
            </div>
          </div>
          
          {lastUpdated && (
            <div className="px-3 py-2 text-center">
              <p className="text-[9px] text-muted-foreground font-mono">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
