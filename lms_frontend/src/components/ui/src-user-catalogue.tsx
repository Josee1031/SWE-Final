'use client'

import { useNavigate } from 'react-router-dom'
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/sidebar";
import { Home, BookOpen, CalendarIcon, User, HelpCircle, Menu, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Book {
  book_id: number;
  title: string;
  author_name: string;
  isbn: string;
  genre_name: string;
  is_available: boolean;
}


function CatalogueContent() {
  const navigate = useNavigate();
  const { toggleSidebar, state: sidebarState } = useSidebar();
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState("title");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get<Book[]>("http://127.0.0.1:8000/api/books/");
        setBooks(response.data);
        const fetchedGenres = [...new Set(response.data.map(book => book.genre_name))];
        setGenres(fetchedGenres);
      } catch (error) {
        console.error("Error fetching books:", error);
        setError("Failed to fetch books. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
    setCurrentPage(1);
  };

  const filteredBooks = books
    .filter(
      (book) =>
        (selectedGenres.length === 0 || selectedGenres.includes(book.genre_name)) &&
        (!availableOnly || book.is_available) &&
        (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author_name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "author") return a.author_name.localeCompare(b.author_name);
      return 0;
    });

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
              <h1 className="text-2xl font-bold">Book Catalogue</h1>
            </div>
            <form onSubmit={handleSearch} className="flex-1 flex items-center justify-end max-w-md ml-4">
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
              <h2 className="font-semibold mb-2">Genres</h2>
              {genres.map((genre) => (
                <div key={genre} className="flex items-center mb-2">
                  <Checkbox
                    id={genre}
                    checked={selectedGenres.includes(genre)}
                    onCheckedChange={() => handleGenreChange(genre)}
                  />
                  <label htmlFor={genre} className="ml-2 text-sm">
                    {genre}
                  </label>
                </div>
              ))}
              <h2 className="font-semibold mb-2 mt-4">Availability</h2>
              <div className="flex items-center">
                <Checkbox
                  id="availableOnly"
                  checked={availableOnly}
                  onCheckedChange={(checked) => setAvailableOnly(checked as boolean)}
                />
                <label htmlFor="availableOnly" className="ml-2 text-sm">
                  Available only
                </label>
              </div>
            </div>
          </aside>

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Book Catalogue</h2>
              <Select 
                value={sortBy} 
                onValueChange={(value) => {
                  setSortBy(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Sort by Title</SelectItem>
                  <SelectItem value="author">Sort by Author</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading && <p>Loading books...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentBooks.map((book) => (
                    <Card key={book.book_id} className="flex flex-col">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{book.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow pt-0">
                        <p className="text-sm text-gray-600 mb-2">{book.author_name}</p>
                        <p className="text-sm mb-1">Genre: {book.genre_name}</p>
                        <p className="text-sm mb-1">ISBN: {book.isbn}</p>
                        <p
                          className={`text-sm font-semibold ${
                            book.is_available ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {book.is_available ? "Available" : "Not Available"}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <nav>
                    <ul className="flex space-x-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <li key={number}>
                          <Button
                            variant={currentPage === number ? "default" : "outline"}
                            size="sm"
                            onClick={() => paginate(number)}
                          >
                            {number}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function UserCataloguePage() {
  return (
    <SidebarProvider>
      <CatalogueContent />
    </SidebarProvider>
  );
}