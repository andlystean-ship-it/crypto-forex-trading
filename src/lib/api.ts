import type { SignalData } from './signalEngine'


  lastUpdated: number

  items: NewsItem[



  if (!response.ok) {
  }
 

  const response = awai

  }
  return response.json()









  const response = await fetch(`${API_BASE}/news/${symbolId}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.statusText}`)
  }
  
  return response.json()
}
