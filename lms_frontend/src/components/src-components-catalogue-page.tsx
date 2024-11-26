import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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
import { BookOpen, CalendarIcon, Home, HelpCircle, Menu, Search, User, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

// Mock data for books
const books = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic", year: 1925, available: true },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", year: 1960, available: false },
  { id: 3, title: "1984", author: "George Orwell", genre: "Science Fiction", year: 1949, available: true },
  { id: 4, title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", year: 1813, available: true },
  { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger", genre: "Fiction", year: 1951, available: false },
  { id: 6, title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", genre: "Magical Realism", year: 1967, available: true },
  { id: 7, title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", year: 1937, available: true },
  { id: 8, title: "The Da Vinci Code", author: "Dan Brown", genre: "Thriller", year: 2003, available: true },
  { id: 9, title: "The Hunger Games", author: "Suzanne Collins", genre: "Young Adult", year: 2008, available: false },
  { id: 10, title: "The Shining", author: "Stephen King", genre: "Horror", year: 1977, available: true },
  { id: 11, title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", year: 1988, available: true },
  { id: 12, title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", genre: "Crime", year: 2005, available: true },
]

// Mock data for genres
const genres = ["Classic", "Fiction", "Science Fiction", "Romance", "Magical Realism", "Fantasy", "Thriller", "Young Adult", "Horror", "Crime"]

function CatalogueContent() {
  const { toggleSidebar, state: sidebarState } = useSidebar()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedGenres, setSelectedGenres] = React.useState<string[]>([])
  const [availableOnly, setAvailableOnly] = React.useState(false)
  const [sortBy, setSortBy] = React.useState('title')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
    // Implement search logic here
  }

  const handleGenreChange = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  const filteredBooks = books.filter(book => 
    (selectedGenres.length === 0 || selectedGenres.includes(book.genre)) &&
    (!availableOnly || book.available) &&
    (book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     book.author.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title)
    if (sortBy === 'author') return a.author.localeCompare(b.author)
    if (sortBy === 'year') return b.year - a.year
    return 0
  })

  return (
    <div className="flex h-screen bg-gray-100 ">
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
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
                {sidebarState === 'expanded' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              
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

        <div className="flex-1 flex overflow-hidden">
          <aside className="w-48 bg-white border-r overflow-y-auto">
            <div className="p-4">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Genre</h3>
                  {genres.map(genre => (
                    <div key={genre} className="flex items-center space-x-2">
                      <Checkbox 
                        id={genre} 
                        checked={selectedGenres.includes(genre)}
                        onCheckedChange={() => handleGenreChange(genre)}
                      />
                      <label htmlFor={genre} className="text-sm">{genre}</label>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-medium mb-2">Availability</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="available" 
                      checked={availableOnly}
                      onCheckedChange={(checked) => setAvailableOnly(checked as boolean)}
                    />
                    <label htmlFor="available" className="text-sm">Available only</label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Book Catalogue</h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Sort by Title</SelectItem>
                  <SelectItem value="author">Sort by Author</SelectItem>
                  <SelectItem value="year">Sort by Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{book.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow pt-0">
                    <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                    <p className="text-sm mb-1">Genre: {book.genre}</p>
                    <p className="text-sm mb-1">Year: {book.year}</p>
                    <p className={`text-sm font-semibold ${book.available ? 'text-green-600' : 'text-red-600'}`}>
                      {book.available ? 'Available' : 'Not Available'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" disabled={!book.available}>
                      {book.available ? 'Reserve' : 'Not Available'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </main>
        </div>
      </div>
    </div>
  )
}

export default function CataloguePageComponent() {
  return (
    <SidebarProvider>
      <CatalogueContent />
    </SidebarProvider>
  )
}