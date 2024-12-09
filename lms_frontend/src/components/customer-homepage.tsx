'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Home, BookOpen, Menu,  ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'


interface Book {
  book_id: number
  title: string
  author_name: string
  isbn: string
  genre_name: string
  is_available: boolean
}

interface Reservation {
  id: number
  book_title: string
  reservation_date: string
  status: string
}

function CustomerHomePageContent() {
  const navigate = useNavigate()
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([])
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const { toggleSidebar, state: sidebarState } = useSidebar()

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await axios.get<Book[]>("http://127.0.0.1:8000/api/books/")
        setFeaturedBooks(response.data.slice(0, 6)) // Assuming we want to feature the first 4 books
      } catch (error) {
        console.error("Error fetching featured books:", error)
        setError("Failed to fetch featured books. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    const fetchReservations = async () => {
      try {
        // Mocking pending reservations data
        const mockReservations: Reservation[] = [
          { id: 1, book_title: "Book 1", reservation_date: "2023-06-01", status: "Pending" },
          { id: 2, book_title: "Book 2", reservation_date: "2023-06-03", status: "Pending" },
        ]
        setPendingReservations(mockReservations)
      } catch (error) {
        console.error("Error fetching reservations:", error)
      }
    }

    fetchFeaturedBooks()
    fetchReservations()
  }, [])

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.length > 2) {
        try {
          const response = await axios.get<Book[]>(`http://127.0.0.1:8000/api/books/?q=${searchQuery}`)
          setSearchResults(response.data.slice(0, 5)) // Limit to 5 results
        } catch (error) {
          console.error("Error fetching search results:", error)
        }
      } else {
        setSearchResults([])
      }
    }

    const debounceTimer = setTimeout(fetchSearchResults, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])



  return (
    <div className="flex h-screen bg-gray-100 w-screen">
      <Sidebar className="w-64">
        <SidebarHeader className="px-4 py-3 border-b">
          <h1 className="text-xl font-bold mt-2 mb-2">Bookworm Library</h1>
        </SidebarHeader>
        <SidebarContent className="py-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start px-4 py-2" onClick={() => navigate('/customer')}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start px-4 py-2" onClick={() => navigate('/user-catalogue')}>
                <BookOpen className="mr-2 h-4 w-4" />
                Catalogue
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
                {sidebarState === 'expanded' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <h1 className="text-2xl font-bold">Customer Home</h1>
            </div>
            
            <SidebarTrigger className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SidebarTrigger>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Featured Books</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
                    {featuredBooks.map((book) => (
                      <Card key={book.book_id}>
                        <CardContent className="p-4">
                          <h3 className="font-bold">{book.title}</h3>
                          <p className="text-sm text-gray-500">{book.author_name}</p>
                          <p className={`text-sm ${book.is_available ? 'text-green-600' : 'text-red-600'}`}>
                            Status: {book.is_available ? 'Available' : 'Not Available'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button onClick={() => navigate('/user-catalogue')} className="w-full sm:w-auto">
                    View More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar mode="single" className="rounded-md border flex justify-center items-center" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Reservations</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingReservations.map((reservation) => (
                    <div key={reservation.id} className="mb-2">
                      <p className="font-semibold">{reservation.book_title}</p>
                      <p className="text-sm text-gray-500">
                        Date: {reservation.reservation_date}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function CustomerHomePage() {
  return (
    <SidebarProvider>
      <CustomerHomePageContent />
    </SidebarProvider>
  )
}