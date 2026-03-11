import type { SignalData } from './signalEngine'
import type { NewsItem } from './types'
import { marketDataFetcher } from './server/marketData'
import { newsAdapter } from './server/newsAdapter'
import { computeSignalData } from './signalEngine'

export interface MarketStateResponse {
  data: SignalData
  isStale: boolean
  lastUpdated: number
}

export interface NewsResponse {
  items: NewsItem[]
  lastUpdated: number
}

const CACHE_DURATION = 30000
const STALE_DURATION = 60000

interface MarketStateCache {
  data: SignalData
  timestamp: number
}

const marketStateCache = new Map<string, MarketStateCache>()

export async function fetchMarketState(symbolId: string, signal?: AbortSignal): Promise<MarketStateResponse> {
  const now = Date.now()
  const cached = marketStateCache.get(symbolId)
  
  if (cached) {
    const age = now - cached.timestamp
    
    if (age < CACHE_DURATION) {
      return {
        data: cached.data,
        lastUpdated: cached.timestamp,
        isStale: false
      }
    }
    
    if (age < STALE_DURATION) {
      return {
        data: cached.data,
        lastUpdated: cached.timestamp,
        isStale: true
      }
    }
  }
  
  try {
    const candles = await marketDataFetcher.fetchCandles(symbolId, '5m', 120, signal)
    const signalData = computeSignalData(symbolId, candles)
    
    marketStateCache.set(symbolId, {
      data: signalData,
      timestamp: now
    })
    
    return {
      data: signalData,
      lastUpdated: now,
      isStale: false
    }
  } catch (error) {
    if (cached) {
      return {
        data: cached.data,
        lastUpdated: cached.timestamp,
        isStale: true
      }
    }
    
    throw error
  }
}

export async function fetchNews(symbolId: string, signal?: AbortSignal): Promise<NewsResponse> {
  const news = await newsAdapter.fetchNews(symbolId, signal)
  
  return {
    items: news,
    lastUpdated: Date.now()
  }
}
