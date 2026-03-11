import type { NewsItem } from '../types'

const NEWS_TEMPLATES_BTC: Omit<NewsItem, 'id' | 'publishedAt'>[] = [
  {
    source: 'CoinDesk',
    title: 'Bitcoin holds above key support as institutional demand remains strong',
    summary: 'BTC continues to find buyers at current levels. On-chain data shows whale accumulation patterns. ETF flows remain positive with BlackRock leading inflows.',
    tags: ['BTC'],
    sentimentLabel: 'positive',
    sentimentScore: 68,
    sentimentReason: 'Strong institutional support, positive on-chain metrics',
    hasTargetPrice: false,
    url: '#',
  },
  {
    source: 'The Block',
    title: 'Bitcoin volatility compresses ahead of macro data releases',
    summary: 'BTC trading range tightens as markets await key economic indicators. Historical patterns suggest breakout imminent. Funding rates neutral across exchanges.',
    tags: ['BTC'],
    sentimentLabel: 'neutral',
    sentimentScore: 52,
    sentimentReason: 'Consolidation phase, awaiting catalyst',
    hasTargetPrice: false,
    url: '#',
  },
  {
    source: 'Bloomberg',
    title: 'Spot Bitcoin ETF inflows continue as institutional adoption accelerates',
    summary: 'Major ETF providers report sustained inflows. Institutional allocation to digital assets increasing. Traditional finance integration deepening.',
    tags: ['BTC'],
    sentimentLabel: 'positive',
    sentimentScore: 75,
    sentimentReason: 'Strong institutional demand signals',
    hasTargetPrice: true,
    url: '#',
  },
]

const NEWS_TEMPLATES_XAU: Omit<NewsItem, 'id' | 'publishedAt'>[] = [
  {
    source: 'Kitco News',
    title: 'Gold consolidates near highs as dollar strength weighs on momentum',
    summary: 'XAU/USD trading sideways in tight range. DXY strength providing resistance. Central bank buying remains robust, providing floor.',
    tags: ['XAU'],
    sentimentLabel: 'neutral',
    sentimentScore: 54,
    sentimentReason: 'Range-bound, mixed signals from macro drivers',
    hasTargetPrice: false,
    url: '#',
  },
  {
    source: 'Reuters',
    title: 'Central banks continue gold accumulation for sixth consecutive month',
    summary: 'PBOC and emerging market central banks increase reserves. Physical demand from Asia remains strong. Supply constraints supporting prices.',
    tags: ['XAU'],
    sentimentLabel: 'positive',
    sentimentScore: 72,
    sentimentReason: 'Sustained central bank demand, strong physical flows',
    hasTargetPrice: false,
    url: '#',
  },
  {
    source: 'Bloomberg',
    title: 'Gold volatility picks up ahead of Fed decision on interest rates',
    summary: 'Markets pricing in potential policy shift. Real yields key driver. Geopolitical tensions providing additional support.',
    tags: ['XAU'],
    sentimentLabel: 'neutral',
    sentimentScore: 56,
    sentimentReason: 'Uncertainty around monetary policy direction',
    hasTargetPrice: true,
    url: '#',
  },
]

const NEWS_TEMPLATES_ETH: Omit<NewsItem, 'id' | 'publishedAt'>[] = [
  {
    source: 'CoinDesk',
    title: 'Ethereum staking ratio reaches new high as supply dynamics shift',
    summary: 'ETH staking participation hits record levels. Exchange supply declining. Network activity showing strength across DeFi protocols.',
    tags: ['ETH'],
    sentimentLabel: 'positive',
    sentimentScore: 70,
    sentimentReason: 'Positive supply dynamics, growing staking adoption',
    hasTargetPrice: false,
    url: '#',
  },
  {
    source: 'The Block',
    title: 'Layer 2 activity surges as Ethereum ecosystem expands',
    summary: 'L2 transaction volume reaching new peaks. Base and Arbitrum leading growth. Fee revenue distribution improving.',
    tags: ['ETH'],
    sentimentLabel: 'positive',
    sentimentScore: 66,
    sentimentReason: 'Ecosystem expansion, scaling solutions gaining traction',
    hasTargetPrice: false,
    url: '#',
  },
]

const MIXED_NEWS: Omit<NewsItem, 'id' | 'publishedAt'>[] = [
  {
    source: 'Financial Times',
    title: 'Global risk sentiment shifts as macro outlook evolves',
    summary: 'Markets reassessing growth projections. Correlation between crypto and traditional risk assets remains elevated. Flight-to-quality dynamics favor gold.',
    tags: ['BTC', 'ETH', 'XAU'],
    sentimentLabel: 'neutral',
    sentimentScore: 50,
    sentimentReason: 'Mixed macro signals across asset classes',
    hasTargetPrice: false,
    url: '#',
  },
]

function generateTimestamps(count: number): number[] {
  const now = Date.now()
  const timestamps: number[] = []
  const intervals = [30, 90, 180, 300, 480, 720, 1080, 1440]
  
  for (let i = 0; i < count && i < intervals.length; i++) {
    timestamps.push(now - intervals[i] * 60 * 1000)
  }
  
  return timestamps
}

function selectRelevantNews(symbolId: string): Omit<NewsItem, 'id' | 'publishedAt'>[] {
  let symbolSpecific: Omit<NewsItem, 'id' | 'publishedAt'>[] = []
  
  switch (symbolId) {
    case 'btc':
      symbolSpecific = NEWS_TEMPLATES_BTC
      break
    case 'xau':
      symbolSpecific = NEWS_TEMPLATES_XAU
      break
    case 'eth':
      symbolSpecific = NEWS_TEMPLATES_ETH
      break
  }
  
  return [...symbolSpecific, ...MIXED_NEWS].slice(0, 6)
}

export function generateNewsForSymbol(symbolId: string): NewsItem[] {
  const templates = selectRelevantNews(symbolId)
  const timestamps = generateTimestamps(templates.length)
  
  return templates.map((template, index) => ({
    ...template,
    id: `news-${symbolId}-${index}-${Date.now()}`,
    publishedAt: timestamps[index] || Date.now() - index * 300000,
  }))
}

export class NewsAdapter {
  private cache: Map<string, { news: NewsItem[]; timestamp: number }> = new Map()
  private cacheDuration = 300000
  
  async fetchNews(symbolId: string): Promise<NewsItem[]> {
    const cached = this.cache.get(symbolId)
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.news
    }
    
    const news = generateNewsForSymbol(symbolId)
    
    this.cache.set(symbolId, { news, timestamp: Date.now() })
    
    return news
  }
  
  clearCache() {
    this.cache.clear()
  }
}

export const newsAdapter = new NewsAdapter()
