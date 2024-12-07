'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

interface BookCopy {
  copy_id: number;
  is_available: boolean;
}

interface BookDetails {
  book_id: number;
  title: string;
  author_name: string;
  isbn: string;
  genre_name: string;
  is_available: boolean;
  copies: BookCopy[];
}

interface WaitlistEntry {
  id: number;
  email: string;
}

function BookReservationPageContent() {
  const { bookId } = useParams<{ bookId: string }>();
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([
    { id: 1, email: 'user1@example.com' },
    { id: 2, email: 'user2@example.com' },
    { id: 3, email: 'user3@example.com' },
  ]);
  const [email, setEmail] = useState('')
  const [reservationDate, setReservationDate] = useState<Date | undefined>(new Date())
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [selectedCopyId, setSelectedCopyId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null);
  const { toggleSidebar, state: sidebarState } = useSidebar()
  const { toast } = useToast()

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId) {
        console.error('No bookId provided');
        return;
      }

      try {
        console.log(`Fetching book details for bookId: ${bookId}`);
        const response = await axios.get<BookDetails>(`http://127.0.0.1:8000/api/books/${bookId}/`);
        console.log('Received book details:', response.data);
        setBookDetails(response.data);
        setCopies(response.data.copies);
      } catch (error) {
        console.error('Error fetching book details:', error);
        setError(`Failed to fetch book details: ${error}`);
        toast({
          title: "Error",
          description: "Failed to fetch book details. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchBookDetails();
  }, [bookId, toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
    // Implement your search logic here
  }

  const handleReserve = async (copyId: number) => {
    setSelectedCopyId(copyId);
    setIsDialogOpen(true);
  };

  const handleConfirmReservation = async () => {
    if (!bookId || !selectedCopyId) return;

    try {
      await axios.post('/api/reservations', {
        email,
        book_id: parseInt(bookId),
        copy_id: selectedCopyId,
        reservation_date: format(reservationDate!, 'yyyy-MM-dd'),
      });
      setCopies(copies.map(copy => 
        copy.copy_id === selectedCopyId ? { ...copy, is_available: false } : copy
      ));
      toast({
        title: "Reservation Confirmed",
        description: `Book reserved for ${email} on ${format(reservationDate!, 'MMMM d, yyyy')}`,
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error making reservation:', error)
      toast({
        title: "Reservation Failed",
        description: "There was an error making the reservation. Please try again.",
        variant: "destructive",
      })
    }
  };

  const handleMarkAvailable = async (copyId: number) => {
    setSelectedCopyId(copyId);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmAvailable = async () => {
    if (!bookId || !selectedCopyId) return;

    try {
      await axios.put(`/api/books/${bookId}/copies/${selectedCopyId}/mark-available`);
      setCopies(copies.map(copy => 
        copy.copy_id === selectedCopyId ? { ...copy, is_available: true } : copy
      ));
      toast({
        title: "Copy Marked as Available",
        description: `Copy ${selectedCopyId} is now available for reservation.`,
      })
      setIsConfirmDialogOpen(false)
    } catch (error) {
      console.error('Error marking copy as available:', error)
      toast({
        title: "Action Failed",
        description: "There was an error marking the copy as available. Please try again.",
        variant: "destructive",
      })
    }
  };

  const handleAddToWaitlist = () => {
    if (waitlistEmail) {
      const newEntry: WaitlistEntry = {
        id: waitlist.length + 1,
        email: waitlistEmail,
      };
      setWaitlist([...waitlist, newEntry]);
      setWaitlistEmail('');
      toast({
        title: "Added to Waitlist",
        description: `${waitlistEmail} has been added to the waitlist for ${bookDetails?.title}`,
      });
    }
  };

  //const handleAddToWaitlist = async () => { ... };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!bookDetails) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading book details for ID: {bookId}...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 w-screen">
      <Sidebar className="w-64 flex-shrink-0 transition-all duration-300">
        <SidebarHeader className="px-4 py-3 border-b">
          <h1 className="text-xl font-bold mt-2 mb-2">Bookworm Staff</h1>
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
                Users
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

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarState === 'expanded' ? 'md:ml-0' : 'md:ml-4'
      }`}>
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
                {sidebarState === 'expanded' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <h1 className="text-2xl font-bold">Book Reservation</h1>
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

        <main className="flex-1 overflow-auto p-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">{bookDetails.title}</h2>
          <p className="text-lg text-gray-600 mb-6">by {bookDetails.author_name}</p>
          <p className="text-md text-gray-600 mb-6">ISBN: {bookDetails.isbn}</p>
          <p className="text-md text-gray-600 mb-6">Genre: {bookDetails.genre_name}</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Book Copies</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Copy ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {copies.map((copy) => (
                      <TableRow key={copy.copy_id}>
                        <TableCell>{copy.copy_id}</TableCell>
                        <TableCell>{copy.is_available ? 'Available' : 'Reserved'}</TableCell>
                        <TableCell>
                          {copy.is_available ? (
                            <Button onClick={() => handleReserve(copy.copy_id)} >
                              Reserve
                            </Button>
                          ) : (
                            <Button onClick={() => handleMarkAvailable(copy.copy_id)} variant="outline" >
                              Mark as Available
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Waitlist</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waitlist.map((entry, index) => (
                      <TableRow key={entry.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{entry.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center space-x-2 mt-4">
                  <Input
                    type="email"
                    placeholder="Enter email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                  />
                  <Button onClick={handleAddToWaitlist}>Add</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reserve Book</DialogTitle>
            <DialogDescription>
              Enter the user's email and select a reservation date.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Reservation Date</Label>
              <div className="col-span-3">
                <Calendar
                  mode="single"
                  selected={reservationDate}
                  onSelect={setReservationDate}
                  className="rounded-md border"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmReservation}>Confirm Reservation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Availability</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this copy as available?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsConfirmDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleConfirmAvailable}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function BookReservationPage() {
  return (
    <SidebarProvider>
      <BookReservationPageContent />
    </SidebarProvider>
  )
}