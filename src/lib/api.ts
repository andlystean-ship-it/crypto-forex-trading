import type { SignalData } from './signalEngine'
import type { NewsItem } from './types'

const API_BASE = '/api'

export interface MarketStateResponse {
}
  isStale: boolean
  lastUpdated: number
e

export interface NewsResponse {
  lastUpdated: number
  items: NewsItem[]
}

export async function fetchMarketState(symbolId: string): Promise<MarketStateResponse> {
  const response = await fetch(`${API_BASE}/market/${symbolId}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch market state: ${response.statusText}`)
  }
  
  return response.json()


export async function fetchNews(symbolId: string): Promise<NewsResponse> {
  const response = await fetch(`${API_BASE}/news/${symbolId}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.statusText}`)
  }
  
  return response.json()

