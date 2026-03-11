import type { SignalData } from './signalEngine'


export interface MarketStateResponse {
  symbol: string
}
  lastUpdated: num
}
e

}
const API_BASE =
  lastUpdated: number
  items: NewsItem[]
 

export interface ApiError {
  error: string
  
    throw new Error
 





  
  if (!response.ok) {










    throw new Error(`Failed to fetch news: ${response.statusText}`)
  }
  
  return response.json()
}
