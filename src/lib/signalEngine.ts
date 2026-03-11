import type {
  MarketBias,
  Symbol,
  TimeframeSignal,
  Candle,
  Trendline,
  ChartData,
  MarketScenario,
  TimeframeLabel,
  BiasDirection,
} from './types'

export const SYMBOLS: Symbol[] = [
  {
    id: 'btc',
    displayName: 'Bitcoin',
    marketSymbol: 'BTCUSDT',
    assetType: 'crypto',
    uiLabel: 'BTC',
    quoteCurrency: 'USDT',
  },
  {
    id: 'eth',
    displayName: 'Ethereum',
    marketSymbol: 'ETHUSDT',
    assetType: 'crypto',
    uiLabel: 'ETH',
    quoteCurrency: 'USDT',
  },
  {
    id: 'xau',
    displayName: 'Gold',
    marketSymbol: 'XAUUSD',
    assetType: 'commodity',
    uiLabel: 'XAU',
    quoteCurrency: 'USD',
  },
]

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

function generateTrendlines(candles: Candle[]): Trendline[] {
  const { highs, lows } = findSwingPoints(candles)
  const trendlines: Trendline[] = []

  const currentPrice = candles[candles.length - 1].close
  const recentLows = lows.slice(-3)
  const recentHighs = highs.slice(-3)

  if (lows.length >= 2) {
    const slope = (recentLows[recentLows.length - 1].price - recentLows[0].price) / (recentLows.length - 1)
    const lastLowPrice = recentLows[recentLows.length - 1].price
    const distanceToPrice = ((currentPrice - lastLowPrice) / currentPrice) * 100
    const strength = Math.min(0.95, Math.max(0.3, distanceToPrice / 5))
    const isRising = slope > 0

    trendlines.push({
      id: 'support-1',
      type: 'ascending',
      points: recentLows.map((p) => ({ x: p.index, y: p.price })),
      slope,
      active: true,
      strength,
      broken: false,
      label: isRising ? 'Support tăng dần' : 'Support nằm ngang',
    })
  }

  if (highs.length >= 2) {
    const slope = (recentHighs[recentHighs.length - 1].price - recentHighs[0].price) / (recentHighs.length - 1)
    const lastHighPrice = recentHighs[recentHighs.length - 1].price
    const distanceToPrice = ((lastHighPrice - currentPrice) / currentPrice) * 100
    const strength = Math.min(0.95, Math.max(0.3, distanceToPrice / 5))
    const isRising = slope > 0

    trendlines.push({
      id: 'resistance-1',
      type: 'descending',
      points: recentHighs.map((p) => ({ x: p.index, y: p.price })),
      slope,
      active: true,
      strength,
      broken: false,
      label: isRising ? 'Resistance tăng dần' : 'Resistance nằm ngang',
    })
  }

  return trendlines
}

function generateTimeframeSignals(candles: Candle[]): TimeframeSignal[] {
  const timeframes: TimeframeLabel[] = ['15M', '1H', '2H', '4H', '6H', '8H', '12H', '1D']
  const currentPrice = candles[candles.length - 1].close
  const shortTermCandles = candles.slice(-20)
  const midTermCandles = candles.slice(-60)

  const shortTermClose = shortTermCandles[0].close
  const midTermClose = midTermCandles[0].close

  const shortTermMomentum = (currentPrice - shortTermClose) / shortTermClose
  const midTermMomentum = (currentPrice - midTermClose) / midTermClose
  const overallBias = shortTermMomentum > 0.002 ? 1 : shortTermMomentum < -0.002 ? -1 : 0

  return timeframes.map((timeframe, index) => {
    const timeframeWeight = 8 - index
    const timeframeInfluence = index < 3 ? shortTermMomentum : midTermMomentum
    const biasFactor = overallBias * 0.3 + timeframeInfluence * 5

    const bullishPercent = Math.max(20, Math.min(80, 50 + biasFactor * 20 + (Math.random() - 0.5) * 15))
    const bearishPercent = 100 - bullishPercent

    const bullishLevel = Number((currentPrice * (1 + timeframeWeight * 0.01)).toFixed(2))
    const bearishLevel = Number((currentPrice * (1 - timeframeWeight * 0.01)).toFixed(2))

    const score = bullishPercent
    const bias: BiasDirection = score > 58 ? 'bullish' : score < 42 ? 'bearish' : 'neutral'
    const strength = Math.abs(score - 50) / 50

    return {
      timeframe,
      bullishLevel,
      bearishLevel,
      score,
      bias,
      strength,
      isBullish: bias === 'bullish',
      isBearish: bias === 'bearish',
    }
  })
}

function generateMarketBias(signals: TimeframeSignal[]): MarketBias {
  const weights = [0.05, 0.1, 0.12, 0.15, 0.15, 0.15, 0.15, 0.13]

  let totalBullishScore = 0
  let totalBearishScore = 0

  signals.forEach((signal, index) => {
    const weight = weights[index]
    const bullishContrib = signal.isBullish ? weight * signal.strength * 100 : 0
    const bearishContrib = signal.isBearish ? weight * signal.strength * 100 : 0

    totalBullishScore += bullishContrib
    totalBearishScore += bearishContrib
  })

  const totalScore = totalBullishScore + totalBearishScore
  const bullishPercent = totalScore > 0 ? Math.round((totalBullishScore / totalScore) * 100) : 50
  const bearishPercent = 100 - bullishPercent

  const dominantSide: BiasDirection =
    bullishPercent > 58 ? 'bullish' : bullishPercent < 42 ? 'bearish' : 'neutral'

  const confidence = Math.abs(bullishPercent - 50) / 50

  return {
    bullishPercent,
    bearishPercent,
    dominantSide,
    confidence,
    lastUpdated: Date.now(),
  }
}

