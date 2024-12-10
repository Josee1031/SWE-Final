import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from './src-contexts-user-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userRole = user.is_staff ? 'staff' : 'user'

  if (allowedRoles.includes(userRole)) {
    return <>{children}</>
  }

  return <Navigate to={user.is_staff ? "/staff-home" : "/customer-home"} replace />
}

export default ProtectedRoute