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

  return TIMEFRAMES.map((timeframe, index) => {
    const weight = index / TIMEFRAMES.length
    const bullishLevel = currentPrice + baseRange * 0.01 * (1 + weight)
    const bearishLevel = currentPrice - baseRange * 0.01 * (1 + weight)

    const priceVsBullish = currentPrice / bullishLevel
    const priceVsBearish = bearishLevel / currentPrice

    const bullishScore = Math.max(0, Math.min(100, priceVsBullish * 100 - 20))
    const bearishScore = Math.max(0, Math.min(100, priceVsBearish * 100 - 20))

    const totalScore = bullishScore + bearishScore
    const normalizedBullish = totalScore > 0 ? bullishScore / totalScore : 0.5
    const normalizedBearish = totalScore > 0 ? bearishScore / totalScore : 0.5

    let bias: BiasDirection = 'neutral'
    if (normalizedBullish > 0.6) bias = 'bullish'
    else if (normalizedBearish > 0.6) bias = 'bearish'

    return {
      timeframe,
      bullishLevel: Number(bullishLevel.toFixed(2)),
      bearishLevel: Number(bearishLevel.toFixed(2)),
      score: normalizedBullish - normalizedBearish,
      bias,
      strength: Math.abs(normalizedBullish - normalizedBearish),
      isBullish: bias === 'bullish',
      isBearish: bias === 'bearish',
    }
  })
}

function aggregateMarketBias(signals: TimeframeSignal[]): MarketBias {
  const weights = [0.05, 0.1, 0.12, 0.15, 0.15, 0.15, 0.13, 0.15]

  let weightedBullish = 0
  let weightedBearish = 0

  signals.forEach((signal, index) => {
    const weight = weights[index]
    const bullishContribution = signal.isBullish ? signal.strength * weight : 0
    const bearishContribution = signal.isBearish ? signal.strength * weight : 0

    weightedBullish += bullishContribution
    weightedBearish += bearishContribution
  })

  const total = weightedBullish + weightedBearish
  const bullishPercent = total > 0 ? Math.round((weightedBullish / total) * 100) : 50
  const bearishPercent = 100 - bullishPercent

  const dominantSide: BiasDirection = bullishPercent > 55 ? 'bullish' : bearishPercent > 55 ? 'bearish' : 'neutral'

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

  const pivot = currentPrice + (Math.random() - 0.5) * baseRange * 0.05
  const targetPrice = bias.dominantSide === 'bullish' ? currentPrice + baseRange * 0.05 : currentPrice - baseRange * 0.04
  const pendingLong = currentPrice - baseRange * 0.01
  const pendingShort = currentPrice + baseRange * 0.012

  let explanationText = ''
  let cautionText = ''

  if (currentPrice < pivot) {
    explanationText = `Giá đang ở phía dưới Pivot (${pivot.toFixed(2)}), có xu hướng tiến về Pivot, canh long tại ${pendingLong.toFixed(2)}.`
    cautionText = 'Theo dõi phản ứng tại vùng hỗ trợ.'
  } else if (currentPrice > pivot) {
    explanationText = `Giá đang ở phía trên Pivot (${pivot.toFixed(2)}), thị trường đang duy trì xu hướng tăng.`
    cautionText = 'Chú ý kháng cự phía trên.'
  } else {
    explanationText = `Giá đang ở Pivot Point: ${pivot.toFixed(2)}, thị trường đang chờ xác nhận để tiếp tục.`
    cautionText = 'Cần breakout xác nhận.'
  }

  return {
    symbol: symbolId,
    currentPrice: Number(currentPrice.toFixed(2)),
    pivot: Number(pivot.toFixed(2)),
    targetPrice: Number(targetPrice.toFixed(2)),
    pendingLong: Number(pendingLong.toFixed(2)),
    pendingShort: Number(pendingShort.toFixed(2)),
    dominantScenario: {
      side: bias.dominantSide === 'bullish' ? 'long' : 'short',
      trigger: bias.dominantSide === 'bullish' ? pendingLong : pendingShort,
      target: targetPrice,
      reason: bias.dominantSide === 'bullish' ? 'Giá phản ứng tốt tại hỗ trợ, các timeframe lớn ủng hộ.' : 'Áp lực bán ở khung lớn, rejection tại kháng cự.',
    },
    alternateScenario: {
      side: bias.dominantSide === 'bullish' ? 'short' : 'long',
      trigger: bias.dominantSide === 'bullish' ? pendingShort : pendingLong,
      target: bias.dominantSide === 'bullish' ? currentPrice - baseRange * 0.03 : currentPrice + baseRange * 0.04,
      reason:
        bias.dominantSide === 'bullish'
          ? 'Nếu giá hồi lên và bị reject tại kháng cự, kịch bản short kích hoạt.'
          : 'Nếu giá reclaim pivot và giữ được, kịch bản long trở lại.',
    },
    explanationText,
    cautionText,
    invalidationLevel: bias.dominantSide === 'bullish' ? pendingLong - baseRange * 0.015 : pendingShort + baseRange * 0.015,
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
