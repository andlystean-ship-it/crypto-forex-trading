import type { SignalData } from './signalEngine'
import type { NewsItem } from './types'

export interface MarketStateResponse {
  symbol: string
  lastUpdated: number
  isStale: boolean
  data: SignalData
}

export interface NewsResponse {
  symbol: string
  lastUpdated: number
  items: NewsItem[]
}

export interface ApiError {
  error: string
  message: string
  timestamp: number
}

const API_BASE = '/api'

export async function fetchMarketState(symbolId: string): Promise<MarketStateResponse> {
  const response = await fetch(`${API_BASE}/market-state?symbol=${symbolId}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch market state: ${response.statusText}`)
  }
  
  return response.json()
}

export async function fetchNews(symbolId: string): Promise<NewsResponse> {
  const response = await fetch(`${API_BASE}/news?symbol=${symbolId}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.statusText}`)
  }
  
  return response.json()
}
