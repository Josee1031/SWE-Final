import { useState, useEffect } from 'react'
import axios from 'axios'

interface Book {
  book_id: number
  title: string
  author_name: string
  isbn: string // Added isbn field
}

export function useBookSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [recommendations, setRecommendations] = useState<Book[]>([])

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (searchQuery.length > 2) {
        try {
          const response = await axios.get<Book[]>(`http://127.0.0.1:8000/api/books/?q=${searchQuery}`)
          setRecommendations(response.data.slice(0, 5)) // Limit to 5 recommendations
        } catch (error) {
          console.error("Error fetching book recommendations:", error)
        }
      } else {
        setRecommendations([])
      }
    }

    const debounceTimer = setTimeout(fetchRecommendations, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  return { searchQuery, setSearchQuery, recommendations }
}