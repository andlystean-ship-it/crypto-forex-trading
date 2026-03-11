import type { SignalData } from './signalEngine'
import { computeSignalData } from './signalEngine'
import { marketDataFetcher } from './server/marketData'
import { newsAdapter } from './server/newsAdapter'
import type { NewsItem } from './types'

export interface MarketStateResponse {
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

export async function fetchMarketState(symbolId: string, signal?: AbortSignal): Promise<MarketStateResponse> {
  const cached = marketStateCache.get(symbolId)
  const now = Date.now()
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return {
      data: cached.data,
      isStale: false,
      lastUpdated: cached.timestamp,
    }
  }
  
  try {
    const candles = await marketDataFetcher.fetchCandles(symbolId, '5m', 120, signal)
    
    if (!candles || candles.length === 0) {
      throw new Error('No candle data received')
    }
    
    const signalData = computeSignalData(symbolId, candles)
    
    marketStateCache.set(symbolId, { data: signalData, timestamp: now })
    
    return {
      data: signalData,
      isStale: false,
      lastUpdated: now,
    }
  } catch (error) {
    if (cached) {
      return {
        data: cached.data,
        isStale: true,
        lastUpdated: cached.timestamp,
      }
    }
    throw error
  }
}

export async function fetchNews(symbolId: string, signal?: AbortSignal): Promise<NewsResponse> {
  const news = await newsAdapter.fetchNews(symbolId, signal)
  
  return {
    symbol: symbolId,
    lastUpdated: Date.now(),
    items: news,
  }
}
