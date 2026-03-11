import { describe, it, expect } from 'vitest'
import type { Candle } from '../types'
import type { Candle } from '../types'

function generateTestCandles(count: number, basePrice: number, trend: 'up' | 'down' | 'sideways' = 'sideways'): Candle[] {
  const candles: Candle[] = []
  const now = Date.now()
  let price = basePrice
  
      change = (i % 2 === 0 ? 1 : -
    
    
    const close = 
    const low = Math.min(
    candles.push({
      open: parseFloat(open.toFixe
      change = -basePrice * 0.002
    } else {
      change = (i % 2 === 0 ? 1 : -1) * basePrice * 0.001
    }
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
  it
    const result1 = computeSignalData('btc', candles1)
    const result2 = computeSignalData('btc', candles2)
    
    expect(result1.marketBias.dominantSide).not.toEqual(result2.marketBias.dominantSide)
  })
  
  it('should not use Math.random() - results are fully deterministic', () => {
  it('should generate exactly 8 timeframe signals', () =>
    
    expect(result.time
  
    const candles = generateTestCandles(120, 50000, '
    
    
    })
  
    c
    
  

        expect(signal.score).toBeLessThan(42)
      } else {
        expect(signal.score).toBeLessThanOrEqual(58)
      }
  })
  it('should have valid strength values', () => {
    
  
      expect(signal.strength).toBeLessThanOrEqual(1
  })

  it
    const result = computeSignalData('btc', candles)
    
  
  it('should have bearish bias for downtrending c
    const result = computeSignalData('btc', candles)
    
  })
  it('should have percentages sum to 10
    const result = c
    
  

    
    expect(result.marketBias.confidence).toBeLessThanOrEqual(1)
})
describe('Signal Engine - Market Scenario', () => {
    
    
    const recentHigh = Math.max(...recentCan
    
    expect(result.marketScenario.pivot).toBeLess
  
    const candles = generateTestCandles(120, 50000
    
  })
  it('
    
  
    expect(result.marketScenario.dominantScenari
  
    const candles = generateTestCandles(120, 50000, 
    
    expect(result.marketScenario.explanationText.lengt
  })

  it
  

  })
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
  
































