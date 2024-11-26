'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { BookOpen, CalendarIcon, Home, HelpCircle, Menu, Search, ChevronRight, User, ChevronLeft } from 'lucide-react'

const featuredBooks = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925, genre: "Classic", available: true },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", year: 1960, genre: "Fiction", available: false },
  { id: 3, title: "1984", author: "George Orwell", year: 1949, genre: "Science Fiction", available: true },
  { id: 4, title: "Pride and Prejudice", author: "Jane Austen", year: 1813, genre: "Romance", available: true },
  { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger", year: 1951, genre: "Fiction", available: false },
  { id: 6, title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", year: 1967, genre: "Magical Realism", available: true },
]

const pendingReservations = [
  { id: 1, book: "Dune", dueDate: "2024-12-01" },
  { id: 2, book: "The Hobbit", dueDate: "2024-12-05" },
  { id: 3, book: "Neuromancer", dueDate: "2024-12-10" },
]

function CustomerHomePageContent() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [searchQuery, setSearchQuery] = React.useState('')
  const { toggleSidebar, state: sidebarState } = useSidebar()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
    // Implement your search logic here
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar className="w-64">
        <SidebarHeader className="px-4 py-3 border-b">
          <h1 className="text-xl font-bold mt-2 mb-2">Bookworm</h1>
        </SidebarHeader>
        <SidebarContent className="py-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start px-4 py-2">
                <Home className="mr-2 h-4 w-4" />
                Home
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start px-4 py-2">
                <BookOpen className="mr-2 h-4 w-4" />
                Catalog
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start px-4 py-2">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Reservations
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start px-4 py-2">
                <User className="mr-2 h-4 w-4" />
                Profile
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start px-4 py-2">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
                {sidebarState === 'expanded' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <h1 className="text-2xl font-bold">Home</h1>
            </div>
            <form onSubmit={handleSearch} className="flex-1 flex items-center max-w-md mx-4">
              <Input
                type="search"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mr-2"
              />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>
            <SidebarTrigger className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SidebarTrigger>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-6 py-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Welcome to Your Library</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Featured Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredBooks.map((book) => (
                    <Card key={book.id} className="flex flex-col">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{book.title}</CardTitle>
                        <CardDescription>{book.author}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow pt-0">
                        <p className="text-sm mb-1">Year: {book.year}</p>
                        <p className="text-sm mb-1">Genre: {book.genre}</p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Badge 
                          variant={book.available ? "default" : "secondary"}
                          className="w-full justify-center"
                        >
                          {book.available ? 'Available' : 'Not Available'}
                        </Badge>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" className="w-full sm:w-auto">
                  View More <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Upcoming events and due dates</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
              <CardHeader className="pt-6">
                <CardTitle>Pending Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>{reservation.book}</TableCell>
                        <TableCell>{reservation.dueDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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