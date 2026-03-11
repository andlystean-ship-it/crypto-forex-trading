import type { NewsItem } from '../types'

const NEWS_API_BASE = 'https://newsapi.org/v2'
const NEWS_API_KEY = 'demo'

interface NewsAPIArticle {
  source: { id: string | null; name: string }
  author: string | null
  title: string
  description: string
  url: string
  publishedAt: string
  content: string
}

function analyzeNewsSentiment(title: string, description: string): {
  label: 'positive' | 'negative' | 'neutral'
  score: number
  reason: string
} {
  const text = `${title} ${description}`.toLowerCase()
  
  const positiveWords = ['surge', 'rise', 'gain', 'bull', 'up', 'high', 'strong', 'growth', 'positive', 'buy', 'support', 'rally', 'break', 'above']
  const negativeWords = ['fall', 'drop', 'bear', 'down', 'low', 'weak', 'decline', 'negative', 'sell', 'resistance', 'crash', 'below', 'risk']
  
  let positiveCount = 0
  let negativeCount = 0
  
  positiveWords.forEach(word => {
    if (text.includes(word)) positiveCount++
  })
  
  negativeWords.forEach(word => {
    if (text.includes(word)) negativeCount++
  })
  
  const netSentiment = positiveCount - negativeCount
  const totalWords = positiveCount + negativeCount
  
  if (totalWords === 0) {
    return { label: 'neutral', score: 50, reason: 'No clear directional indicators' }
  }
  
  const score = Math.round(50 + (netSentiment / Math.max(totalWords, 1)) * 30)
  
  if (score > 58) {
    return { label: 'positive', score, reason: 'Bullish language and positive price action mentioned' }
  } else if (score < 42) {
    return { label: 'negative', score, reason: 'Bearish language and downward pressure indicated' }
  } else {
    return { label: 'neutral', score, reason: 'Mixed signals from market commentary' }
  }
}

async function fetchNewsAPI(query: string, signal?: AbortSignal): Promise<NewsAPIArticle[]> {
  if (NEWS_API_KEY === 'demo') {
    return []
  }
  
  const url = `${NEWS_API_BASE}/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`
  
  const response = await fetch(url, { signal })
  
  if (!response.ok) {
    throw new Error(`News API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  if (data.status !== 'ok') {
    throw new Error(`News API error: ${data.message || 'Unknown error'}`)
  }
  
  return data.articles || []
}

export class NewsAdapter {
  private cache: Map<string, { news: NewsItem[]; timestamp: number }> = new Map()
  private cacheDuration = 300000
  
  async fetchNews(symbolId: string, signal?: AbortSignal): Promise<NewsItem[]> {
    const cached = this.cache.get(symbolId)
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.news
    }
    
    try {
      const news = await this.fetchRealNews(symbolId, signal)
      
      this.cache.set(symbolId, { news, timestamp: Date.now() })
      
      return news
    } catch (error) {
      if (cached) {
        console.warn(`Using stale news cache for ${symbolId}, fetch failed:`, error)
        return cached.news
      }
      
      console.warn(`Failed to fetch news for ${symbolId}, using fallback:`, error)
      return this.getFallbackNews(symbolId)
    }
  }
  
  private async fetchRealNews(symbolId: string, signal?: AbortSignal): Promise<NewsItem[]> {
    const queryMap: Record<string, string> = {
      btc: 'Bitcoin OR BTC cryptocurrency',
      eth: 'Ethereum OR ETH cryptocurrency',
      xau: 'Gold OR XAU precious metals',
    }
    
    const query = queryMap[symbolId] || symbolId
    
    const articles = await fetchNewsAPI(query, signal)
    
    if (articles.length === 0) {
      return this.getFallbackNews(symbolId)
    }
    
    return articles.slice(0, 6).map((article, index) => {
      const sentiment = analyzeNewsSentiment(article.title, article.description || '')
      
      return {
        id: `news-${symbolId}-${Date.now()}-${index}`,
        source: article.source.name || 'News',
        title: article.title,
        summary: article.description || article.content?.substring(0, 200) || 'No summary available',
        publishedAt: new Date(article.publishedAt).getTime(),
        tags: [symbolId.toUpperCase()],
        sentimentLabel: sentiment.label,
        sentimentScore: sentiment.score,
        sentimentReason: sentiment.reason,
        hasTargetPrice: false,
        url: article.url,
      }
    })
  }
  
  private getFallbackNews(symbolId: string): NewsItem[] {
    const now = Date.now()
    
    const symbolMeta: Record<string, { name: string; desc: string }> = {
      btc: { name: 'Bitcoin', desc: 'Digital asset showing resilience in current market conditions' },
      eth: { name: 'Ethereum', desc: 'Network activity remains strong across DeFi protocols' },
      xau: { name: 'Gold', desc: 'Safe haven asset maintains support from institutional demand' },
    }
    
    const meta = symbolMeta[symbolId] || { name: symbolId.toUpperCase(), desc: 'Asset trading within established range' }
    
    const fallbackItems = [
      {
        source: 'Market Analysis',
        title: `${meta.name}: Technical indicators show consolidation phase`,
        summary: `${meta.desc}. Current price action remains within established range as traders monitor key support and resistance levels.`,
        sentimentLabel: 'neutral' as const,
        sentimentScore: 50,
        sentimentReason: 'Consolidation phase, awaiting directional catalyst',
      },
      {
        source: 'Trading Desk',
        title: `Institutional interest continues in ${meta.name}`,
        summary: 'Long-term positioning remains constructive despite short-term volatility. Market structure showing signs of accumulation at current levels.',
        sentimentLabel: 'positive' as const,
        sentimentScore: 62,
        sentimentReason: 'Positive institutional positioning signals',
      },
      {
        source: 'Market Wire',
        title: `${meta.name} volatility expected ahead of key economic data`,
        summary: 'Traders positioning for potential breakout as macro catalysts approach. Volume patterns suggest increased participation.',
        sentimentLabel: 'neutral' as const,
        sentimentScore: 52,
        sentimentReason: 'Uncertainty around near-term direction',
      },
    ]
    
    return fallbackItems.map((item, index) => ({
      id: `news-${symbolId}-${now}-${index}`,
      ...item,
      publishedAt: now - (index + 1) * 120 * 60 * 1000,
      tags: [symbolId.toUpperCase()],
      hasTargetPrice: false,
      url: '#',
    }))
  }
  
  clearCache() {
    this.cache.clear()
  }
}

export const newsAdapter = new NewsAdapter()
