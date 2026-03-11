export type AssetType = 'crypto' | 'forex' | 'commodity'

export type BiasDirection = 'bullish' | 'bearish' | 'neutral'

export type TimeframeLabel = '15M' | '1H' | '2H' | '4H' | '6H' | '8H' | '12H' | '1D'

export type TrendlineType = 'ascending' | 'descending'

export type ScenarioSide = 'long' | 'short'

export type SentimentLabel = 'positive' | 'negative' | 'neutral'

export type ModeLabel = 'Lệnh Chờ Long' | 'Lệnh Chờ Short'

export interface Symbol {
  id: string
  displayName: string
  marketSymbol: string
  assetType: AssetType
  uiLabel: string
  quoteCurrency: string
}

export interface MarketBias {
  bullishPercent: number
  bearishPercent: number
  dominantSide: BiasDirection
  confidence: number
  lastUpdated: number
}

export interface TimeframeSignal {
  timeframe: TimeframeLabel
  bullishLevel: number
  bearishLevel: number
  score: number
  bias: BiasDirection
  strength: number
  isBullish: boolean
  isBearish: boolean
}

export interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Point {
  x: number
  y: number
}

export interface Trendline {
  id: string
  type: TrendlineType
  points: Point[]
  slope: number
  active: boolean
  strength: number
  broken: boolean
  label: string
}

export interface MarketScenario {
  symbol: string
  currentPrice: number
  pivot: number
  targetPrice: number
  pendingLong: number
  pendingShort: number
  dominantScenario: {
    side: ScenarioSide
    trigger: number
    target: number
    reason: string
  }
  alternateScenario: {
    side: ScenarioSide
    trigger: number
    target: number
    reason: string
  }
  explanationText: string
  cautionText: string
  invalidationLevel: number
}

export interface NewsItem {
  id: string
  source: string
  title: string
  summary: string
  publishedAt: number
  tags: string[]
  sentimentLabel: SentimentLabel
  sentimentScore: number
  sentimentReason: string
  hasTargetPrice: boolean
  url: string
}

export interface NewsCategory {
  id: string
  label: string
  count: number
}

export interface ChartData {
  symbol: string
  candles: Candle[]
  trendlines: Trendline[]
  currentPrice: number
  priceRange: {
    min: number
    max: number
  }
}

export interface AppState {
  selectedSymbol: Symbol
  selectedMode: ModeLabel
  marketBias: MarketBias
  timeframeSignals: TimeframeSignal[]
  chartData: ChartData
  marketScenario: MarketScenario
  activeTab: 'signals' | 'analysis' | 'trendlines'
  newsItems: NewsItem[]
  newsCategories: NewsCategory[]
  selectedNewsCategory: string
  isLoading: boolean
  lastUpdated: number
}
