# Trading Signal Terminal

A mobile-first crypto and forex trading signal terminal that transforms market analysis into actionable intelligence through multi-timeframe technical analysis, scenario-based signals, and sentiment context.

**Experience Qualities**:
1. **Tactical** - Every element serves immediate decision-making with clear bias, targets, and entry zones
2. **Intelligent** - Multi-timeframe synthesis creates coherent market narratives rather than isolated indicators
3. **Authoritative** - Terminal aesthetic conveys professional-grade analysis with neon-accented precision

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
The app orchestrates multi-timeframe technical analysis, dynamic scenario generation, chart annotation engine, and news sentiment integration—requiring sophisticated state management and data transformation layers that work together as a cohesive trading intelligence system.

## Essential Features

### Multi-Timeframe Signal Synthesis
- **Functionality**: Analyzes 8 timeframes (15M through 1D) simultaneously, scoring bullish/bearish bias for each
- **Purpose**: Reveals market structure alignment across time horizons—the foundation of directional confidence
- **Trigger**: Automatic on symbol selection and periodic refresh
- **Progression**: Load OHLCV data → Calculate swing structures → Score each timeframe → Aggregate weighted bias → Display strip
- **Success criteria**: Timeframe cards show distinct bias states, aggregate bias percentage matches weighted calculation

### Dynamic Scenario Engine
- **Functionality**: Generates primary and alternate market scenarios with specific price targets and pending order levels
- **Purpose**: Transforms analysis into actionable trade setups with clear trigger zones
- **Trigger**: Runs after timeframe analysis completes
- **Progression**: Identify pivot → Calculate support/resistance → Generate target → Place pending levels → Create reasoning text
- **Success criteria**: Chart displays target, pending long, pending short with contextual labels; reasoning explains current market position

### Annotated Chart Intelligence
- **Functionality**: Renders candlestick chart overlaid with trendlines, horizontal levels, and inline reasoning
- **Purpose**: Makes technical structure visible and interpretable at a glance
- **Trigger**: Automatic on scenario generation
- **Progression**: Draw candlesticks → Plot trendlines → Add horizontal levels → Overlay labels → Insert reasoning text
- **Success criteria**: Chart shows all annotations clearly on mobile viewport; labels don't overlap price axis

### Sentiment-Enhanced News Context
- **Functionality**: Displays filtered news with AI sentiment analysis and market impact assessment
- **Purpose**: Provides fundamental context layer without diluting technical focus
- **Trigger**: Loads on app init and filters by selected category
- **Progression**: Fetch news → Analyze sentiment → Tag relevance → Filter by category → Display cards
- **Success criteria**: News cards show source, sentiment score, impact text; filters update counts dynamically

### Symbol & Mode Switching
- **Functionality**: Instantly switches between instruments (XAU, BTC, ETH) and bias modes (Long/Short preference)
- **Purpose**: Enables rapid context switching for multi-market monitoring
- **Trigger**: User selects dropdown
- **Progression**: User selects symbol → Load symbol data → Recalculate all analysis → Update UI → Refresh news context
- **Success criteria**: All components update within 300ms; no stale data persists

## Edge Case Handling

- **Neutral Market State**: Display balanced bias (50/50), muted colors, "consolidation watch" reasoning
- **Conflicting Timeframes**: Show mixed strip colors, explanation notes divergence, both scenarios remain visible
- **Missing Data**: Graceful fallback to available timeframes, note gaps in analysis panel
- **Rapid Switching**: Debounce symbol changes, show loading state, cancel pending calculations
- **Overflow Labels**: Truncate intelligently, prioritize target > pending short > pending long visibility

## Design Direction

The design must evoke a live trading war room—high-tech, data-dense, precision-focused. Dark surfaces with neon accents create depth and hierarchy. Grid overlays suggest analytical rigor. Glow effects highlight active states. The feeling: you're monitoring a sophisticated intelligence system, not reading a blog.

## Color Selection

Dark neon futuristic terminal aesthetic with semantic color coding for instant market state recognition.

- **Primary Color**: Neon Green `oklch(0.85 0.22 150)` - Bullish states, long bias, upward momentum. Communicates opportunity and positive technical structure.
- **Secondary Colors**: 
  - Deep Charcoal `oklch(0.15 0.01 240)` - Primary background, creates depth for neon elements
  - Slate Gray `oklch(0.25 0.01 240)` - Card backgrounds, secondary surfaces
