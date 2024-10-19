import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

type BookRental = {
  id: string
  status: 'Rented' | 'Overdue' | 'Returned'
  bookName: string
  email: string
  dueDate: string
}

// Generate 100 sample book rentals
const generateBookRentals = (): BookRental[] => {
  const statuses: BookRental['status'][] = ['Rented', 'Overdue', 'Returned']
  const books = [
    'To Kill a Mockingbird', '1984', 'Pride and Prejudice', 'The Great Gatsby', 'Moby Dick',
    'The Catcher in the Rye', 'Jane Eyre', 'The Hobbit', 'Fahrenheit 451', 'The Lord of the Rings'
  ]

  return Array.from({ length: 100 }, (_, i) => ({
    id: (i + 1).toString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    bookName: books[Math.floor(Math.random() * books.length)],
    email: `user${i + 1}@example.com`,
    dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }))
}

const bookRentals = generateBookRentals()

export default function LibrarianDashboard() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const totalPages = Math.ceil(bookRentals.length / itemsPerPage)

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return bookRentals.slice(startIndex, endIndex)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Librarian Dashboard</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Book Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getCurrentPageData().map((rental) => (
            <TableRow key={rental.id}>
              <TableCell>
                <Badge 
                  variant={rental.status === 'Rented' ? 'default' : rental.status === 'Overdue' ? 'destructive' : 'secondary'}
                  className="px-3 py-1 w-20 justify-center"
                >
                  {rental.status}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{rental.bookName}</TableCell>
              <TableCell>{rental.email}</TableCell>
              <TableCell className="text-right">{rental.dueDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, bookRentals.length)} of {bookRentals.length} entries
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}