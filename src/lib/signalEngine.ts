import type {
  Symbol,
  MarketBias,
  TimeframeSignal,
  Candle,
  Trendline,
  MarketScenario,
  ChartData,
  TimeframeLabel,
  BiasDirection,
} from './types'

const TIMEFRAMES: TimeframeLabel[] = ['15M', '1H', '2H', '4H', '6H', '8H', '12H', '1D']

export const SYMBOLS: Symbol[] = [
  {
    id: 'xau',
    displayName: 'Vàng',
    marketSymbol: 'XAUUSD',
    assetType: 'commodity',
    uiLabel: 'XAU/USDT - Vàng',
    quoteCurrency: 'USDT',
  },
  {
    id: 'btc',
    displayName: 'Bitcoin',
    marketSymbol: 'BTCUSD',
    assetType: 'crypto',
    uiLabel: 'BTC/USDT - Bitcoin',
    quoteCurrency: 'USDT',
  },
  {
    id: 'eth',
    displayName: 'Ethereum',
    marketSymbol: 'ETHUSD',
    assetType: 'crypto',
    uiLabel: 'ETH/USDT - Ethereum',
    quoteCurrency: 'USDT',
  },
]

const SYMBOL_PRICE_RANGES: Record<string, { base: number; range: number }> = {
  xau: { base: 5120, range: 100 },
  btc: { base: 68000, range: 2000 },
  eth: { base: 3200, range: 200 },
}

