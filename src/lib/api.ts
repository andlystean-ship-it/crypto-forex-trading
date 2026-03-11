import type { SignalData } from './signalEngine'
import type { NewsItem } from './types'
import { marketDataFetcher } from './server/marketData'
import { newsAdapter } from './server/newsAdapter'

export interface MarketStateResponse {
  symbol: string
  data: SignalData
  isStale: boolean
  lastUpdated: number
}

export interface NewsResponse {
  symbol: string
  lastUpdated: number
  items: NewsItem[]
}

const marketStateCache = new Map<string, { data: SignalData; timestamp: number }>()
const CACHE_DURATION = 60000
const STALE_THRESHOLD = 300000

export async function fetchMarketState(symbolId: string, signal?: AbortSignal): Promise<MarketStateResponse> {
  const cached = marketStateCache.get(symbolId)
  const now = Date.now()
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return {
      symbol: symbolId,
      lastUpdated: cached.timestamp,
      isStale: false,
      data: cached.data,
    }
  }
  
  try {
    const { computeSignalData } = await import('./signalEngine')
    const candles = await marketDataFetcher.fetchCandles(symbolId, '5m', 120, signal)
    
    if (!candles || candles.length === 0) {
      throw new Error('No candle data received')
    }
    
    const signalData = computeSignalData(symbolId, candles)
    
    marketStateCache.set(symbolId, { data: signalData, timestamp: now })
    
    return {
      symbol: symbolId,
      lastUpdated: now,
      isStale: false,
      data: signalData,
    }
  } catch (fetchError) {
    if (cached && now - cached.timestamp < STALE_THRESHOLD) {
      return {
        symbol: symbolId,
        lastUpdated: cached.timestamp,
        isStale: true,
        data: cached.data,
      }
    }
    
    throw fetchError
  }
}

export async function fetchNews(symbolId: string, signal?: AbortSignal): Promise<NewsResponse> {
  try {
    const news = await newsAdapter.fetchNews(symbolId, signal)
    
    return {
      symbol: symbolId,
      lastUpdated: Date.now(),
      items: news,
    }
  } catch (error) {
    throw new Error(`Failed to fetch news: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
