import { describe, it, expect } from 'vitest'
import { computeSignalData, SYMBOLS } from '../signalEngine'
import type { Candle } from '../types'

function generateTestCandles(count: number, basePrice: number, trend: 'up' | 'down' | 'sideways' = 'sideways'): Candle[] {
  const candles: Candle[] = []
  const now = Date.now()
  let price = basePrice
  
  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * 5 * 60 * 1000
    
    let change = 0
    if (trend === 'up') {
      change = basePrice * 0.002
    } else if (trend === 'down') {
      change = -basePrice * 0.002
    } else {
      change = (i % 2 === 0 ? 1 : -1) * basePrice * 0.001
    }
    
    price = price + change
    
    const open = price
    const close = price + change * 0.5
    const high = Math.max(open, close) + basePrice * 0.001
    const low = Math.min(open, close) - basePrice * 0.001
    
    candles.push({
      timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: 100000,
    })
    
    price = close
  }
  
  return candles
}

describe('Signal Engine - Determinism', () => {
  it('should produce identical results for same input candles', () => {
    const candles = generateTestCandles(120, 50000, 'sideways')
    
    const result1 = computeSignalData('btc', candles)
    const result2 = computeSignalData('btc', candles)
    
    expect(result1).toEqual(result2)
  })
  
  it('should produce different results for different candles', () => {
    const candles1 = generateTestCandles(120, 50000, 'up')
    const candles2 = generateTestCandles(120, 50000, 'down')
    
    const result1 = computeSignalData('btc', candles1)
    const result2 = computeSignalData('btc', candles2)
    
    expect(result1.marketBias.dominantSide).not.toEqual(result2.marketBias.dominantSide)
  })
  
  it('should not use Math.random() - results are fully deterministic', () => {
    const candles = generateTestCandles(120, 50000, 'up')
    
    const results = []
    for (let i = 0; i < 10; i++) {
      results.push(computeSignalData('btc', candles))
    }
    
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toEqual(results[0])
    }
  })
})

describe('Signal Engine - Swing Point Detection', () => {
  it('should find swing highs in uptrend', () => {
    const candles = generateTestCandles(120, 50000, 'up')
    const result = computeSignalData('btc', candles)
    
    expect(result.chartData.trendlines.length).toBeGreaterThan(0)
  })
  
  it('should find swing lows in downtrend', () => {
    const candles = generateTestCandles(120, 50000, 'down')
    const result = computeSignalData('btc', candles)
    
    expect(result.chartData.trendlines.length).toBeGreaterThan(0)
  })
  
  it('should handle minimal candle data', () => {
    const candles = generateTestCandles(20, 50000, 'sideways')
    
    expect(() => {
      computeSignalData('btc', candles)
    }).not.toThrow()
  })
})

describe('Signal Engine - Trendline Generation', () => {
  it('should generate trendlines with valid properties', () => {
    const candles = generateTestCandles(120, 50000, 'up')
    const result = computeSignalData('btc', candles)
    
    result.chartData.trendlines.forEach(trendline => {
      expect(trendline).toHaveProperty('id')
      expect(trendline).toHaveProperty('type')
      expect(trendline).toHaveProperty('points')
      expect(trendline).toHaveProperty('slope')
      expect(trendline).toHaveProperty('strength')
      expect(trendline.strength).toBeGreaterThanOrEqual(0)
      expect(trendline.strength).toBeLessThanOrEqual(1)
    })
  })
  
  it('should mark trendlines as active', () => {
    const candles = generateTestCandles(120, 50000, 'sideways')
    const result = computeSignalData('btc', candles)
    
    result.chartData.trendlines.forEach(trendline => {
      expect(trendline.active).toBe(true)
    })
  })
})

describe('Signal Engine - Timeframe Signals', () => {
  it('should generate exactly 8 timeframe signals', () => {
    const candles = generateTestCandles(120, 50000, 'sideways')
    const result = computeSignalData('btc', candles)
    
    expect(result.timeframeSignals).toHaveLength(8)
  })
  
  it('should have correct timeframe labels', () => {
    const candles = generateTestCandles(120, 50000, 'sideways')
    const result = computeSignalData('btc', candles)
    
    const expectedTimeframes = ['15M', '1H', '2H', '4H', '6H', '8H', '12H', '1D']
    result.timeframeSignals.forEach((signal, index) => {
      expect(signal.timeframe).toBe(expectedTimeframes[index])
    })
  })
  
  it('should have consistent bullish/bearish scoring', () => {
    const candles = generateTestCandles(120, 50000, 'up')
    const result = computeSignalData('btc', candles)
    
    result.timeframeSignals.forEach(signal => {
      if (signal.isBullish) {
        expect(signal.score).toBeGreaterThan(58)
        expect(signal.bias).toBe('bullish')
      } else if (signal.isBearish) {
        expect(signal.score).toBeLessThan(42)
        expect(signal.bias).toBe('bearish')
      } else {
        expect(signal.score).toBeGreaterThanOrEqual(42)
        expect(signal.score).toBeLessThanOrEqual(58)
        expect(signal.bias).toBe('neutral')
      }
    })
  })
  
  it('should have valid strength values', () => {
    const candles = generateTestCandles(120, 50000, 'sideways')
    const result = computeSignalData('btc', candles)
    
    result.timeframeSignals.forEach(signal => {
      expect(signal.strength).toBeGreaterThanOrEqual(0)
      expect(signal.strength).toBeLessThanOrEqual(1)
    })
  })
})

