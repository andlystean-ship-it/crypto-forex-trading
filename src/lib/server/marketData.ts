import type { Candle } from '../types'

export interface MarketDataSource {
  fetchCandles(symbol: string, interval: string, limit: number): Promise<Candle[]>
  getSymbolMapping(symbolId: string): string | undefined
}

const SYMBOL_MAPPINGS: Record<string, string> = {
  btc: 'BTCUSDT',
  eth: 'ETHUSDT',
  xau: 'XAUUSD',
}

const BINANCE_API_BASE = 'https://api.binance.com/api/v3'
const FALLBACK_CANDLES_COUNT = 120

async function fetchBinanceCandles(symbol: string, interval: string = '5m', limit: number = 120): Promise<Candle[]> {
  try {
    const url = `${BINANCE_API_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    return data.map((k: any[]) => ({
      timestamp: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }))
  } catch (error) {
    console.error('Error fetching Binance candles:', error)
    throw error
  }
}

async function fetchGoldCandles(symbol: string, limit: number = 120): Promise<Candle[]> {
  const basePrice = 2650
  const now = Date.now()
  const candles: Candle[] = []
  
  let price = basePrice
  
  for (let i = 0; i < limit; i++) {
    const timestamp = now - (limit - i) * 5 * 60 * 1000
    const volatility = basePrice * 0.001
    const change = (Math.random() - 0.5) * volatility
    price = price + change
    
    const open = price
    const close = price + (Math.random() - 0.5) * volatility * 0.5
    const high = Math.max(open, close) + Math.random() * volatility * 0.3
    const low = Math.min(open, close) - Math.random() * volatility * 0.3
    
    candles.push({
      timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.random() * 100000 + 50000,
    })
    
    price = close
  }
  
  return candles
}

export class MarketDataFetcher implements MarketDataSource {
  private cache: Map<string, { candles: Candle[]; timestamp: number }> = new Map()
  private cacheDuration = 60000
  
  getSymbolMapping(symbolId: string): string | undefined {
    return SYMBOL_MAPPINGS[symbolId]
  }
  
  async fetchCandles(symbolId: string, interval: string = '5m', limit: number = 120): Promise<Candle[]> {
    const cacheKey = `${symbolId}:${interval}:${limit}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.candles
    }
    
    const marketSymbol = this.getSymbolMapping(symbolId)
    
    if (!marketSymbol) {
      throw new Error(`Unknown symbol: ${symbolId}`)
    }
    
    let candles: Candle[]
    
    if (symbolId === 'xau') {
      candles = await fetchGoldCandles(marketSymbol, limit)
    } else {
      candles = await fetchBinanceCandles(marketSymbol, interval, limit)
    }
    
    this.cache.set(cacheKey, { candles, timestamp: Date.now() })
    
    return candles
  }
  
  clearCache() {
    this.cache.clear()
  }
}

export const marketDataFetcher = new MarketDataFetcher()
