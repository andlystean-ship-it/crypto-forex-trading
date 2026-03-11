import type { Candle } from '../types'

export interface MarketDataSource {
  fetchCandles(symbol: string, interval: string, limit: number, signal?: AbortSignal): Promise<Candle[]>
  getSymbolMapping(symbolId: string): string | undefined
}

const SYMBOL_MAPPINGS: Record<string, { exchange: string; symbol: string }> = {
  btc: { exchange: 'binance', symbol: 'BTCUSDT' },
  eth: { exchange: 'binance', symbol: 'ETHUSDT' },
  xau: { exchange: 'forex', symbol: 'XAUUSD' },
}

const BINANCE_API_BASE = 'https://api.binance.com/api/v3'
const TWELVE_DATA_API_BASE = 'https://api.twelvedata.com'

const INTERVAL_MAPPING: Record<string, string> = {
  '5m': '5min',
  '15m': '15min',
  '1h': '1h',
  '2h': '2h',
  '4h': '4h',
  '1d': '1day',
}

async function fetchBinanceCandles(
  symbol: string,
  interval: string = '5m',
  limit: number = 120,
  signal?: AbortSignal
): Promise<Candle[]> {
  const url = `${BINANCE_API_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  const response = await fetch(url, { signal })
  
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
}

async function fetchForexCandles(
  symbol: string,
  interval: string = '5m',
  limit: number = 120,
  signal?: AbortSignal
): Promise<Candle[]> {
  const mappedInterval = INTERVAL_MAPPING[interval] || '5min'
  const url = `${TWELVE_DATA_API_BASE}/time_series?symbol=${symbol}&interval=${mappedInterval}&outputsize=${limit}&format=JSON`
  
  const response = await fetch(url, { signal })
  
  if (!response.ok) {
    throw new Error(`Forex API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  if (data.status === 'error') {
    throw new Error(`Forex API error: ${data.message || 'Unknown error'}`)
  }
  
  if (!data.values || data.values.length === 0) {
    throw new Error('No forex data available')
  }
  
  return data.values.reverse().map((item: any) => ({
    timestamp: new Date(item.datetime).getTime(),
    open: parseFloat(item.open),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    close: parseFloat(item.close),
    volume: parseFloat(item.volume || '0'),
  }))
}

function generateMockCandles(symbolId: string, limit: number = 120): Candle[] {
  const basePrice = symbolId === 'xau' ? 5100 : symbolId === 'btc' ? 95000 : 3800
  const candles: Candle[] = []
  const now = Date.now()
  const interval = 5 * 60 * 1000
  
  let currentPrice = basePrice
  
  for (let i = 0; i < limit; i++) {
    const timestamp = now - (limit - i) * interval
    const volatility = basePrice * 0.003
    const change = (Math.random() - 0.5) * volatility
    
    currentPrice += change
    
    const open = currentPrice
    const close = currentPrice + (Math.random() - 0.5) * volatility
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    const volume = Math.random() * 1000 + 500
    
    candles.push({
      timestamp,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Number(volume.toFixed(2)),
    })
    
    currentPrice = close
  }
  
  return candles
}

export class MarketDataFetcher implements MarketDataSource {
  private cache: Map<string, { candles: Candle[]; timestamp: number }> = new Map()
  private cacheDuration = 60000
  private useMockData = false
  
  getSymbolMapping(symbolId: string): string | undefined {
    const mapping = SYMBOL_MAPPINGS[symbolId]
    return mapping ? mapping.symbol : undefined
  }
  
  async fetchCandles(
    symbolId: string,
    interval: string = '5m',
    limit: number = 120,
    signal?: AbortSignal
  ): Promise<Candle[]> {
    const cacheKey = `${symbolId}:${interval}:${limit}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.candles
    }
    
    if (this.useMockData) {
      const mockCandles = generateMockCandles(symbolId, limit)
      this.cache.set(cacheKey, { candles: mockCandles, timestamp: Date.now() })
      return mockCandles
    }
    
    const mapping = SYMBOL_MAPPINGS[symbolId]
    
    if (!mapping) {
      throw new Error(`Unknown symbol: ${symbolId}`)
    }
    
    let candles: Candle[]
    
    try {
      if (mapping.exchange === 'forex') {
        candles = await fetchForexCandles(mapping.symbol, interval, limit, signal)
      } else if (mapping.exchange === 'binance') {
        candles = await fetchBinanceCandles(mapping.symbol, interval, limit, signal)
      } else {
        throw new Error(`Unsupported exchange: ${mapping.exchange}`)
      }
      
      if (candles.length === 0) {
        throw new Error(`No candles received for ${symbolId}`)
      }
      
      this.cache.set(cacheKey, { candles, timestamp: Date.now() })
      
      return candles
    } catch (error) {
      if (signal?.aborted) {
        throw new Error('Request aborted')
      }
      
      if (cached) {
        console.warn(`Using stale cache for ${symbolId}, fetch failed:`, error)
        return cached.candles
      }
      
      console.warn(`Failed to fetch real data for ${symbolId}, using mock data:`, error)
      this.useMockData = true
      const mockCandles = generateMockCandles(symbolId, limit)
      this.cache.set(cacheKey, { candles: mockCandles, timestamp: Date.now() })
      return mockCandles
    }
  }
  
  clearCache() {
    this.cache.clear()
  }
}

export const marketDataFetcher = new MarketDataFetcher()
