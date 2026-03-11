# Architecture Documentation

## System Overview

Trading Signal Terminal is a production-grade web application that transforms live market data into actionable trading intelligence through deterministic technical analysis and multi-timeframe signal synthesis.

## Architecture Principles

1. **Server-Side Signal Generation**: All technical analysis calculations occur server-side to ensure consistency
2. **Deterministic Calculations**: No randomness in signal generation - same data always produces same signals
3. **Caching Strategy**: Multi-layer caching prevents unnecessary API calls and provides stale data fallback
4. **Graceful Degradation**: System continues operating with stale data when fresh data unavailable
5. **Request Cancellation**: Frontend cancels obsolete requests on rapid symbol switching

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    External Data Sources                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Binance API │  │  Forex API   │  │   News API   │      │
│  │   (BTC/ETH)  │  │    (XAU)     │  │ (sentiment)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌────────▼───────┐
                    │  Server Layer  │
                    └────────┬───────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
  ┌───────▼────────┐                  ┌────────▼────────┐
  │ Market Data    │                  │  News Adapter   │
  │    Fetcher     │                  │                 │
  │                │                  │                 │
  │ - Normalize    │                  │ - Filter        │
  │ - Cache 60s    │                  │ - Cache 5min    │
  │ - Validate     │                  │ - Tag relevance │
  └───────┬────────┘                  └────────┬────────┘
          │                                     │
          │                  ┌──────────────────┘
          │                  │
  ┌───────▼──────────────────▼───────┐
  │      Signal Engine                │
  │                                   │
  │ - Swing point detection           │
  │ - Trendline generation            │
  │ - Multi-timeframe scoring         │
  │ - Bias aggregation                │
  │ - Scenario construction           │
  └───────┬───────────────────────────┘
          │
  ┌───────▼───────┐
  │  API Routes   │
  │               │
  │ - /market-state │
  │ - /news         │
  │               │
  │ Response cache │
  │ Stale fallback │
  └───────┬───────┘
          │
  ┌───────▼───────────────────────────┐
  │        Frontend Layer              │
  │                                    │
  │  ┌──────────────────────────┐    │
  │  │   Data Fetching Hooks    │    │
  │  │                          │    │
  │  │ - useMarketState()       │    │
  │  │ - useNews()              │    │
  │  │ - Abort signal handling  │    │
  │  │ - Loading/error states   │    │
  │  └──────────┬───────────────┘    │
  │             │                     │
  │  ┌──────────▼───────────────┐    │
  │  │   Terminal UI Components │    │
  │  │                          │    │
  │  │ - Chart rendering        │    │
  │  │ - Signal display         │    │
  │  │ - News cards             │    │
  │  └──────────────────────────┘    │
  └────────────────────────────────────┘
```

## Core Modules

### 1. Market Data Fetcher (`/src/lib/server/marketData.ts`)

**Purpose**: Fetch, normalize, and cache OHLCV candle data from external sources.

**Key Functions**:
- `fetchCandles(symbolId, interval, limit)` - Primary interface for getting candle data
- Internal routing to appropriate data source (Binance for crypto, forex API for XAU)
- 60-second in-memory cache per symbol/interval combination
- Automatic retry and error handling

**Data Flow**:
```
Symbol Request → Check Cache → Hit? Return cached data
                               ↓
                          Fetch from source → Normalize → Cache → Return
```

**Caching Strategy**:
- Cache key: `{symbolId}:{interval}:{limit}`
- TTL: 60 seconds
- Stale threshold: 300 seconds (5 minutes)

### 2. Signal Engine (`/src/lib/signalEngine.ts`)

**Purpose**: Compute deterministic technical analysis from candle data.

**Core Algorithm**:

```typescript
computeSignalData(symbolId, candles):
  1. trendlines = generateTrendlines(candles)
     - Find swing highs/lows using lookback period
     - Calculate slopes
     - Assign strength scores
  
  2. timeframeSignals = generateTimeframeSignals(candles)
     - Calculate momentum for each timeframe
     - Score bullish vs bearish bias
     - Weight by timeframe importance
  
  3. marketBias = generateMarketBias(timeframeSignals)
     - Aggregate weighted scores
     - Determine dominant side
     - Calculate confidence level
  
  4. marketScenario = generateMarketScenario(candles, bias)
     - Calculate pivot from recent range
     - Set pending long/short levels
     - Define target prices
     - Generate reasoning text
  
  5. Return complete SignalData structure
