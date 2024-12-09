'use client'
import { useNavigate } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
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
  
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { BookOpen, CalendarIcon, Home, Menu,  ChevronRight, Users, ChevronLeft } from 'lucide-react'

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

interface Reservation {
  reservation_id: number;
  user: number;
  book: number;
  copy: number;
  user_email: string;
  book_title: string;
  start_date: string;
  due_date: string;
  returned: boolean;
}

function BookReservationPageContent() {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [email, setEmail] = useState('')
  const [reservationDate, setReservationDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCopyId, setSelectedCopyId] = useState<number | null>(null)
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

  useEffect(() => {
    const fetchReservations = async () => {
      if (!bookId) return;

      try {
        const response = await axios.get<Reservation[]>(`http://127.0.0.1:8000/api/reservations/`, {
          params: {
            book_id: bookId,
            returned: false,
          },
        });
        setReservations(response.data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        toast({
          title: "Error",
          description: "Failed to fetch reservations. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchReservations();
  }, [bookId, toast]);

  

  const handleReserve = (copyId: number) => {
    setSelectedCopyId(copyId);
    setIsDialogOpen(true);
  };

  const handleConfirmReservation = async () => {
    if (!bookId || !selectedCopyId || !email || !reservationDate) {
      toast({
        title: "Reservation Failed",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const startDate = format(reservationDate, 'yyyy-MM-dd');

      const data = {
        email: email,
        book_id: parseInt(bookId),
        copy_id: selectedCopyId,
        start_date: startDate,
      };

      const response = await axios.post('http://127.0.0.1:8000/api/reservations/', data);

      if (response.status === 201) {
        toast({
          title: "Reservation Confirmed",
          description: `Book reserved for ${email} starting from ${startDate}`,
        });
        setIsDialogOpen(false);

        // Update the copies and reservations state
        setCopies(prevCopies =>
          prevCopies.map(copy =>
            copy.copy_id === selectedCopyId ? { ...copy, is_available: false } : copy
          )
        );
        setReservations(prevReservations => [...prevReservations, response.data]);
      }
    } catch (error) {
      console.error('Error making reservation:', error);
      toast({
        title: "Reservation Failed",
        description: "There was an error making the reservation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExtendDeadline = async (reservationId: number) => {
    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/reservations/${reservationId}/extend/`);

      if (response.status === 200) {
        setReservations((prevReservations) =>
          prevReservations.map((reservation) =>
            reservation.reservation_id === reservationId
              ? { ...reservation, due_date: response.data.due_date }
              : reservation
          )
        );

        toast({
          title: "Due date extended",
          description: `Reservation ${reservationId} has been extended to ${response.data.due_date}.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error extending deadline:', error);
      toast({
        title: "Action Failed",
        description: "There was an error extending the deadline. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyStatus = async (bookId: number, copyId: number) => {
    // Convert copyId (which is actually copy_id) to copyNumber
    const copyIndex = copies.findIndex((c) => c.copy_id === copyId);
    if (copyIndex === -1) {
      toast({
        title: "Action Failed",
        description: "Copy not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      const copyNumber = copyIndex + 1;
      const response = await axios.put(`http://127.0.0.1:8000/api/books/${bookId}/copies/${copyNumber}/`);

      if (response.status === 200) {
        // Update the copy status in the state
        setCopies((prevCopies) =>
          prevCopies.map((copy) =>
            copy.copy_id === response.data.copy_id
              ? { ...copy, is_available: response.data.is_available }
              : copy
          )
        );

        // If a reservation was updated, adjust the reservations state as well
        if (response.data.reservation_returned !== null) {
          setReservations((prevReservations) =>
            prevReservations.filter(
              (reservation) => reservation.copy !== response.data.copy_id
            )
          );
        }

        // Show a success toast
        toast({
          title: "Copy status updated",
          description: `Copy ${response.data.copy_id} is now ${
            response.data.is_available ? "available" : "unavailable"
          }.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error updating copy status:", error);
      toast({
        title: "Action Failed",
        description: "There was an error updating the copy status. Please try again.",
        variant: "destructive",
      });
    }
  };


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
              <SidebarMenuButton className="w-full justify-start px-4 py-2" onClick={() => navigate('/staff')}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start px-4 py-2" onClick={() => navigate('/catalogue')}>
                <BookOpen className="mr-2 h-4 w-4" />
                Catalog
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start px-4 py-2" onClick={() => navigate('/users')}>
                <Users className="mr-2 h-4 w-4" />
                Users
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start px-4 py-2" onClick={() => navigate('/reservations')}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Reservations
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
       
        </SidebarContent>
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
            
            <SidebarTrigger className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SidebarTrigger>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 mt-8">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary">{bookDetails.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <p className="text-lg font-semibold text-gray-700">by {bookDetails.author_name}</p>
                    <p className="text-sm text-gray-600">ISBN: {bookDetails.isbn}</p>
                    <p className="text-sm text-gray-600">Genre: {bookDetails.genre_name}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    
                  </div>
                </CardContent>
              </Card>
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
                          <Button
                            onClick={() => copy.is_available ? handleReserve(copy.copy_id) : null}
                            variant={copy.is_available ? "default" : "outline"}
                            className="w-full"
                          >
                            {copy.is_available ? "Reserve" : "Reserved"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Copy ID</TableHead>
                    <TableHead>User Email</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.length > 0 ? (
                    reservations.map((reservation) => (
                      <TableRow key={reservation.reservation_id}>
                        <TableCell>{reservation.copy}</TableCell>
                        <TableCell>{reservation.user_email}</TableCell>
                        <TableCell>{reservation.due_date}</TableCell>
                        <TableCell>
                          <Button
                            variant="default"
                            onClick={() => handleExtendDeadline(reservation.reservation_id)}
                          >
                            Extend Deadline
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="default"
                            onClick={() => {
                              const copyIndex = copies.findIndex((c) => c.copy_id === reservation.copy);
                              if (copyIndex === -1) {
                                toast({
                                  title: "Action Failed",
                                  description: "Copy not found.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              handleCopyStatus(reservation.book, copyIndex + 1);
                            }}
                          >
                            Returned
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No reservations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
            <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
              <Label htmlFor="email" className="self-start">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
                <Calendar
                  mode="single"
                  selected={reservationDate}
                  onSelect={setReservationDate}
                  className="rounded-md border w-full flex justify-center items-center"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleConfirmReservation}>Confirm Reservation</Button>
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
