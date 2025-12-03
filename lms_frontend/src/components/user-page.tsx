'use client'

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from '@/config/api';
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
  
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home,  Users,  Menu, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface UserData {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

function UsersContent() {
    const navigate = useNavigate();
  const { toggleSidebar, state: sidebarState } = useSidebar();
  const [users, setUsers] = useState<UserData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<UserData[]>(`${API_BASE_URL}/api/users/`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/users/${userId}/`);
        toast({
          title: "User Deleted",
          description: "The user has been successfully deleted.",
        });
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({
          title: "Error",
          description: "Failed to delete the user. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
                {sidebarState === 'expanded' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <h1 className="text-2xl font-bold">Users</h1>
            </div>
            <SidebarTrigger className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SidebarTrigger>
          </div>
        </header>

        <main className="flex-1 overflow-x-auto overflow-y-auto bg-white p-6">
          {isLoading && <p>Loading users...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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

export default function UsersPage() {
  return (
    <SidebarProvider>
      <UsersContent />
    </SidebarProvider>
  );
}