```

**Key Principles**:
- **Determinism**: Same candles always produce same signals
- **No Randomness**: All calculations based on actual price action
- **Explicit Rules**: Every signal has a defined calculation method

### 3. API Routes (`/src/api/routes.ts`)

**Purpose**: Serve computed market state and news to frontend.

#### Endpoint: `/api/market-state?symbol={symbolId}`

**Flow**:
```
Request → Check response cache (60s TTL)
          ↓
     Cache hit? → Return cached response
          ↓
     Fetch candles from marketDataFetcher
          ↓
     computeSignalData(symbolId, candles)
          ↓
     Cache response with timestamp
          ↓
     Return { symbol, lastUpdated, isStale: false, data }

Error handling:
  - If fetch fails but cache exists (< 5min old):
    Return cached data with isStale: true
  - If fetch fails and no cache:
    Return 500 error
```

**Caching Layers**:
1. **API Response Cache** (60s) - Complete response ready to serve
2. **Market Data Cache** (60s) - Raw candle data
3. **Stale Fallback** (5min) - Serve stale data on error

#### Endpoint: `/api/news?symbol={symbolId}`

**Flow**:
```
Request → Check news cache (5min TTL)
          ↓
     Cache hit? → Return cached news
          ↓
     newsAdapter.fetchNews(symbolId)
          ↓
     Filter and tag news by relevance
          ↓
     Cache results
          ↓
     Return { symbol, lastUpdated, items }
```

### 4. Frontend Data Hooks (`/src/hooks/use-market-data.ts`)

**Purpose**: Manage data fetching, loading states, and request lifecycle.

#### `useMarketState(symbolId)`

**Features**:
- Automatic refetch on symbol change
- Abort signal to cancel obsolete requests
- Loading/error/stale state management
- Manual refetch capability

**State Machine**:
```
[Initial] → isLoading=true, data=null
    ↓
[Loading] → Fetch from API
    ↓
[Success] → isLoading=false, data=SignalData, isStale=from response
[Error] → isLoading=false, error=Error (if no stale data available)
    ↓
[Symbol Change] → Abort current fetch → Return to [Loading]
```

#### `useNews(symbolId)`

Similar pattern to `useMarketState` but simpler (no stale handling needed for news).

## State Management

### Server State
- Market data cache (Map)
- News cache (Map)
- Response cache (Map)
- All caches are in-memory with TTL

### Client State
- Current selected symbol (useState)
- Active tab (useState)
- Selected news category (useState)
- Fetched signal data (managed by useMarketState)
- Fetched news (managed by useNews)

### No Global State Manager Needed
Application state is simple enough that React hooks suffice. No Redux/Zustand required.

## Error Handling Strategy

### Backend Errors
1. **Data Source Failure**: Return stale cached data if available
2. **No Cache Available**: Return 500 with error message
3. **Invalid Symbol**: Return 400 with validation error
4. **Rate Limiting**: Future: implement exponential backoff

### Frontend Errors
1. **Network Failure**: Display error state with retry option
2. **Stale Data**: Show badge indicating data age
3. **Loading State**: Display skeleton/loading indicator
4. **Empty State**: Show appropriate message if no data

## Performance Considerations

### Caching Effectiveness
- **60s API cache**: Reduces backend load for multiple users viewing same symbol
- **60s data cache**: Prevents redundant external API calls
- **5min stale fallback**: Maintains availability during data source issues

### Request Optimization
- **Abort Signals**: Cancel in-flight requests on rapid symbol switching
- **Lazy Loading**: News fetched separately from market state
- **Minimal Payload**: Only computed signals sent, not raw candle data

### Frontend Optimization
- **React 19**: Automatic batching and concurrent rendering
- **Vite**: Fast HMR during development, optimized production builds
- **D3 Charts**: Efficient canvas-based rendering for candlesticks

## Security Considerations

### Current Implementation
- **Public APIs Only**: No authentication required
- **Read-Only**: No user data storage or mutations
- **Client-Side Only**: No sensitive server state

### Production Recommendations
- Rate limiting on API endpoints
- CORS configuration for production domain
- API key rotation for external services
- Monitoring for abuse patterns

## Deployment Architecture

```
┌─────────────────────────────────────┐
│         Spark Runtime               │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Express Server              │  │
│  │  (API routes)                │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Vite Dev Server / Build     │  │
│  │  (Frontend assets)           │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

