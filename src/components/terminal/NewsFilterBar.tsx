import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { NewsCategory } from '@/lib/types'

interface NewsFilterBarProps {
  categories: NewsCategory[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
  className?: string
}

export function NewsFilterBar({ categories, selectedCategory, onCategoryChange, className }: NewsFilterBarProps) {
  return (
    <div className={cn('px-4 py-3 border-b border-border/30', className)}>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium whitespace-nowrap transition-all',
              selectedCategory === category.id
                ? 'bg-target/20 border-target text-target shadow-lg shadow-target/20'
                : 'bg-secondary/50 border-border/50 text-foreground hover:border-accent/50'
            )}
          >
            {category.label}
            <Badge
              variant="secondary"
              className={cn(
                'text-[10px] px-1.5 py-0 min-w-[20px] h-4 flex items-center justify-center',
                selectedCategory === category.id ? 'bg-target/30 text-target-foreground' : ''
              )}
            >
              {category.count}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  )
}
