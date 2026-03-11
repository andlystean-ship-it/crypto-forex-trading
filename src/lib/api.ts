import type { SignalData } from './signalEngine'
import { marketDataFetcher } from './server/market
import { marketDataFetcher } from './server/marketData'
import { newsAdapter } from './server/newsAdapter'
export interface MarketStateResponse {

  isStale: boolean
  data: SignalData
export interface News
  isStale: boolean


  
    return {
      lastUpdated: ca
    }
 

    
      data: signalData,

    return {
      lastUpdated: now,
    }
  
        data: cached.data,
    return {
      data: cached.data,
      lastUpdated: cached.timestamp,
      isStale: false

  }
  
  try {
    const marketData = await marketDataFetcher.fetchMarketData(symbolId, signal)
    const signalData = computeSignalData(symbolId, marketData)
    
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