function generateMarketScenario(candles: Candle[], bias: MarketBias, symbolId: string): MarketScenario {
  const currentPrice = candles[candles.length - 1].close
  const recentCandles = candles.slice(-20)
  const recentHigh = Math.max(...recentCandles.map((c) => c.high))
  const recentLow = Math.min(...recentCandles.map((c) => c.low))
  const range = recentHigh - recentLow
  const pivot = Number(((recentHigh + recentLow) / 2).toFixed(2))

  const pendingLong = Number((recentLow + range * 0.25).toFixed(2))
  const pendingShort = Number((recentHigh - range * 0.25).toFixed(2))

  const targetLong = Number((recentHigh + range * 0.3).toFixed(2))
  const targetShort = Number((recentLow - range * 0.3).toFixed(2))

  const distanceToPivot = Math.abs((currentPrice - pivot) / pivot)

  let explanationText = ''
  let cautionText = ''

  if (bias.dominantSide === 'bullish') {
    if (currentPrice > pivot) {
      explanationText = `Giá đang trên Pivot ${pivot}, xu hướng tăng chính. Chờ pullback về ${pendingLong} để vào lệnh.`
    } else {
      explanationText = `Giá đang dưới Pivot ${pivot} nhưng timeframe lớn bullish. Có thể vào long tại vùng hiện tại.`
    }
    if (distanceToPivot > 0.05) {
      cautionText = 'Chờ giá test lại support trước khi vào lệnh để giảm risk.'
    }
  } else if (bias.dominantSide === 'bearish') {
    if (currentPrice < pivot) {
      explanationText = `Giá đang dưới Pivot ${pivot}, xu hướng giảm chính. Chờ retest ${pendingShort} để short.`
    } else {
      explanationText = `Giá đang trên Pivot ${pivot} nhưng timeframe lớn bearish. Chờ rejection để short.`
    }
    if (distanceToPivot > 0.05) {
      cautionText = 'Chờ giá test resistance trước khi short để confirm rejection.'
    }
  } else {
    explanationText = `Giá đang sideways gần Pivot ${pivot}. Timeframe nhỏ conflicting, chờ breakout rõ ràng.`
    cautionText = 'Tránh trade trong range hẹp. Chờ volume tăng và breakout confirm.'
  }

  const dominantSide: 'long' | 'short' = bias.dominantSide === 'bullish' ? 'long' : 'short'
  const alternateSide: 'long' | 'short' = dominantSide === 'long' ? 'short' : 'long'

  return {
    symbol: symbolId,
    currentPrice,
    pivot,
    targetPrice: dominantSide === 'long' ? targetLong : targetShort,
    pendingLong,
    pendingShort,
    dominantScenario: {
      side: dominantSide,
      trigger: dominantSide === 'long' ? pendingLong : pendingShort,
      target: dominantSide === 'long' ? targetLong : targetShort,
      reason:
        dominantSide === 'long'
          ? `Timeframe lớn bullish, canh mua tại ${pendingLong} với target ${targetLong}.`
          : `Timeframe lớn bearish, canh bán tại ${pendingShort} với target ${targetShort}.`,
    },
    alternateScenario: {
      side: alternateSide,
      trigger: alternateSide === 'long' ? pendingLong : pendingShort,
      target: alternateSide === 'long' ? targetLong : targetShort,
      reason:
        alternateSide === 'long'
          ? `Nếu giá breakdown xuống dưới ${recentLow.toFixed(2)}, kịch bản bullish bị invalidate. Chờ retest để short.`
          : `Nếu giá breakout lên trên ${recentHigh.toFixed(2)}, kịch bản bearish bị invalidate. Chờ retest để long.`,
    },
    explanationText,
    cautionText,
    invalidationLevel:
      dominantSide === 'long' ? Number((currentPrice * 0.98).toFixed(2)) : Number((currentPrice * 1.02).toFixed(2)),
  }
}

export interface SignalData {
  marketBias: MarketBias
  timeframeSignals: TimeframeSignal[]
  chartData: ChartData
  marketScenario: MarketScenario
}

export function computeSignalData(symbolId: string, candles: Candle[]): SignalData {
  const trendlines = generateTrendlines(candles)
  const timeframeSignals = generateTimeframeSignals(candles)
  const marketBias = generateMarketBias(timeframeSignals)
  const marketScenario = generateMarketScenario(candles, marketBias, symbolId)

  const prices = candles.map((c) => c.close)
  const currentPrice = candles[candles.length - 1].close

  return {
    marketBias,
    timeframeSignals,
    chartData: {
      symbol: symbolId,
      candles,
      trendlines,
      currentPrice,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
    },
    marketScenario,
  }
}
