'use client'

import {useNavigate} from 'react-router-dom'
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Home, BookOpen, CalendarIcon, Users,  Menu, ChevronLeft, ChevronRight } from 'lucide-react';

import { Badge } from "@/components/ui/badge";

interface Reservation {
  reservation_id: number;
  book: number;
  copy: number;
  user_email: string;
  book_title: string;
  start_date: string;
  due_date: string;
  returned: boolean;
}

function ReservationsContent() {
  const { toggleSidebar, state: sidebarState } = useSidebar();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reservationsPerPage = 15;
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<Reservation[]>("http://127.0.0.1:8000/api/reservations/");
      setReservations(response.data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setError("Failed to fetch reservations. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatus = (reservation: Reservation): { status: string; color: string } => {
    const currentDate = new Date();
    const dueDate = new Date(reservation.due_date);

    if (reservation.returned) {
      return { status: "Returned", color: "bg-green-500" };
    } else if (currentDate > dueDate) {
      return { status: "Overdue", color: "bg-red-500" };
    } else {
      return { status: "Unavailable", color: "bg-yellow-500" };
    }
  };

  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = reservations.slice(indexOfFirstReservation, indexOfLastReservation);
  const totalPages = Math.ceil(reservations.length / reservationsPerPage);

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
        <SidebarFooter className="border-t mt-auto">
          <SidebarMenu>
            
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
              <h1 className="text-2xl font-bold">Reservations</h1>
            </div>
            <SidebarTrigger className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SidebarTrigger>
          </div>
        </header>

        <main className="flex-1 overflow-x-auto overflow-y-auto bg-white p-6">
          {isLoading && <p>Loading reservations...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Book Title</TableHead>
                    <TableHead>Copy</TableHead>
                    <TableHead>User Email</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentReservations.map((reservation) => {
                    const { status, color } = getStatus(reservation);
                    return (
                      <TableRow key={reservation.reservation_id}>
                        <TableCell>{reservation.reservation_id}</TableCell>
                        <TableCell>{reservation.book_title}</TableCell>
                        <TableCell>{reservation.copy}</TableCell>
                        <TableCell>{reservation.user_email}</TableCell>
                        <TableCell>{reservation.start_date}</TableCell>
                        <TableCell>{reservation.due_date}</TableCell>
                        <TableCell>
                          <Badge className={`${color} text-white`}>
                            {status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
  );
}

export default function ReservationsPage() {
  return (
    <SidebarProvider>
      <ReservationsContent />
    </SidebarProvider>
  );
}