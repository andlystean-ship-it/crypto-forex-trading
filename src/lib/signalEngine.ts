import type {
  MarketBias,
  Symbol,
  Trendline,
  Symbol,
  Candle,
  Trendline,
  ChartData,
  {
    displayName:
    assetType: 
    quoteCurrenc

    displayName: 'Bitcoin',

    quoteCurrency: 'USDT',
  {
    displayNam
    assetType: 'crypto',
    quoteCurrency: 'USDT',
]
const SYMBOL_PRICE_RANGES: Rec
  btc: { base: 68500, ran
}
fun
  const priceC
    displayName: 'Bitcoin',
    const timestamp = Date.n
    const trend = (Math.
    const open = currentPrice
    quoteCurrency: 'USDT',
    
  {
      open,
      low,
      volume: Math.random() 
    assetType: 'crypto',
  }
    quoteCurrency: 'USDT',

]

    let isHigh = true

      if (candles[i].high <= candles
      }
}

    if (isHigh) highs.push({ index: i, price: candles[i].high })
  }
  return { highs, lows }


  const currentPrice = candles[cand
  if (lows.length >= 2) {
    const slope = (recentLows[recentLows.length - 1]
    const lastLowPrice = recentLows[recentLows.l

    const open = currentPrice
      type: 'ascending',
      slope,
      strength,
      label: isRising ? 'Support tăng dần' : 'Support nằm ngang',

  if (highs.length
    const slope 
      open,
    const s
      low,
      type: 
      slope,
      

  }
  }

  return candles



  const shortTermMomentum = (currentPrice - shortTermC
  const overallBias = momentum > 0.002 ? 1 : momentum

    const timeframeInfluence = index < 3 ? shortTermMomentum :
    let isHigh = true
    

    const bearishPercent = 100 - bullishP
    const bullishLevel = Number((currentPrice * (1 + timeframeWeight * 0.01)).toFixed(2))

      }


      t
     

    if (isHigh) highs.push({ index: i, price: candles[i].high })
    }
  }

  return { highs, lows }
 

    const bullishContrib = signal.isBullish ? weight * signal.strength * 100 : 
    
    totalBearishScore += bearishCont


  if (lows.length >= 2) {

    bullishPercent,
    dominantSide,
    lastUpdated: Date.now(),
}
function generateMarketScenario(candles: Candle[], bias: MarketBias, symbolId: string): MarketScenari

    trendlines.push({
  const range = recentHigh - rec
      type: 'ascending',
  
      slope,
  const pendingLong = Number((
      strength,
  let cautionText = ''
      label: isRising ? 'Support tăng dần' : 'Support nằm ngang',

   

      explanationText = `G
    }
    if (distanceToPivot > 0.05) {
      cautionText = 'Chờ giá te
      explanationText = `Giá đang dưới Pivot ${pivot}, xu hướng giả
    }
    explanationText = `Giá đang sideways gần Pivot ${pivot}. Timeframe nhỏ conflicting, chờ breakout r

  const dominantSide:

    symbol: symbolId,
    pivot,
      slope,
    dominantScenario: {
      trigger: 
      reason: dominantSide === 'long' 
        : `Timeframe lớn bearish, canh bán tại ${pendingShort} với targe
    al
  }

        : `Nếu giá 
 

      : Number((currentPrice * 1.02).toFixed(2)),
}
export interface SignalData {

  marketScenario: MarketScenario

  const candles = generateCandles(symbolId, 120)

  const marketScenario = generateMarketScenar
  const prices = candles.map(c => c.close)

  return {

      symbol: symbolId,
      trendlines,
      priceRange: {
    
    },
  }






    const bullishLevel = Number((currentPrice * (1 + timeframeWeight * 0.01)).toFixed(2))















      isBullish: bias === 'bullish',

    }

}











    











    bullishPercent,

    dominantSide,

    lastUpdated: Date.now(),

}











  







  let cautionText = ''











    }

    if (distanceToPivot > 0.05) {





    }









    symbol: symbolId,

    pivot,



    dominantScenario: {



      reason: dominantSide === 'long' 















      : Number((currentPrice * 1.02).toFixed(2)),

}

export interface SignalData {



  marketScenario: MarketScenario



  const candles = generateCandles(symbolId, 120)





  const prices = candles.map(c => c.close)



  return {



      symbol: symbolId,

      trendlines,

      priceRange: {



    },

  }

