import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

  const timeAgo = Math.floor((Date.now() - news.publishedAt) / 3600000)
  const timeDisplay = timeAgo < 1 ? 'Vừa xong' : `${timeAgo}h trước`

  return (
    <Card className={`p-3 border-border/40 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors ${className}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1">
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-muted/30 border-accent/20 font-bold uppercase">
            {news.source}
          </Badge>
          <span className="text-[9px] text-muted-foreground font-mono">{timeDisplay}</span>
        </div>
        
        {news.hasTargetPrice && (
          <Badge className="text-[9px] px-1.5 py-0 bg-target/15 text-target border border-target/30 font-bold">
            Target
          </Badge>
        )}
      </div>

      <h3 className="text-xs font-bold mb-2 line-clamp-2 leading-snug">{news.title}</h3>
      
      <p className="text-[11px] text-muted-foreground/90 mb-2.5 line-clamp-2 leading-relaxed">{news.summary}</p>

      <div className="flex flex-wrap gap-1 mb-2.5">
        {news.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-[9px] px-1.5 py-0 bg-secondary/40 border border-border/20 font-mono font-semibold"
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="pt-2 border-t border-border/20">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-muted-foreground">Sentiment:</span>
          <span className={`text-[10px] font-bold font-mono ${sentimentColor}`}>
            {news.sentimentLabel === 'positive' ? '↗ Tích cực' : news.sentimentLabel === 'negative' ? '↘ Tiêu cực' : '→ Trung tính'} ({news.sentimentScore}%)
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground/80 mt-1 leading-snug">{news.sentimentReason}</p>
      </div>
    </Card>
  )
}
