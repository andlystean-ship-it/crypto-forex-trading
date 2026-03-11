import type { SignalData } from './signalEngine'


  lastUpdated: number

  lastUpdated: num
  lastUpdated: number


export interface NewsResponse {
  lastUpdated: number
  items: NewsItem[]
}

export interface ApiError {
  error: string
  message: string
}

const API_BASE = '/api'

export async function fetchMarketState(symbol: string): Promise<MarketStateResponse> {
  const response = await fetch(`${API_BASE}/market-state/${symbol}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch market state: ${response.statusText}`)
  }
  

}

export async function fetchNews(symbol: string): Promise<NewsResponse> {
  const response = await fetch(`${API_BASE}/news/${symbol}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.statusText}`)
  }
  
  return response.json()
}
