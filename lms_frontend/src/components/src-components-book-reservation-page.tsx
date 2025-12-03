'use client'

import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/config/api'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { format, startOfDay } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { BookOpen, Home, Menu, ChevronRight, Users, ChevronLeft } from 'lucide-react'
import * as z from "zod"

// Validation schema for reservation
const reservationSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  reservationDate: z.date({ required_error: "Please select a date" }).refine(
    (date) => startOfDay(date) >= startOfDay(new Date()),
    { message: "Reservation date cannot be in the past" }
  ),
});

interface ReservationFieldErrors {
  email?: string;
  reservationDate?: string;
}

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
  description?: string;
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

type ErrorResponseData = { error?: string };

const getAxiosErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ErrorResponseData | undefined;
    return data?.error ?? error.message ?? fallback;
  }
  return fallback;
}

function BookReservationPageContent() {
  const navigate = useNavigate()
  const { bookId } = useParams<{ bookId: string }>();
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [email, setEmail] = useState('')
  const [reservationDate, setReservationDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCopyId, setSelectedCopyId] = useState<number | null>(null)
  const [reservationFieldErrors, setReservationFieldErrors] = useState<ReservationFieldErrors>({})
  const { toggleSidebar, state: sidebarState } = useSidebar()
  const { toast } = useToast()

  const validateReservation = (): boolean => {
    const errors: ReservationFieldErrors = {};

    try {
      reservationSchema.parse({ email, reservationDate });
      setReservationFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.errors.forEach((error) => {
          const field = error.path[0] as keyof ReservationFieldErrors;
          errors[field] = error.message;
        });
      }
      setReservationFieldErrors(errors);
      return false;
    }
  };

  const clearReservationErrors = () => {
    setReservationFieldErrors({});
  };

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get<BookDetails>(`${API_BASE_URL}/api/books/${bookId}/`);
        setBookDetails(response.data);
        setCopies(response.data.copies);
      } catch (error) {
        console.error('Error fetching book details:', error);
        toast({
          title: "Error",
          description: "Failed to fetch book details. Please try again.",
          variant: "destructive",
        });
      }
    };

    const fetchReservations = async () => {
      try {
        const response = await axios.get<Reservation[]>(`${API_BASE_URL}/api/reservations/?book_id=${bookId}&returned=false`);
        setReservations(response.data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        toast({
          title: "Error",
          description: "Failed to fetch reservations. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchBookDetails();
    fetchReservations();
  }, [bookId, toast]);

  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   console.log('Searching for:', searchQuery)
  // }

  const handleReserve = (copyId: number) => {
    setSelectedCopyId(copyId);
    clearReservationErrors();
    setIsDialogOpen(true);
  };
  //reservations/<int:reservation_id>/extend/'
  const handleExtendDeadline = async (reservation_id: number) => {
    try {
      // Make the PUT request to extend the deadline
      const response = await axios.put(
        `${API_BASE_URL}/api/reservations/${reservation_id}/extend/`
      );
  
      if (response.status === 200) {
        toast({
          title: "Reservation Extended",
          description: `Reservation ${reservation_id} has been extended successfully.`,
          variant: "default",
        });
  
        // Update the state if necessary (e.g., update the reservations list)
        setReservations(prevReservations =>
          prevReservations.map(reservation =>
            reservation.reservation_id === reservation_id
              ? { ...reservation, due_date: response.data.due_date }
              : reservation
          )
        );
      }
    } catch (error) {
      console.error("Error extending reservation deadline:", error);
  
      // Show an error message
      toast({
        title: "Action Failed",
        description: getAxiosErrorMessage(error, "There was an error extending the reservation deadline. Please try again."),
        variant: "destructive",
      });
    }
  };
  
  const handleConfirmReservation = async () => {
    if (!selectedCopyId || !bookDetails) return;

    if (!validateReservation()) {
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/reservations/`, {
        email: email,
        book_id: bookDetails.book_id,
        copy_id: selectedCopyId,
        start_date: format(reservationDate!, 'yyyy-MM-dd'),
      });

      if (response.status === 201) {
        toast({
          title: "Reservation Confirmed",
          description: `Book reserved for ${email} starting from ${format(reservationDate!, 'MMMM d, yyyy')}`,
        });
        setIsDialogOpen(false);

        setCopies(prevCopies =>
          prevCopies.map(copy =>
            copy.copy_id === selectedCopyId ? { ...copy, is_available: false } : copy
          )
        );
        setReservations(prevReservations => [...prevReservations, response.data]);

        setEmail('');
        setReservationDate(new Date());
      }
    } catch (error) {
      console.error('Error making reservation:', error);
      toast({
        title: "Reservation Failed",
        description: getAxiosErrorMessage(error, "There was an error making the reservation. Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleCopyStatus = async (bookId: number, copyId: number) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/books/${bookId}/copies/${copyId}/`, {
        is_available: true
      });

      if (response.status === 200) {
        toast({
          title: "Copy Status Updated",
          description: `Copy ${copyId} has been marked as returned.`,
          variant: "default",
        });

        setCopies(prevCopies =>
          prevCopies.map(copy =>
            copy.copy_id === copyId ? { ...copy, is_available: true } : copy
          )
        );

        setReservations(prevReservations =>
          prevReservations.filter(reservation => reservation.copy !== copyId)
        );
      }
    } catch (error) {
      console.error("Error updating copy status:", error);
      toast({
        title: "Action Failed",
        description: getAxiosErrorMessage(error, "There was an error updating the copy status. Please try again."),
        variant: "destructive",
      });
    }
  };

  if (!bookDetails) {
    return <div className="flex items-center justify-center h-screen"><p className="text-xl">Loading book details...</p></div>;
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
              <SidebarMenuButton className="w-full justify-start px-4 py-2" onClick={() => navigate('/catalogue')}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start px-4 py-2" onClick={() => navigate('/users')}>
                <Users className="mr-2 h-4 w-4" />
                Users
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarState === 'expanded' ? 'md:ml-0' : 'md:ml-4'}`}>
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

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                
              </CardContent>
            </Card>
            <Card className="mb-6 ">
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
          <Card className="w-full">
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
                    <TableHead>Deadline Extension</TableHead>
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
                            onClick={() => handleCopyStatus(bookDetails.book_id, reservation.copy)}
                          >
                            Mark as Returned
                          </Button>
                          </TableCell>
                        <TableCell>
                          <Button
                            variant="default"
                            onClick={() => handleExtendDeadline(reservation.reservation_id)}
                          >
                            Extend Deadline
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500">
                        No current reservations found.
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
            <div className="space-y-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setReservationFieldErrors(prev => ({ ...prev, email: undefined })); }}
                  className={`col-span-3 ${reservationFieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>
              {reservationFieldErrors.email && (
                <p className="text-red-500 text-sm text-right">{reservationFieldErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Date <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                  <Calendar
                    mode="single"
                    selected={reservationDate}
                    onSelect={(date) => { setReservationDate(date); setReservationFieldErrors(prev => ({ ...prev, reservationDate: undefined })); }}
                    className={`rounded-md border ${reservationFieldErrors.reservationDate ? "border-red-500" : ""}`}
                    disabled={(date) => startOfDay(date) < startOfDay(new Date())}
                  />
                </div>
              </div>
              {reservationFieldErrors.reservationDate && (
                <p className="text-red-500 text-sm text-right">{reservationFieldErrors.reservationDate}</p>
              )}
            </div>
          </div>
          <DialogFooter>
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