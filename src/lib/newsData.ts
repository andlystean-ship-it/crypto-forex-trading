import type { NewsItem, NewsCategory } from './types'

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    source: 'CoinDesk',
    title: 'Bitcoin consolidates tại $68,500 sau đợt rally mạnh, volume giảm đáng kể',
    summary:
      'BTC đang trong pha tích lũy sau khi test vùng $70k. Dữ liệu on-chain cho thấy whale đang accumulate, nhưng volume giao dịch giảm 40% so với tuần trước. Chờ catalyst mới để breakout.',
    publishedAt: Date.now() - 1800000,
    tags: ['BTC'],
    sentimentLabel: 'neutral',
    sentimentScore: 52,
    sentimentReason: 'Consolidation phase, chờ hướng rõ ràng',
    hasTargetPrice: false,
    url: '#',
  },
  {
    id: 'news-2',
    source: 'The Block',
    title: 'Fed hints rate cut Q3: Risk assets có thể rally mạnh nếu xác nhận',
    summary:
      'FOMC minutes tiết lộ xu hướng dovish hơn. Nếu cắt giảm lãi suất xảy ra, dòng tiền có thể chảy mạnh vào crypto và vàng. BTC correlation với SPX tăng cao trong 3 tháng qua.',
    publishedAt: Date.now() - 5400000,
    tags: ['BTC', 'ETH', 'XAU'],
    sentimentLabel: 'positive',
    sentimentScore: 74,
    sentimentReason: 'Macro catalyst tích cực cho risk assets',
    hasTargetPrice: false,
    url: '#',
  },
  {
    id: 'news-3',
    source: 'Glassnode',
    title: 'Ethereum staking ratio đạt ATH 28%: Giảm selling pressure dài hạn',
    summary:
      'ETH staking đạt mức cao nhất lịch sử. Supply trên sàn giảm xuống mức thấp 3 năm. Điều này hạn chế áp lực bán, nhưng cần volume tăng để breakout khỏi range hiện tại.',
    publishedAt: Date.now() - 9000000,
    tags: ['ETH'],
    sentimentLabel: 'positive',
    sentimentScore: 68,
    sentimentReason: 'Supply dynamics tích cực, nhưng cần demand tăng',
    hasTargetPrice: false,
    url: '#',
  },
  {
    id: 'news-4',
    source: 'Kitco News',
    title: 'Vàng test lại $5,100 khi USD index tăng nhẹ, CPI data là yếu tố quyết định',
    summary:
      'XAU/USD trading sideways tại vùng $5,080-$5,120. DXY tăng nhẹ gây áp lực, nhưng geopolitical risk vẫn hỗ trợ. Data CPI tuần sau sẽ quyết định breakout hoặc breakdown.',
    publishedAt: Date.now() - 12600000,
    tags: ['XAU'],
    sentimentLabel: 'neutral',
    sentimentScore: 50,
    sentimentReason: 'Chờ data kinh tế, range-bound hiện tại',
    hasTargetPrice: true,
    url: '#',
  },
  {
    id: 'news-5',
    source: 'CryptoQuant',
    title: 'BTC exchange outflow tăng 300% trong 48h: Whale đang tích lũy mạnh',
    summary:
      'Lượng BTC rời sàn tăng đột biến. Whale wallets tăng 12,000 BTC. Historically, đây là tín hiệu bullish cho medium-term. Giá có thể test lại support trước khi rally tiếp.',
    publishedAt: Date.now() - 16200000,
    tags: ['BTC'],
    sentimentLabel: 'positive',
    sentimentScore: 81,
    sentimentReason: 'On-chain data bullish, whale accumulation mạnh',
    hasTargetPrice: true,
    url: '#',
  },
  {
    id: 'news-6',
    source: 'Reuters',
    title: 'Trung Quốc tăng mua vàng vật chất tháng thứ 6 liên tiếp,央行 reserves tăng',
    summary:
      'PBOC tiếp tục mua vàng làm dự trữ. Nhu cầu vật chất từ châu Á vẫn rất mạnh bất chấp giá cao. Điều này hỗ trợ floor price cho XAU, giảm khả năng correction sâu.',
    publishedAt: Date.now() - 19800000,
    tags: ['XAU'],
    sentimentLabel: 'positive',
    sentimentScore: 76,
    sentimentReason: 'Nhu cầu vật chất mạnh, central bank buying',
    hasTargetPrice: false,
    url: '#',
  },
  {
    id: 'news-7',
    source: 'Santiment',
    title: 'Social sentiment cho BTC giảm xuống mức thấp 2 tuần: Contrarian signal?',
    summary:
      'Weighted sentiment giảm mạnh bất chấp giá holding tốt. Fear & Greed Index ở 48 (neutral). Historically, low sentiment + stable price thường dẫn đến upside surprise.',
    publishedAt: Date.now() - 23400000,
    tags: ['BTC'],
    sentimentLabel: 'neutral',
    sentimentScore: 55,
    sentimentReason: 'Contrarian indicator, có thể tích cực',
    hasTargetPrice: false,
    url: '#',
  },
  {
    id: 'news-8',
    source: 'Bloomberg',
    title: 'ETF Bitcoin net inflow $180M trong 3 ngày: Institutional demand trở lại',
    summary:
      'Spot BTC ETF ghi nhận inflow tích cực trở lại sau 2 tuần outflow. BlackRock IBIT dẫn đầu với $95M. Điều này cho thấy tổ chức đang quay lại mua ở vùng giá hiện tại.',
    publishedAt: Date.now() - 27000000,
    tags: ['BTC'],
    sentimentLabel: 'positive',
    sentimentScore: 79,
    sentimentReason: 'ETF inflow mạnh, institutional buying',
    hasTargetPrice: true,
    url: '#',
  },
]

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
