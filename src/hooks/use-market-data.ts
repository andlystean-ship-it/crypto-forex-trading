import { useState, useEffect, useRef } from 'react'
import { fetchMarketState, fetchNews } from '../lib/api'
import type { MarketStateResponse, NewsResponse } from '../lib/api'
import type { SignalData } from '../lib/signalEngine'

export interface UseMarketStateResult {
  data: SignalData | null
  isLoading: boolean
  isStale: boolean
  error: Error | null
  lastUpdated: number | null
  refetch: () => void
}

export function useMarketState(symbolId: string): UseMarketStateResult {
  const [data, setData] = useState<SignalData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStale, setIsStale] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const loadData = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    setIsLoading(true)
    setError(null)
    
    try {
      const response: MarketStateResponse = await fetchMarketState(symbolId, abortControllerRef.current.signal)
      setData(response.data)
      setIsStale(response.isStale)
      setLastUpdated(response.lastUpdated)
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err)
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [symbolId])
  
  return {
    data,
    isLoading,
    isStale,
    error,
    lastUpdated,
    refetch: loadData,
  }
}

export interface UseNewsResult {
  news: NewsResponse['items']
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useNews(symbolId: string): UseNewsResult {
  const [news, setNews] = useState<NewsResponse['items']>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const loadNews = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    setIsLoading(true)
    setError(null)
    
    try {
      const response: NewsResponse = await fetchNews(symbolId, abortControllerRef.current.signal)
      setNews(response.items)
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err)
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    loadNews()
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [symbolId])
  
  return {
    news,
    isLoading,
    error,
    refetch: loadNews,
  }
}
