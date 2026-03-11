import type { SignalData } from './signalEngine'
import { computeSignalData } from './signalEngine'
import { marketDataFetcher } from './server/marketData'
import { newsAdapter } from './server/newsAdapter'
  isStale: boolean

export interface NewsResponse {
  lastUpdated: num
  isStale: boolean
  lastUpdated: number
c

export interface NewsResponse {
  symbol: string
  lastUpdated: number
  items: NewsItem[]
}

const marketStateCache = new Map<string, { data: SignalData; timestamp: number }>()
const CACHE_DURATION = 60000

export async function fetchMarketState(symbolId: string, signal?: AbortSignal): Promise<MarketStateResponse> {
  const cached = marketStateCache.get(symbolId)
  const now = Date.now()
  
    if (cached) {
        data
        lastUpdated: cac
    }
  }
    }
  c
  
    las
  }






















    throw error
  }
}

export async function fetchNews(symbolId: string, signal?: AbortSignal): Promise<NewsResponse> {
  const news = await newsAdapter.fetchNews(symbolId, signal)
  






