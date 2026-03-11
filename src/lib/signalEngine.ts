import type {
  MarketB
  MarketBias,
  TimeframeSignal,
  Timefra
} from './ty
const TIMEFRAMES:
export const
    id: 'xau',
    marketSymbol
    uiLabel: 'XA

    id: 'btc',

    uiLabel: 'BTC/USDT - Bitcoin',
  }
    id: 'xau',
    marketSymbol: 'ETHUS
    uiLabel: 'ETH/USDT - Et
  },

  xau: { base: 5120, range
  et

    id: 'btc',
  let currentPrice = priceC

    const timestamp = no
    uiLabel: 'BTC/USDT - Bitcoin',

    
   
    id: 'eth',
      open,
      low,
      volume: Math.rando

  }
  },



    let isHigh = true

      if (candles[i].high <= candl
 

    }
    if (isHigh) highs.push({ index: i, price: candl
  }
  return { highs, lows }


  const currentPrice = candles[cand
  if (lows.length >= 2) {
    const slope = (recentLows[recentLows.length 
    const lastLowPrice = recentLows[recentLows.length 
    const strength = isRis

      type: 'ascending',
      slope,
      strength,
      label: isRising ? 'Support tăng dần' : 'Support nằm ngang',

    candles.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume: Math.random() * 1000000 + 500000,
    })

    currentPrice = close
  }

  return candles
}

function findSwingPoints(candles: Candle[], lookback: number = 5) {
  const highs: { index: number; price: number }[] = []
  const lows: { index: number; price: number }[] = []

  for (let i = lookback; i < candles.length - lookback; i++) {
    let isHigh = true
    let isLow = true

    for (let j = 1; j <= lookback; j++) {
      if (candles[i].high <= candles[i - j].high || candles[i].high <= candles[i + j].high) {
        isHigh = false
      }
      if (candles[i].low >= candles[i - j].low || candles[i].low >= candles[i + j].low) {
        isLow = false
      }
    }

    if (isHigh) highs.push({ index: i, price: candles[i].high })
    if (isLow) lows.push({ index: i, price: candles[i].low })
  }

  return { highs, lows }
}

function generateTrendlines(candles: Candle[], symbolId: string): Trendline[] {
  const { highs, lows } = findSwingPoints(candles)
  const trendlines: Trendline[] = []
  const currentPrice = candles[candles.length - 1].close

  if (lows.length >= 2) {
    const recentLows = lows.slice(-3)
    const slope = (recentLows[recentLows.length - 1].price - recentLows[0].price) / (recentLows[recentLows.length - 1].index - recentLows[0].index)
    const isRising = slope > 0
    const lastLowPrice = recentLows[recentLows.length - 1].price
    const distance = Math.abs(currentPrice - lastLowPrice) / currentPrice
    const strength = isRising ? Math.min(0.9, 0.6 + distance * 2) : Math.min(0.8, 0.5 + distance * 2)

    trendlines.push({
      id: `${symbolId}-support`,
      type: 'ascending',
      points: recentLows.map((l) => ({ x: l.index, y: l.price })),
      bias,
      active: distance < 0.03,
      strength,
      broken: distance > 0.04 && currentPrice < lastLowPrice,
      label: isRising ? 'Support tăng dần' : 'Support nằm ngang',
    })
  c

  if (highs.length >= 2) {
    const recentHighs = highs.slice(-3)
    const slope = (recentHighs[recentHighs.length - 1].price - recentHighs[0].price) / (recentHighs[recentHighs.length - 1].index - recentHighs[0].index)
    const isFalling = slope < 0
    const lastHighPrice = recentHighs[recentHighs.length - 1].price
    const distance = Math.abs(currentPrice - lastHighPrice) / currentPrice
    const strength = isFalling ? Math.min(0.9, 0.6 + distance * 2) : Math.min(0.8, 0.5 + distance * 2)

    trendlines.push({
      id: `${symbolId}-resistance`,
      type: 'descending',
      points: recentHighs.map((h) => ({ x: h.index, y: h.price })),
      slope,
      active: distance < 0.03,
      strength,
      broken: distance > 0.04 && currentPrice > lastHighPrice,
      label: isFalling ? 'Resistance giảm dần' : 'Resistance nằm ngang',
    })
  }

  return trendlines
}

function calculateTimeframeSignals(candles: Candle[], symbolId: string): TimeframeSignal[] {
  const currentPrice = candles[candles.length - 1].close
  const priceConfig = SYMBOL_PRICE_RANGES[symbolId]

  const recentCandles = candles.slice(-20)
  const avgPrice = recentCandles.reduce((sum, c) => sum + c.close, 0) / recentCandles.length
  const momentum = (currentPrice - avgPrice) / avgPrice

  const shortTermCandles = candles.slice(-10)
  const shortTermMomentum = (currentPrice - shortTermCandles[0].close) / shortTermCandles[0].close

  const overallBias = momentum > 0.002 ? 1 : momentum < -0.002 ? -1 : 0

  return TIMEFRAMES.map((timeframe, index) => {
    const timeframeWeight = [0.4, 0.6, 0.8, 1.0, 1.3, 1.6, 2.0, 2.5][index]
    const timeframeInfluence = index < 3 ? shortTermMomentum : momentum
    
    const baseBias = overallBias * (30 + index * 5)
    const momentumComponent = timeframeInfluence * (40 + index * 8)
    
    const noise = (Math.random() - 0.5) * (6 - index * 0.4)
    
    const bullishPercent = Math.max(15, Math.min(85, 50 + baseBias + momentumComponent * 100 + noise))
    const bearishPercent = 100 - bullishPercent

      explanationText = `Giá đang dưới ${pivot}, xu hướng giảm ${biasStrength}. Target ${
    const bearishLevel = Number((currentPrice * (1 - timeframeWeight * 0.01)).toFixed(2))

    let bias: BiasDirection = 'neutral'
    if (bullishPercent > 55) bias = 'bullish'
    else if (bearishPercent > 55) bias = 'bearish'

    const strength = Math.abs(bullishPercent - bearishPercent) / 100

    return {
      timeframe,
      bullishLevel,
      bearishLevel,
      score: (bullishPercent - bearishPercent) / 100,
      bias,
      strength,
          ? `Timeframe ${bias.confid
      isBearish: bias === 'bearish',
    a
  })
 

function aggregateMarketBias(signals: TimeframeSignal[]): MarketBias {
  const weights = [0.05, 0.08, 0.10, 0.13, 0.15, 0.17, 0.16, 0.16]

  let totalBullishScore = 0
  let totalBearishScore = 0

  signals.forEach((signal, index) => {
    const weight = weights[index]
    const bullishContrib = signal.isBullish ? weight * signal.strength * 100 : 0
    const bearishContrib = signal.isBearish ? weight * signal.strength * 100 : 0
  co
    totalBullishScore += bullishContrib
    totalBearishScore += bearishContrib
  })

  const total = totalBullishScore + totalBearishScore
  const bullishPercent = total > 0 ? Math.round((totalBullishScore / total) * 100) : 50
  const bearishPercent = 100 - bullishPercent

  const dominantSide: BiasDirection = bullishPercent > 54 ? 'bullish' : bearishPercent > 54 ? 'bearish' : 'neutral'

  return {
  const marketBias 
    bearishPercent,
  return {
    confidence: Math.abs(bullishPercent - bearishPercent) / 100,
    marketBias,
  }
}

function generateMarketScenario(candles: Candle[], bias: MarketBias, symbolId: string): MarketScenario {
  const currentPrice = candles[candles.length - 1].close

  const recentCandles = candles.slice(-5)
  const recentHigh = Math.max(...recentCandles.map(c => c.high))
  const recentLow = Math.min(...recentCandles.map(c => c.low))
  const range = recentHigh - recentLow

  const pivotBias = (bias.bullishPercent - 50) * 0.0002
  const pivot = Number((currentPrice * (1 + pivotBias)).toFixed(2))
  
  const targetMultiplier = bias.dominantSide === 'bullish' ? 0.015 : -0.014
  const targetPrice = Number((currentPrice * (1 + targetMultiplier)).toFixed(2))
  
  const pendingLong = Number((currentPrice * 0.995).toFixed(2))
  const pendingShort = Number((currentPrice * 1.005).toFixed(2))

  let explanationText = ''


  const biasStrength = bias.confidence > 0.25 ? 'mạnh' : bias.confidence > 0.15 ? 'trung bình' : 'yếu'
  const distanceToPivot = ((currentPrice - pivot) / currentPrice) * 100

  if (bias.dominantSide === 'bullish') {
    if (distanceToPivot < -0.05) {
      explanationText = `Giá đang dưới Pivot ${pivot}, nhưng timeframe lớn ủng hộ tăng. Canh entry tại hỗ trợ.`
      cautionText = 'Chờ giá test lại vùng hỗ trợ và xuất hiện tín hiệu reversal.'
    } else {




















































































