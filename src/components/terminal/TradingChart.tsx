import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { ChartData, MarketScenario } from '@/lib/types'

interface TradingChartProps {
  chartData: ChartData
  scenario: MarketScenario
  className?: string
}

export function TradingChart({ chartData, scenario, className }: TradingChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !chartData.candles.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const containerWidth = svgRef.current.clientWidth
    const containerHeight = svgRef.current.clientHeight
    const margin = { top: 40, right: 60, bottom: 30, left: 10 }
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const { candles, trendlines } = chartData

    const xScale = d3
      .scaleLinear()
      .domain([0, candles.length - 1])
      .range([0, width])

    const yMin = Math.min(scenario.pendingLong * 0.998, chartData.priceRange.min)
    const yMax = Math.max(scenario.pendingShort * 1.002, chartData.priceRange.max)

    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]).nice()

    g.append('g')
      .selectAll('.grid-line-horizontal')
      .data(yScale.ticks(8))
      .enter()
      .append('line')
      .attr('class', 'grid-line-horizontal')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', 'oklch(0.75 0.15 195)')
      .attr('stroke-opacity', 0.1)
      .attr('stroke-width', 1)

    g.append('g')
      .selectAll('.grid-line-vertical')
      .data(d3.range(0, candles.length, Math.ceil(candles.length / 10)))
      .enter()
      .append('line')
      .attr('class', 'grid-line-vertical')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'oklch(0.75 0.15 195)')
      .attr('stroke-opacity', 0.1)
      .attr('stroke-width', 1)

    trendlines.forEach((trendline) => {
      if (!trendline.active || trendline.points.length < 2) return

      const line = d3
        .line<{ x: number; y: number }>()
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y))

      g.append('path')
        .datum(trendline.points)
        .attr('class', 'trendline')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', trendline.type === 'ascending' ? 'oklch(0.85 0.22 150)' : 'oklch(0.65 0.25 25)')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4')
    })

    const candleWidth = Math.max(2, width / candles.length - 2)

    candles.forEach((candle, i) => {
      const x = xScale(i)
      const isBullish = candle.close > candle.open

      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', yScale(candle.high))
        .attr('y2', yScale(candle.low))
        .attr('stroke', isBullish ? 'oklch(0.85 0.22 150)' : 'oklch(0.65 0.25 25)')
        .attr('stroke-opacity', 0.8)
        .attr('stroke-width', 1)

      g.append('rect')
        .attr('x', x - candleWidth / 2)
        .attr('y', yScale(Math.max(candle.open, candle.close)))
        .attr('width', candleWidth)
        .attr('height', Math.max(2, Math.abs(yScale(candle.open) - yScale(candle.close))))
        .attr('fill', isBullish ? 'oklch(0.85 0.22 150)' : 'oklch(0.65 0.25 25)')
        .attr('fill-opacity', 0.9)
    })

    const levels = [
      { price: scenario.targetPrice, label: 'Giá Thị Trường Sẽ Hướng Tới', color: 'oklch(0.85 0.18 95)' },
      { price: scenario.pendingShort, label: 'Đặt Lệnh Chờ Tự Động Short', color: 'oklch(0.65 0.25 25)' },
      { price: scenario.pendingLong, label: 'Đặt Lệnh Chờ Tự Động Long', color: 'oklch(0.85 0.22 150)' },
    ]

    levels.forEach((level) => {
      const y = yScale(level.price)

      g.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', level.color)
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.8)
        .attr('stroke-dasharray', '6,3')
        .style('filter', `drop-shadow(0 0 4px ${level.color})`)

      g.append('text')
        .attr('x', width + 4)
        .attr('y', y + 4)
        .attr('fill', level.color)
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(level.price.toFixed(2))
        .style('filter', `drop-shadow(0 0 3px ${level.color})`)
    })

    g.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('fill', 'oklch(0.95 0 0)')
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle')
      .attr('opacity', 0.9)
      .text(scenario.explanationText)

    const yAxis = d3.axisRight(yScale).ticks(8).tickSize(0).tickFormat(d3.format('.2f'))

    g.append('g')
      .attr('transform', `translate(${width}, 0)`)
      .call(yAxis)
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick text')
          .attr('fill', 'oklch(0.65 0.01 240)')
          .attr('font-size', '10px')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('x', 4)
      )
  }, [chartData, scenario])

  return (
    <div className={className}>
      <svg ref={svgRef} className="w-full h-full" style={{ minHeight: '400px' }} />
    </div>
  )
}
