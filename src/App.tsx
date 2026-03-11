import { useState } from 'react'
import { HeaderControls } from './components/terminal/HeaderControls'
import { BiasBar } from './components/terminal/BiasBar'
import { TimeframeStrip } from './components/terminal/TimeframeStrip'
import { TradingChart } from './components/terminal/TradingChart'
import { TerminalTabs } from './components/terminal/TerminalTabs'
import { NewsFilterBar } from './components/terminal/NewsFilterBar'
import { NewsCard } from './components/terminal/NewsCard'
import { SYMBOLS, generateSignalData } from './lib/signalEngine'
import { MOCK_NEWS, NEWS_CATEGORIES, filterNewsByCategory } from './lib/newsData'
import type { ModeLabel } from './lib/types'

function App() {
  const [selectedSymbolId, setSelectedSymbolId] = useState('xau')
  const [selectedMode, setSelectedMode] = useState<ModeLabel>('Lệnh Chờ Long')
  const [activeTab, setActiveTab] = useState<'signals' | 'analysis' | 'trendlines'>('signals')
  const [selectedNewsCategory, setSelectedNewsCategory] = useState('all')

  const selectedSymbol = SYMBOLS.find((s) => s.id === selectedSymbolId) || SYMBOLS[0]
  const signalData = generateSignalData(selectedSymbolId)
  
  const filteredNews = filterNewsByCategory(selectedNewsCategory, MOCK_NEWS)

  const renderTabContent = () => {
    switch (activeTab) {
      case 'signals':
        return (
          <div className="p-4 space-y-3">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2 text-primary">Tín hiệu Hiện tại</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hướng ưu tiên:</span>
                  <span className={signalData.marketBias.dominantSide === 'bullish' ? 'text-primary font-semibold' : 'text-destructive font-semibold'}>
                    {signalData.marketBias.dominantSide === 'bullish' ? 'LONG' : 'SHORT'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Độ tin cậy:</span>
                  <span className="font-mono">{(signalData.marketBias.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mục tiêu:</span>
                  <span className="text-target font-mono font-semibold">{signalData.marketScenario.targetPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending Long:</span>
                  <span className="text-primary font-mono">{signalData.marketScenario.pendingLong}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending Short:</span>
                  <span className="text-destructive font-mono">{signalData.marketScenario.pendingShort}</span>
                </div>
              </div>
            </div>
          </div>
        )
      case 'analysis':
        return (
          <div className="p-4 space-y-3">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3 text-accent">Phân tích Kỹ thuật</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground mb-1">Kịch bản chính:</p>
                  <p className="text-foreground">{signalData.marketScenario.dominantScenario.reason}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Kịch bản thay thế:</p>
                  <p className="text-foreground">{signalData.marketScenario.alternateScenario.reason}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Lưu ý:</p>
                  <p className="text-target">{signalData.marketScenario.cautionText}</p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'trendlines':
        return (
          <div className="p-4 space-y-3">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">Đường Xu Hướng Đang Hoạt động</h3>
              <div className="space-y-2">
                {signalData.chartData.trendlines.map((trendline) => (
                  <div key={trendline.id} className="flex items-start gap-2 text-xs pb-2 border-b border-border/30 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-1 ${trendline.type === 'ascending' ? 'bg-primary' : 'bg-destructive'}`} />
                    <div className="flex-1">
                      <p className="font-medium">{trendline.label}</p>
                      <p className="text-muted-foreground text-[11px]">
                        {trendline.type === 'ascending' ? 'Xu hướng tăng' : 'Xu hướng giảm'} - Độ mạnh: {(trendline.strength * 100).toFixed(0)}%
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
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, oklch(0.75 0.15 195) 0px, transparent 1px, transparent 20px),
              repeating-linear-gradient(90deg, oklch(0.75 0.15 195) 0px, transparent 1px, transparent 20px)
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

          <TimeframeStrip signals={signalData.timeframeSignals} />

          <div className="px-4 py-4">
            <div className="bg-card/30 rounded-lg border border-border/50 overflow-hidden shadow-2xl" style={{ boxShadow: `0 0 40px ${signalData.marketBias.dominantSide === 'bullish' ? 'oklch(0.85 0.22 150 / 0.1)' : 'oklch(0.65 0.25 25 / 0.1)'}` }}>
              <TradingChart chartData={signalData.chartData} scenario={signalData.marketScenario} />
            </div>
          </div>

          <TerminalTabs
            activeTab={activeTab}
            trendlineCount={signalData.chartData.trendlines.length}
            onTabChange={setActiveTab}
          />

          {renderTabContent()}

          <div className="mt-6 border-t border-border/50 bg-card/20">
            <div className="pt-4">
              <h2 className="px-4 text-sm font-semibold mb-3">Tin tức & Phân tích Cảm xúc</h2>

              <NewsFilterBar
                categories={NEWS_CATEGORIES}
                selectedCategory={selectedNewsCategory}
                onCategoryChange={setSelectedNewsCategory}
              />

              <div className="px-4 py-4 space-y-4">
                {filteredNews.map((news) => (
                  <NewsCard key={news.id} news={news} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