- **Accent Color**: Electric Cyan `oklch(0.75 0.15 195)` - Active UI elements, glow effects, selected states. Sharp contrast against dark backgrounds.
- **Destructive/Bearish**: Neon Red `oklch(0.65 0.25 25)` - Bearish states, short bias, downward pressure
- **Target/Pivot**: Electric Yellow `oklch(0.85 0.18 95)` - Target prices, pivot points, critical levels requiring attention

**Foreground/Background Pairings**:
- Primary (Neon Green `oklch(0.85 0.22 150)`): Deep Charcoal `oklch(0.15 0.01 240)` - Ratio 9.2:1 ✓
- Accent (Electric Cyan `oklch(0.75 0.15 195)`): Deep Charcoal `oklch(0.15 0.01 240)` - Ratio 6.8:1 ✓
- Destructive (Neon Red `oklch(0.65 0.25 25)`): Deep Charcoal `oklch(0.15 0.01 240)` - Ratio 5.1:1 ✓
- Target (Electric Yellow `oklch(0.85 0.18 95)`): Deep Charcoal `oklch(0.15 0.01 240)` - Ratio 9.5:1 ✓
- Foreground (Soft White `oklch(0.95 0 0)`): Deep Charcoal `oklch(0.15 0.01 240)` - Ratio 11.8:1 ✓

## Font Selection

Typography must balance readability on small screens with technical precision. Monospace for data, sans-serif for narrative.

- **Primary Font**: Space Grotesk - Geometric sans-serif with technical character, excellent mobile legibility
- **Data Font**: JetBrains Mono - Monospace for prices, percentages, timestamps. Tabular numerals ensure alignment.

**Typographic Hierarchy**:
- H1 (App Title): Space Grotesk Medium / 16px / -0.02em tracking
- H2 (Section Headers): Space Grotesk SemiBold / 14px / -0.01em tracking
- Body (Analysis Text): Space Grotesk Regular / 13px / normal tracking / 1.5 line-height
- Data (Prices, Levels): JetBrains Mono Regular / 12px / -0.01em tracking
- Labels (UI Controls): Space Grotesk Medium / 11px / 0.01em tracking
- Caption (Timestamps, Meta): Space Grotesk Regular / 10px / 0.02em tracking

## Animations

Animations enhance the "live terminal" feel through subtle responsiveness and state transitions, never decoration.

Pulse effects on bias bar and active timeframe cards suggest real-time data flow. Tab transitions use 200ms ease for immediate feedback. Chart annotations fade in sequentially (trendlines → levels → labels) over 300ms to guide attention. Hover states glow with 150ms transitions. Loading states use subtle shimmer rather than spinners to maintain terminal aesthetic.

## Component Selection

- **Components**: 
  - Button (shadcn) - Terminal controls with neon glow states
  - Select (shadcn) - Symbol/mode switching with custom styling for dropdown panels
  - Tabs (shadcn) - Analysis section navigation with neon active indicators
  - Card (shadcn) - News items and timeframe cards with dark glass aesthetic
  - Badge (shadcn) - Filter counts and sentiment scores
  - Separator (shadcn) - Subtle grid-aligned dividers
  
- **Customizations**: 
  - Custom candlestick chart component with D3.js for precise annotation control
  - BiasBar progress component with dual-color gradient and percentage labels
  - TimeframeCard with tri-section layout (bullish top, label center, bearish bottom)
  - AnnotatedLine component for target/pending level overlays
  
- **States**: 
  - Buttons: default (border glow), hover (full glow), active (compressed + bright)
  - Select: closed (border glow), open (panel glow + backdrop), selected (accent color)
  - Tabs: inactive (muted), active (neon underline + glow), hover (subtle glow)
  - Cards: default (subtle border), hover (border glow increase)
  
- **Icon Selection**: 
  - TrendUp/TrendDown (Phosphor) - Bias indicators
  - ChartLine (Phosphor) - Trendline tab
  - Pulse (Phosphor) - Live signals tab
  - Newspaper (Phosphor) - News items
  - Target (Phosphor) - Target price markers
  
- **Spacing**: 
  - Terminal sections: 16px vertical gaps
  - Card internal padding: 12px
  - Timeframe strip: 8px horizontal gaps
  - Chart margins: 16px horizontal, 12px vertical
  - News cards: 12px vertical gaps
  
- **Mobile**: 
  - Single column layout throughout
  - Header controls stack symbol right, mode left on narrow viewports
  - Timeframe strip horizontal scrolls if needed (rare on 8 cards)
  - Chart maintains 2:3 aspect ratio, scales to full width
  - Tabs become full-width pill group
  - News cards full width with no horizontal margins
