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
      slope,
      active: distance < 0.03,
      strength,
      broken: distance > 0.04 && currentPrice < lastLowPrice,
      label: isRising ? 'Support tăng dần' : 'Support nằm ngang',
    })
  }

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

    const bullishLevel = Number((currentPrice * (1 + timeframeWeight * 0.01)).toFixed(2))
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
  let cautionText = ''

  const biasStrength = bias.confidence > 0.25 ? 'mạnh' : bias.confidence > 0.15 ? 'trung bình' : 'yếu'
  const distanceToPivot = ((currentPrice - pivot) / currentPrice) * 100

  if (bias.dominantSide === 'bullish') {
    if (distanceToPivot < -0.05) {
      explanationText = `Giá đang dưới Pivot ${pivot}, nhưng timeframe lớn ủng hộ tăng. Canh entry tại hỗ trợ.`
      cautionText = 'Chờ giá test lại vùng hỗ trợ và xuất hiện tín hiệu reversal.'
    } else {
      explanationText = `Giá holding tốt trên ${pivot}, bias tăng ${biasStrength}. Target ${targetPrice}.`
      cautionText = 'Theo dõi volume khi tiến gần target, tránh FOMO vào muộn.'
    }
  } else if (bias.dominantSide === 'bearish') {
    if (distanceToPivot > 0.05) {
      explanationText = `Giá trên Pivot ${pivot}, nhưng áp lực giảm từ khung lớn. Rejection zone.`
      cautionText = 'Chờ confirmation giảm rõ ràng, không long vào kháng cự.'
    } else {
      explanationText = `Giá đang dưới ${pivot}, xu hướng giảm ${biasStrength}. Target ${targetPrice}.`
      cautionText = 'Tránh đứng trước tin tức quan trọng, momentum giảm có thể đảo chiều nhanh.'
    }
  } else {
    explanationText = `Giá tại Pivot ${pivot}, thị trường sideways. Chờ breakout rõ ràng.`
    cautionText = 'Không vào lệnh khi chưa có hướng, risk/reward không tốt.'
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
          ? `Timeframe ${bias.confidence > 0.25 ? '4H-1D' : '1H-4H'} hỗ trợ tăng. Giá holding structure, entry tại ${dominantSide === 'long' ? pendingLong : pendingShort}.`
          : `Áp lực bán từ khung ${bias.confidence > 0.25 ? 'Daily' : '4H'}. Rejection tại kháng cự, canh short nếu confirm.`,
    },
    alternateScenario: {
      side: alternateSide,
      trigger: alternateSide === 'long' ? pendingLong : pendingShort,
      target: Number((alternateSide === 'long' ? pendingShort * 1.011 : pendingLong * 0.989).toFixed(2)),
      reason:
        alternateSide === 'long'
          ? 'Kịch bản thay thế: Reclaim pivot và close trên kháng cự → chuyển long, target cao hơn.'
          : 'Kịch bản thay thế: Mất structure và break support → chuyển short, target thấp hơn.',
    },
    explanationText,
    cautionText,
    invalidationLevel: dominantSide === 'long' ? pendingLong * 0.996 : pendingShort * 1.004,
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
