import { useState, useEffect } from 'react'
import { api } from '@/config/api'

interface Book {
  book_id: number
  title: string
  author_name: string
  isbn: string // Added isbn field
}

export function useBookSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [recommendations, setRecommendations] = useState<Book[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true)
        try {
          const response = await api.get<Book[]>(`/api/books/?q=${searchQuery}`)
          setRecommendations(response.data.slice(0, 5)) // Limit to 5 recommendations
          setHasSearched(true)
        } catch (error) {
          console.error("Error fetching book recommendations:", error)
        } finally {
          setIsSearching(false)
        }
      } else {
        setRecommendations([])
        setHasSearched(false)
      }
    }

    const debounceTimer = setTimeout(fetchRecommendations, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  return { searchQuery, setSearchQuery, recommendations, isSearching, hasSearched }
}