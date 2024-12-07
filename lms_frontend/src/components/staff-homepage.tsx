'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { BookOpen, Users, CalendarIcon, BarChart, Home, Settings, HelpCircle, Menu, Search, ChevronLeft, ChevronRight } from 'lucide-react'

// Mock data for due book reservations
const dueReservations = [
  { id: 1, title: "To Kill a Mockingbird", user: "John Doe", dueTime: "14:00" },
  { id: 2, title: "1984", user: "Jane Smith", dueTime: "15:30" },
  { id: 3, title: "Pride and Prejudice", user: "Alice Johnson", dueTime: "16:45" },
  { id: 4, title: "The Great Gatsby", user: "Bob Wilson", dueTime: "17:15" },
]

function StaffHomePageContent() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const { toggleSidebar, state: sidebarState } = useSidebar()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
    // Implement your search logic here
  }

  return (
    <div className="flex h-screen bg-background w-screen">
      <Sidebar className="w-64 flex-shrink-0 transition-all duration-300">
        <SidebarHeader className="px-4 py-5 border-b">
          <h1 className="text-xl font-bold">Bookworm Staff</h1>
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
                <Users className="mr-2 h-4 w-4" />
                Users
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
                <BarChart className="mr-2 h-4 w-4" />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start px-4 py-2">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
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
        <header className="bg-card shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
                {sidebarState === 'expanded' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <h1 className="text-2xl font-bold">Staff Dashboard</h1>
            </div>
            <form onSubmit={handleSearch} className="flex-1 flex items-center justify-end max-w-md ml-4">
              <Input
                type="search"
                placeholder="Search books or users..."
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Today's Due Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Due Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dueReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>{reservation.title}</TableCell>
                        <TableCell>{reservation.user}</TableCell>
                        <TableCell>{reservation.dueTime}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-center">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Books Out</dt>
                    <dd className="mt-1 text-3xl font-semibold">142</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Overdue</dt>
                    <dd className="mt-1 text-3xl font-semibold">7</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">New Members</dt>
                    <dd className="mt-1 text-3xl font-semibold">15</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Total Members</dt>
                    <dd className="mt-1 text-3xl font-semibold">2,847</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <FeatureCard
              icon={<BookOpen className="h-8 w-8 md:h-10 md:w-10 text-primary" />}
              title="Catalog Management"
              description="Add, edit, or remove books from the library catalog."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 md:h-10 md:w-10 text-primary" />}
              title="User Management"
              description="Manage library members, their accounts, and permissions."
            />
            <FeatureCard
              icon={<BarChart className="h-8 w-8 md:h-10 md:w-10 text-primary" />}
              title="Analytics"
              description="View detailed reports and statistics on library usage."
            />
          </div>
        </main>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-center mb-4">{icon}</div>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

export default function StaffHomePage() {
  return (
    <SidebarProvider>
      <StaffHomePageContent />
    </SidebarProvider>
  )
}