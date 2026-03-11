import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Newspaper, Bookmark, Share } from '@phosphor-icons/react'
import type { NewsItem } from '@/lib/types'

interface NewsCardProps {
  news: NewsItem
  className?: string
}

export function NewsCard({ news, className }: NewsCardProps) {
  const sentimentColor =
    news.sentimentLabel === 'positive'
      ? 'text-primary'
      : news.sentimentLabel === 'negative'
      ? 'text-destructive'
      : 'text-muted-foreground'

  const timestamp = new Date(news.publishedAt).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card className={`p-4 border-border/50 bg-card/50 backdrop-blur-sm ${className}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-muted/50 border-accent/30">
            {news.source}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono">{timestamp}</span>
        </div>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Newspaper size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Bookmark size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Share size={14} />
          </Button>
        </div>
      </div>

      <h3 className="text-sm font-semibold mb-2 line-clamp-2">{news.title}</h3>
      
      <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{news.summary}</p>
      
      <Button variant="link" className="h-auto p-0 text-xs text-accent hover:text-accent/80">
        Xem thêm →
      </Button>

      <div className="flex flex-wrap gap-1 mt-3">
        {news.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-[10px] px-1.5 py-0.5 bg-secondary/50 border border-border/30"
          >
            {tag}
          </Badge>
        ))}
        
        {news.hasTargetPrice && (
          <Badge className="text-[10px] px-1.5 py-0.5 bg-target/20 text-target border border-target/30">
            Có Mục Tiêu Giá
          </Badge>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">Phân tích cảm xúc:</span>
          <span className={`text-xs font-semibold font-mono ${sentimentColor}`}>
            {news.sentimentLabel === 'positive' ? 'Tích cực' : news.sentimentLabel === 'negative' ? 'Tiêu cực' : 'Trung tính'} (
            {news.sentimentScore}%)
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">{news.sentimentReason}</p>
      </div>
    </Card>
  )
}
