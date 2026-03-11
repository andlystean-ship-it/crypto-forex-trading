import type { NewsItem, NewsCategory } from './types'

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    source: 'bitcoinworld',
    title: 'Upbit tạm dừng rút tiền LUNA2: Nâng cấp mạng quan trọng khiến nhà đầu tư phải giảm sát',
    summary:
      'BitcoinWorld Upbit tạm dừng việc rút tiền LUNA2: Nâng cấp mạng quan trọng thu hút sự giảm sát của nhà đầu tư Trong một động thái được công đồng tiền điện tử toàn cầu theo dõi chặt chẽ, gã khổng lồ tài sản ký thuật số Hàn Quốc Upbit đã tuyên bố tạm dừng rút tiền đối với LUNA2, mà thông báo được hồi s...',
    publishedAt: Date.now() - 3600000,
    tags: ['BTC', 'ETH', 'BNB', 'TRX'],
    sentimentLabel: 'neutral',
    sentimentScore: 50,
    sentimentReason: 'Tin tức trung tính với tác động tối thiểu đến thị trường',
    hasTargetPrice: true,
    url: '#',
  },
  {
    id: 'news-2',
    source: 'utoday',
    title: 'Bitcoin vượt mốc $70,000 với động lực tăng mạnh từ dòng vốn tổ chức',
    summary:
      'Thị trường Bitcoin đang chứng kiến đợt tăng giá ấn tượng khi giá vượt qua mức kháng cự quan trọng $70,000. Các nhà phân tích cho rằng dòng tiền từ các quỹ đầu tư tổ chức đang là động lực chính thúc đẩy đà tăng này.',
    publishedAt: Date.now() - 7200000,
    tags: ['BTC'],
    sentimentLabel: 'positive',
    sentimentScore: 78,
    sentimentReason: 'Tin tức tích cực hỗ trợ xu hướng tăng ngắn hạn',
    hasTargetPrice: true,
    url: '#',
  },
  {
    id: 'news-3',
    source: 'ambcrypto',
    title: 'Ethereum chuẩn bị nâng cấp lớn: Các nhà phát triển công bố lộ trình Shanghai',
    summary:
      'Cộng đồng Ethereum đang chờ đợi đợt nâng cấp Shanghai quan trọng dự kiến diễn ra trong quý này. Bản nâng cấp sẽ cho phép rút stake ETH và cải thiện hiệu suất mạng lưới đáng kể.',
    publishedAt: Date.now() - 10800000,
    tags: ['ETH'],
    sentimentLabel: 'positive',
    sentimentScore: 72,
    sentimentReason: 'Tin tức tích cực về phát triển kỹ thuật, hỗ trợ tâm lý thị trường',
    hasTargetPrice: false,
    url: '#',
  },
  {
    id: 'news-4',
    source: 'coindesk',
    title: 'Chainlink tích hợp với các tổ chức tài chính truyền thống: SWIFT thử nghiệm oracle',
    summary:
      'Chainlink Labs công bố thử nghiệm thành công việc tích hợp mạng lưới oracle với hệ thống SWIFT. Đây là bước tiến quan trọng trong việc kết nối TradFi với DeFi.',
    publishedAt: Date.now() - 14400000,
    tags: ['LINK'],
    sentimentLabel: 'positive',
    sentimentScore: 81,
    sentimentReason: 'Đối tác chiến lược mạnh mẽ, tăng giá trị dài hạn',
    hasTargetPrice: false,
    url: '#',
  },
  {
    id: 'news-5',
    source: 'cryptonews',
    title: 'Cardano smart contracts đạt mốc 1 triệu giao dịch: Sự tăng trưởng ổn định',
    summary:
      'Mạng lưới Cardano ghi nhận cột mốc quan trọng với 1 triệu smart contract transactions được thực hiện. Dữ liệu on-chain cho thấy sự tăng trưởng đều đặn về hoạt động developer.',
    publishedAt: Date.now() - 18000000,
    tags: ['ADA'],
    sentimentLabel: 'positive',
    sentimentScore: 65,
    sentimentReason: 'Tin tích cực về adoption, nhưng tác động giá ngắn hạn hạn chế',
    hasTargetPrice: false,
    url: '#',
  },
  {
    id: 'news-6',
    source: 'cointelegraph',
    title: 'Solana mạng lưới bị gián đoạn 6 giờ: Vấn đề validator gây lo ngại về reliability',
    summary:
      'Mạng lưới Solana đã trải qua đợt downtime kéo dài 6 giờ do vấn đề với validator consensus. Đây là lần thứ ba trong năm nay, khiến cộng đồng đặt câu hỏi về độ tin cậy của mạng.',
    publishedAt: Date.now() - 21600000,
    tags: ['SOL'],
    sentimentLabel: 'negative',
    sentimentScore: 68,
    sentimentReason: 'Tin tức tiêu cực có thể gây áp lực bán ngắn hạn',
    hasTargetPrice: false,
    url: '#',
  },
  {
    id: 'news-7',
    source: 'decrypt',
    title: 'XRP tăng 15% sau phán quyết tòa án: Ripple thắng kiện SEC trong vụ kiện lịch sử',
    summary:
      'Tòa án Hoa Kỳ ra phán quyết có lợi cho Ripple trong vụ kiện kéo dài với SEC, tuyên bố XRP không phải là chứng khoán trong các giao dịch bán lẻ. Giá XRP tăng vọt ngay sau thông tin.',
    publishedAt: Date.now() - 25200000,
    tags: ['XRP'],
    sentimentLabel: 'positive',
    sentimentScore: 92,
    sentimentReason: 'Tin cực kỳ tích cực, catalyst mạnh cho xu hướng tăng',
    hasTargetPrice: true,
    url: '#',
  },
  {
    id: 'news-8',
    source: 'theblock',
    title: 'Thị trường vàng điện tử: XAU/USD ổn định quanh $5,100 chờ dữ liệu lạm phát',
    summary:
      'Giá vàng dao động trong khoảng hẹp quanh mức $5,100 khi nhà đầu tư chờ đợi báo cáo CPI quan trọng. Nhu cầu safe-haven vẫn duy trì ở mức cao do lo ngại về kinh tế toàn cầu.',
    publishedAt: Date.now() - 28800000,
    tags: ['XAU'],
    sentimentLabel: 'neutral',
    sentimentScore: 52,
    sentimentReason: 'Thị trường chờ catalyst, không có bias rõ ràng',
    hasTargetPrice: false,
    url: '#',
  },
]

export const NEWS_CATEGORIES: NewsCategory[] = [
  { id: 'all', label: 'Tất cả', count: 50 },
  { id: 'btc', label: 'Bitcoin', count: 42 },
  { id: 'eth', label: 'Ethereum', count: 14 },
  { id: 'link', label: 'Chainlink', count: 6 },
  { id: 'ada', label: 'Cardano', count: 8 },
  { id: 'sol', label: 'Solana', count: 9 },
  { id: 'xrp', label: 'XRP', count: 12 },
]

export function filterNewsByCategory(category: string, allNews: NewsItem[]): NewsItem[] {
  if (category === 'all') return allNews

  return allNews.filter((news) => news.tags.some((tag) => tag.toLowerCase() === category.toLowerCase()))
}
