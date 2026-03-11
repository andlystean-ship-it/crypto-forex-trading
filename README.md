# Trading Signal Terminal

A production-grade crypto and forex trading analysis terminal that provides real-time multi-timeframe technical analysis, scenario-based signals, and sentiment context.

## Features

- **Real Market Data Integration**: Live OHLCV candles from Binance API for BTC and ETH
- **Deterministic Signal Engine**: Technical analysis computed server-side from actual candle data
- **Multi-Timeframe Analysis**: Synthesizes signals across 8 timeframes (15M through 1D)
- **Dynamic Scenario Generation**: Calculates support/resistance, pivot points, and entry zones
- **Trendline Detection**: Identifies swing highs/lows and generates trendline candidates
- **News Integration**: Symbol-relevant market news with sentiment analysis
- **Mobile-First Terminal UI**: Responsive dark neon-accented interface

## Architecture

### Production Data Flow

```
Market Data Source (Binance API / Gold Adapter)
→ Server-Side Market Data Fetcher (caching, normalization)
→ Signal Engine (deterministic TA calculations)
→ API Response Layer (caching, stale detection)
→ Frontend Data Hooks (loading/error states)
→ Terminal UI Rendering
```

### Key Components

**Backend (`/src/lib/server/` and `/src/api/`):**
- `marketData.ts` - Fetches and normalizes OHLCV candles from external sources
- `newsAdapter.ts` - Aggregates and filters news by symbol
- `routes.ts` - Express API endpoints with caching and error handling

**Signal Engine (`/src/lib/signalEngine.ts`):**
- Deterministic calculation functions (no randomness)
- Swing point detection
- Trendline generation from actual price data
- Multi-timeframe scoring and bias aggregation
- Scenario construction with entry/target levels

**Frontend (`/src/App.tsx` and `/src/hooks/`):**
- Data fetching hooks with abort signal handling
- Loading, error, and stale state management
- Symbol switching cancels obsolete requests
- Terminal UI components (preserved from original design)

## API Endpoints

### `GET /api/market-state?symbol={symbolId}`

Returns computed terminal state for the specified symbol.

**Parameters:**
- `symbol` - Symbol ID (`btc`, `eth`, `xau`)

**Response:**
```json
{
  "symbol": "btc",
  "lastUpdated": 1234567890,
  "isStale": false,
  "data": {
    "marketBias": { ... },
    "timeframeSignals": [ ... ],
    "chartData": { ... },
    "marketScenario": { ... }
  }
}
```

**Caching:** 60-second cache per symbol. Returns stale data with `isStale: true` if fresh fetch fails.

### `GET /api/news?symbol={symbolId}`

Returns filtered news items relevant to the specified symbol.

**Parameters:**
- `symbol` - Symbol ID (`btc`, `eth`, `xau`)

**Response:**
```json
{
  "symbol": "btc",
  "lastUpdated": 1234567890,
  "items": [
    {
      "id": "news-1",
      "source": "CoinDesk",
      "title": "...",
      "summary": "...",
      "publishedAt": 1234567890,
      "tags": ["BTC"],
      "sentimentLabel": "positive",
      "sentimentScore": 75,
      "sentimentReason": "...",
      "hasTargetPrice": false,
      "url": "#"
    }
  ]
}
```

**Caching:** 5-minute cache per symbol.

## Supported Symbols

| Symbol ID | Display Name | Market Symbol | Data Source |
|-----------|--------------|---------------|-------------|
| `btc` | Bitcoin | `BTCUSDT` | Binance API |
| `eth` | Ethereum | `ETHUSDT` | Binance API |
| `xau` | Gold | `XAUUSD` | Simulated (placeholder for forex integration) |

## Data Sources

### Current Implementation

- **BTC/ETH**: Real live data from Binance Public API (`/api/v3/klines`)
- **XAU**: Simulated realistic candles (placeholder - replace with forex API)

### Adding New Data Sources

To integrate a new market data source:

1. Implement fetching logic in `/src/lib/server/marketData.ts`
2. Add symbol mapping in `SYMBOL_MAPPINGS`
3. Update the fetch logic in `MarketDataFetcher.fetchCandles()`
4. Ensure candles conform to the `Candle` interface

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Currently, no environment variables are required. The app uses public APIs.

**Recommended for production:**
- `BINANCE_API_KEY` - If rate limits become an issue
- `NEWS_API_KEY` - When integrating real news API
- `FOREX_API_KEY` - For XAU/USD real data integration

## Production Considerations

### Current Status

✅ **Production-Ready:**
- Deterministic signal calculations
- Real market data for BTC/ETH
- Server-side caching
- Stale data fallback
- Request cancellation on symbol switch
- Error boundaries

⚠️ **Temporary/Placeholder:**
- XAU data is simulated (needs forex API integration)
- News is template-based (ready for API swap)
- No authentication (suitable for public terminal)

### Next Steps for Full Production

1. **Integrate Forex API** for XAU/USD real data (e.g., Alpha Vantage, Twelve Data)
2. **Add Real News API** (e.g., NewsAPI, CryptoCompare news)
3. **Implement Rate Limiting** on API endpoints
4. **Add Monitoring** for data source failures
5. **Set up Alerts** for stale data conditions
6. **Deploy Backend** (current runtime supports it)

## Technical Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui v4
- **Charts**: D3.js
- **Icons**: Phosphor Icons
- **Backend**: Express (Spark runtime)
- **Data Fetching**: Native fetch with abort signals

## Project Structure

```
/src
  /api
    routes.ts              # API endpoint handlers
  /components
    /terminal              # Terminal UI components
    /ui                    # shadcn components
  /hooks
    use-market-data.ts     # Data fetching hooks
  /lib
    /server
      marketData.ts        # Market data fetcher
      newsAdapter.ts       # News aggregator
    api.ts                 # Frontend API client
    signalEngine.ts        # TA calculation engine
    newsData.ts            # News filtering utilities
    types.ts               # TypeScript interfaces
  App.tsx                  # Main application
  index.css                # Theme and styling
```

## License

MIT

## Contributing

This is a production terminal application. Contributions should prioritize:
- Stability over features
- Real data over mock data
- Deterministic calculations over randomness
- Error handling over happy-path assumptions