All code runs in single runtime - backend and frontend served together.

## Future Architecture Enhancements

### Short Term
1. **WebSocket Support**: Real-time candle updates without polling
2. **Service Worker**: Offline caching of last known state
3. **Persistent Storage**: User preferences in localStorage or KV store

### Medium Term
1. **Multi-User Support**: Save and share analysis snapshots
2. **Alert System**: Price/signal notifications
3. **Historical Playback**: Replay past market conditions

### Long Term
1. **Microservices**: Separate data fetching from signal computation
2. **Database Layer**: Store historical signals for backtesting
3. **ML Integration**: Pattern recognition to augment rule-based signals

## Testing Strategy

### Current State
- Manual testing during development
- Type safety via TypeScript

### Recommended Additions
1. **Unit Tests**: Signal engine calculations
2. **Integration Tests**: API endpoint responses
3. **E2E Tests**: Full user flows (symbol switching, tab navigation)
4. **Load Tests**: Verify caching effectiveness under concurrent users

## Monitoring & Observability

### Critical Metrics to Track
- **Data Freshness**: % of requests served from cache vs stale
- **API Errors**: External API failure rate
- **Response Times**: P50, P95, P99 latencies
- **Symbol Distribution**: Which symbols users view most

### Recommended Tools
- Error tracking (Sentry)
- Performance monitoring (New Relic, Datadog)
- Uptime monitoring (Pingdom, UptimeRobot)
- Log aggregation (Logtail, Papertrail)

## Migration Path from Demo to Production

### Completed ✅
- [x] Remove random data generation
- [x] Implement real market data fetching
- [x] Server-side signal computation
- [x] API layer with caching
- [x] Frontend data hooks
- [x] Error and stale state handling
- [x] Request cancellation with AbortSignal
- [x] Forex API integration for XAU (Twelve Data)
- [x] Real news API integration (NewsAPI.org with intelligent fallback)
- [x] Deterministic signal engine (no Math.random())
- [x] Comprehensive test suite for signal engine
- [x] Production-ready error handling and logging

### Remaining for High-Scale Production ⚠️
- [ ] Rate limiting middleware (documented, ready to implement)
- [ ] Health check endpoint (documented, ready to implement)
- [ ] Persistent caching layer with spark.kv or Redis
- [ ] Production monitoring with Sentry/Datadog
- [ ] Load testing and optimization
- [ ] Upgrade to paid API tiers for higher rate limits

**See IMPLEMENTATION_REPORT.md for detailed migration documentation**

## Code Maintenance Guidelines

### Adding New Symbols
1. Add entry to `SYMBOL_MAPPINGS` in `marketData.ts`
2. Add Symbol object to `SYMBOLS` array in `signalEngine.ts`
3. Implement data fetching logic if new source needed
4. Test signal calculations with real candle data

### Modifying Signal Logic
1. Update calculation functions in `signalEngine.ts`
2. Ensure determinism (no random values)
3. Test with known candle sequences
4. Document calculation methodology

### Adding New API Endpoints
1. Define handler in `routes.ts`
2. Implement caching strategy
3. Add error handling
4. Create corresponding frontend hook
5. Update API documentation

---

**Document Version**: 1.0  
**Last Updated**: Initial production release  
**Maintained By**: Development team