function generateCandles(symbolId: string, count: number): Candle[] {
  const priceConfig = SYMBOL_PRICE_RANGES[symbolId]
  const candles: Candle[] = []
  let currentPrice = priceConfig.base
  const now = Date.now()

  for (let i = count; i > 0; i--) {
    const timestamp = now - i * 3600000
    const volatility = priceConfig.range * 0.008
    const change = (Math.random() - 0.48) * volatility
    currentPrice += change

    const open = currentPrice
    const close = currentPrice + (Math.random() - 0.5) * volatility * 0.5
    const high = Math.max(open, close) + Math.random() * volatility * 0.3
    const low = Math.min(open, close) - Math.random() * volatility * 0.3

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

  if (lows.length >= 2) {
    const recentLows = lows.slice(-3)
    const slope = (recentLows[recentLows.length - 1].price - recentLows[0].price) / (recentLows[recentLows.length - 1].index - recentLows[0].index)

    trendlines.push({
      id: `${symbolId}-asc-1`,
      type: 'ascending',
      points: recentLows.map((l) => ({ x: l.index, y: l.price })),
      slope,
      active: true,
      strength: 0.8,
      broken: false,
      label: 'Hỗ trợ xu hướng tăng',
    })
  }

  if (highs.length >= 2) {
    const recentHighs = highs.slice(-3)
    const slope = (recentHighs[recentHighs.length - 1].price - recentHighs[0].price) / (recentHighs[recentHighs.length - 1].index - recentHighs[0].index)

    trendlines.push({
      id: `${symbolId}-desc-1`,
      type: 'descending',
      points: recentHighs.map((h) => ({ x: h.index, y: h.price })),
      slope,
      active: true,
      strength: 0.75,
      broken: false,
      label: 'Kháng cự xu hướng giảm',
    })
  }

  return trendlines
}

function calculateTimeframeSignals(candles: Candle[], symbolId: string): TimeframeSignal[] {
  const currentPrice = candles[candles.length - 1].close
  const priceConfig = SYMBOL_PRICE_RANGES[symbolId]
  const baseRange = priceConfig.range

  const recentCandles = candles.slice(-20)
  const avgPrice = recentCandles.reduce((sum, c) => sum + c.close, 0) / recentCandles.length
  const momentum = (currentPrice - avgPrice) / avgPrice

  return TIMEFRAMES.map((timeframe, index) => {
    const timeframeWeight = [0.5, 0.7, 0.8, 1.0, 1.2, 1.4, 1.6, 2.0][index]
    const momentumInfluence = momentum * (0.3 + index * 0.1)
    
    const baseBullish = 50 + momentumInfluence * 50
    const baseBearish = 50 - momentumInfluence * 50
    
    const noise = (Math.random() - 0.5) * 8
    const bullishPercent = Math.max(10, Math.min(90, baseBullish + noise))
    const bearishPercent = 100 - bullishPercent

    const bullishLevel = Number((currentPrice * (1 + timeframeWeight * 0.01)).toFixed(2))
    const bearishLevel = Number((currentPrice * (1 - timeframeWeight * 0.01)).toFixed(2))

    let bias: BiasDirection = 'neutral'
    if (bullishPercent > 58) bias = 'bullish'
    else if (bearishPercent > 58) bias = 'bearish'

    const strength = Math.abs(bullishPercent - bearishPercent) / 100

    return {
      timeframe,
      bullishLevel,
      bearishLevel,
      score: (bullishPercent - bearishPercent) / 100,
      bias,
      strength,
      isBullish: bias === 'bullish',
      isBearish: bias === 'bearish',
    }
  })
}

function aggregateMarketBias(signals: TimeframeSignal[]): MarketBias {
  const weights = [0.05, 0.08, 0.10, 0.13, 0.15, 0.17, 0.16, 0.16]

  let totalBullishScore = 0
  let totalBearishScore = 0

  signals.forEach((signal, index) => {
    const weight = weights[index]
    const bullishContrib = signal.isBullish ? weight * signal.strength * 100 : 0
    const bearishContrib = signal.isBearish ? weight * signal.strength * 100 : 0
    
    totalBullishScore += bullishContrib
    totalBearishScore += bearishContrib
  })

  const total = totalBullishScore + totalBearishScore
  const bullishPercent = total > 0 ? Math.round((totalBullishScore / total) * 100) : 50
  const bearishPercent = 100 - bullishPercent

  const dominantSide: BiasDirection = bullishPercent > 54 ? 'bullish' : bearishPercent > 54 ? 'bearish' : 'neutral'

  return {
    bullishPercent,
    bearishPercent,
    dominantSide,
    confidence: Math.abs(bullishPercent - bearishPercent) / 100,
    lastUpdated: Date.now(),
  }
}

function generateMarketScenario(candles: Candle[], bias: MarketBias, symbolId: string): MarketScenario {
  const currentPrice = candles[candles.length - 1].close
  const priceConfig = SYMBOL_PRICE_RANGES[symbolId]
  const baseRange = priceConfig.range

  const pivotOffset = (bias.bullishPercent - bias.bearishPercent) * 0.0003 * currentPrice
  const pivot = Number((currentPrice + pivotOffset).toFixed(2))
  
  const targetMultiplier = bias.dominantSide === 'bullish' ? 0.018 : -0.016
  const targetPrice = Number((currentPrice * (1 + targetMultiplier)).toFixed(2))
  
  const pendingLong = Number((currentPrice * 0.994).toFixed(2))
  const pendingShort = Number((currentPrice * 1.006).toFixed(2))

  let explanationText = ''
  let cautionText = ''

  const biasStrength = bias.confidence > 0.2 ? 'mạnh' : 'yếu'
  const distanceToPivot = ((currentPrice - pivot) / currentPrice) * 100

  if (distanceToPivot < -0.1) {
    explanationText = `Giá dưới Pivot ${pivot}, xu hướng ${bias.dominantSide === 'bullish' ? 'tăng' : 'giảm'} ${biasStrength}. Entry long: ${pendingLong}.`
    cautionText = 'Quan sát phản ứng tại vùng hỗ trợ quan trọng.'
  } else if (distanceToPivot > 0.1) {
    explanationText = `Giá trên Pivot ${pivot}, momentum ${bias.dominantSide === 'bullish' ? 'tăng' : 'giảm'} đang duy trì. Target: ${targetPrice}.`
    cautionText = 'Theo dõi kháng cự/hỗ trợ gần nhất.'
  } else {
    explanationText = `Giá tại Pivot ${pivot}, chờ breakout xác nhận hướng đi. Bias ${bias.bullishPercent}% bullish.`
    cautionText = 'Chờ tín hiệu rõ ràng trước khi vào lệnh.'
  }

  const dominantSide = bias.dominantSide === 'neutral' ? 'long' : (bias.dominantSide === 'bullish' ? 'long' : 'short')
  const alternateSide = dominantSide === 'long' ? 'short' : 'long'

  return {
    symbol: symbolId,
    currentPrice: Number(currentPrice.toFixed(2)),
    pivot,
    targetPrice,
    pendingLong,
    pendingShort,
    dominantScenario: {
      side: dominantSide,
      trigger: dominantSide === 'long' ? pendingLong : pendingShort,
      target: targetPrice,
      reason: 
        dominantSide === 'long'
          ? `Timeframe lớn hỗ trợ tăng (${bias.bullishPercent}%), giá holding structure tốt.`
          : `Áp lực giảm từ timeframe cao (${bias.bearishPercent}%), rejection tại resistance.`,
    },
    alternateScenario: {
      side: alternateSide,
      trigger: alternateSide === 'long' ? pendingLong : pendingShort,
      target: alternateSide === 'long' ? pendingShort * 1.012 : pendingLong * 0.988,
      reason:
        alternateSide === 'long'
          ? 'Nếu reclaim pivot và hold, kịch bản long trở lại với mục tiêu cao hơn.'
          : 'Nếu bị reject mạnh và mất structure, chuyển sang kịch bản short.',
    },
    explanationText,
    cautionText,
    invalidationLevel: dominantSide === 'long' ? pendingLong * 0.997 : pendingShort * 1.003,
  }
}

export function generateChartData(symbolId: string): ChartData {
  const candles = generateCandles(symbolId, 50)
  const trendlines = generateTrendlines(candles, symbolId)
  const currentPrice = candles[candles.length - 1].close

  const prices = candles.flatMap((c) => [c.high, c.low])
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return {
    symbol: symbolId,
    candles,
    trendlines,
    currentPrice,
    priceRange: {
      min: minPrice,
      max: maxPrice,
    },
  }
}

export function generateSignalData(symbolId: string) {
  const chartData = generateChartData(symbolId)
  const timeframeSignals = calculateTimeframeSignals(chartData.candles, symbolId)
  const marketBias = aggregateMarketBias(timeframeSignals)
  const marketScenario = generateMarketScenario(chartData.candles, marketBias, symbolId)

  return {
    chartData,
    timeframeSignals,
    marketBias,
    marketScenario,
  }
}