describe('Signal Engine - Market Bias', () => {
  it('should have bullish bias for uptrending candles', () => {
    const candles = generateTestCandles(120, 50000, 'up')
    const result = computeSignalData('btc', candles)
    
    expect(result.marketBias.dominantSide).toBe('bullish')
    expect(result.marketBias.bullishPercent).toBeGreaterThan(50)
  })
  
  it('should have bearish bias for downtrending candles', () => {
    const candles = generateTestCandles(120, 50000, 'down')
    const result = computeSignalData('btc', candles)
    
    expect(result.marketBias.dominantSide).toBe('bearish')
    expect(result.marketBias.bearishPercent).toBeGreaterThan(50)
  })
  
  it('should have percentages sum to 100', () => {
    const candles = generateTestCandles(120, 50000, 'sideways')
    const result = computeSignalData('btc', candles)
    
    expect(result.marketBias.bullishPercent + result.marketBias.bearishPercent).toBe(100)
  })
  
  it('should have valid confidence values', () => {
    const candles = generateTestCandles(120, 50000, 'sideways')
    const result = computeSignalData('btc', candles)
    
    expect(result.marketBias.confidence).toBeGreaterThanOrEqual(0)
    expect(result.marketBias.confidence).toBeLessThanOrEqual(1)
  })
})

describe('Signal Engine - Market Scenario', () => {
  it('should generate valid pivot point', () => {
    const candles = generateTestCandles(120, 50000, 'sideways')
    const result = computeSignalData('btc', candles)
    
    const recentCandles = candles.slice(-20)
    const recentHigh = Math.max(...recentCandles.map(c => c.high))
    const recentLow = Math.min(...recentCandles.map(c => c.low))
    
    expect(result.marketScenario.pivot).toBeGreaterThan(recentLow)
    expect(result.marketScenario.pivot).toBeLessThan(recentHigh)
  })
  
  it('should have pending long below pending short', () => {
    const candles = generateTestCandles(120, 50000, 'sideways')
    const result = computeSignalData('btc', candles)
    
    expect(result.marketScenario.pendingLong).toBeLessThan(result.marketScenario.pendingShort)
  })
  
  it('should have valid scenario sides', () => {
    const candles = generateTestCandles(120, 50000, 'up')
    const result = computeSignalData('btc', candles)
    
    expect(['long', 'short']).toContain(result.marketScenario.dominantScenario.side)
    expect(['long', 'short']).toContain(result.marketScenario.alternateScenario.side)
    expect(result.marketScenario.dominantScenario.side).not.toBe(result.marketScenario.alternateScenario.side)
  })
  
  it('should provide explanation and caution text', () => {
    const candles = generateTestCandles(120, 50000, 'sideways')
    const result = computeSignalData('btc', candles)
    
    expect(result.marketScenario.explanationText).toBeTruthy()
    expect(result.marketScenario.explanationText.length).toBeGreaterThan(0)
    expect(result.marketScenario.cautionText.length).toBeGreaterThan(0)
  })
})

describe('Signal Engine - Chart Data', () => {
  it('should include all candles', () => {
    const candles = generateTestCandles(120, 50000, 'sideways')
    const result = computeSignalData('btc', candles)
    
    expect(result.chartData.candles).toHaveLength(120)
    expect(result.chartData.candles).toEqual(candles)
  })
  
  it('should calculate correct price range', () => {
    const candles = generateTestCandles(120, 50000, 'sideways')
    const result = computeSignalData('btc', candles)
    
    const allPrices = candles.map(c => c.close)
    const expectedMin = Math.min(...allPrices)
    const expectedMax = Math.max(...allPrices)
    
    expect(result.chartData.priceRange.min).toBe(expectedMin)
    expect(result.chartData.priceRange.max).toBe(expectedMax)
  })
  
  it('should set current price to last candle close', () => {
    const candles = generateTestCandles(120, 50000, 'up')
    const result = computeSignalData('btc', candles)
    
    expect(result.chartData.currentPrice).toBe(candles[candles.length - 1].close)
  })
})

describe('Signal Engine - All Symbols', () => {
  it('should work for all defined symbols', () => {
    const candles = generateTestCandles(120, 50000, 'sideways')
    
    SYMBOLS.forEach(symbol => {
      expect(() => {
        const result = computeSignalData(symbol.id, candles)
        expect(result.chartData.symbol).toBe(symbol.id)
      }).not.toThrow()
    })
  })
})
