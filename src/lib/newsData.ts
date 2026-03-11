import type { NewsItem, NewsCategory } from './types'

export const NEWS_CATEGORIES: NewsCategory[] = [
  { id: 'all', label: 'Tất cả', count: 8 },
  { id: 'btc', label: 'Bitcoin', count: 5 },
  { id: 'eth', label: 'Ethereum', count: 2 },
  { id: 'xau', label: 'Gold', count: 3 },
]

export function filterNewsByCategory(category: string, allNews: NewsItem[]): NewsItem[] {
  if (category === 'all') return allNews

  return allNews.filter((news) => news.tags.some((tag) => tag.toLowerCase() === category.toLowerCase()))
}
