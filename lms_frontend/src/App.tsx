import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from '@/components/src-contexts-user-context'
import LoginPage from '@/components/login-page'
import CustomerHomepage from '@/components/customer-homepage'
import StaffHomepage from '@/components/staff-homepage'
import CataloguePage from './components/src-components-catalogue-page'
import BookReservationPage from '@/components/src-components-book-reservation-page'
import UsersPage from '@/components/user-page'
import ProtectedRoute from '@/components/src-components-protected-route'
import { Button } from "@/components/ui/button"
import { LogOut } from 'lucide-react'
import UserCataloguePage from './components/src-user-catalogue'

const LogoutFooter: React.FC = () => {
  const { logout } = useUser()

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 mt-6">
      <div className="container mx-auto flex justify-end">
        <Button onClick={logout} variant="outline" size="sm">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </footer>
  )
}

const AppContent: React.FC = () => {
  const { user } = useUser()

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <>
      <Routes>
        <Route
          path="/customer-home"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <CustomerHomepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-home"
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffHomepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalogue"
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <CataloguePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-catalogue"
          element={
            <ProtectedRoute allowedRoles={['user', 'staff']}>
              <UserCataloguePage />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/book-reservation/:bookId"
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <BookReservationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={[ 'staff']}>
              <UsersPage/>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={user.is_staff ? "/catalogue" : "/customer-home"} replace />} />
      </Routes>
      <LogoutFooter />
    </>
  )
}

const App: React.FC = () => {
  return (
    <Router>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Router>
  )
}

export default App