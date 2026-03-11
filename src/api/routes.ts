import type { Request, Response } from 'express'
import { marketDataFetcher } from '../lib/server/marketData'
import { newsAdapter } from '../lib/server/newsAdapter'
import { computeSignalData } from '../lib/signalEngine'

const marketStateCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60000
const STALE_THRESHOLD = 300000

export function setupApiRoutes(app: any) {
  app.get('/api/market-state', handleMarketState)
  app.get('/api/news', handleNews)
}

async function handleMarketState(req: Request, res: Response) {
  try {
    const symbolId = req.query.symbol as string
    
    if (!symbolId) {
      return res.status(400).json({ error: 'Missing symbol parameter' })
    }

    const cached = marketStateCache.get(symbolId)
    const now = Date.now()
    
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return res.json({
        symbol: symbolId,
        lastUpdated: cached.timestamp,
        isStale: false,
        data: cached.data,
      })
    }
    
    try {
      const candles = await marketDataFetcher.fetchCandles(symbolId, '5m', 120)
      
      if (!candles || candles.length === 0) {
        throw new Error('No candle data received')
      }
      
      const signalData = computeSignalData(symbolId, candles)
      
      marketStateCache.set(symbolId, { data: signalData, timestamp: now })
      
      res.json({
        symbol: symbolId,
        lastUpdated: now,
        isStale: false,
        data: signalData,
      })
    } catch (fetchError) {
      console.error(`Error computing market state for ${symbolId}:`, fetchError)
      
      if (cached && now - cached.timestamp < STALE_THRESHOLD) {
        return res.json({
          symbol: symbolId,
          lastUpdated: cached.timestamp,
          isStale: true,
          data: cached.data,
        })
      }
      
      throw fetchError
    }
  } catch (error) {
    console.error('Error in market state handler:', error)
    res.status(500).json({
      error: 'Failed to fetch market state',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    })
  }
}

async function handleNews(req: Request, res: Response) {
  try {
    const symbolId = req.query.symbol as string
    
    if (!symbolId) {
      return res.status(400).json({ error: 'Missing symbol parameter' })
    }

    const news = await newsAdapter.fetchNews(symbolId)
    
    res.json({
      symbol: symbolId,
      lastUpdated: Date.now(),
      items: news,
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    res.status(500).json({
      error: 'Failed to fetch news',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    })
  }
}
