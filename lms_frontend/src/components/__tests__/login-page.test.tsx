import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../login-page'
import { UserProvider } from '../src-contexts-user-context'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <UserProvider>
        <LoginPage />
      </UserProvider>
    </BrowserRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(localStorage.clear).mockClear()
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    vi.mocked(localStorage.setItem).mockClear()
    // Default mock for UserProvider's initial fetch
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    })
  })

  describe('Rendering', () => {
    it('renders login form by default', () => {
      renderLoginPage()

      expect(screen.getByText('Welcome to Finger Down Library')).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /login/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /sign up/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('switches to signup form when Sign Up tab is clicked', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      await user.click(screen.getByRole('tab', { name: /sign up/i }))

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('requires email field', async () => {
      renderLoginPage()

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toBeRequired()
    })

    it('requires password field', async () => {
      renderLoginPage()

      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toBeRequired()
    })

    it('email input has correct type', () => {
      renderLoginPage()

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('password input has correct type', () => {
      renderLoginPage()

      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Login Submission', () => {
    it('submits login form with correct data', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access: 'test-access-token',
          refresh: 'test-refresh-token',
          user: { id: 1, email: 'test@example.com', name: 'Test User', is_staff: false }
        }),
      })

      renderLoginPage()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/sign-in/'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
          })
        )
      })
    })

    it('stores tokens in localStorage on successful login', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access: 'test-access-token',
          refresh: 'test-refresh-token',
          user: { id: 1, email: 'test@example.com', name: 'Test User', is_staff: false }
        }),
      })

      renderLoginPage()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'test-access-token')
        expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'test-refresh-token')
      })
    })

    it('navigates to customer-home for non-staff users', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access: 'test-access-token',
          refresh: 'test-refresh-token',
          user: { id: 1, email: 'test@example.com', name: 'Test User', is_staff: false }
        }),
      })

      renderLoginPage()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/customer-home')
      })
    })

    it('navigates to staff-home for staff users', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access: 'test-access-token',
          refresh: 'test-refresh-token',
          user: { id: 1, email: 'staff@example.com', name: 'Staff User', is_staff: true }
        }),
      })

      renderLoginPage()

      await user.type(screen.getByLabelText(/email/i), 'staff@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/staff-home')
      })
    })

    it('displays error message on failed login', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      })

      renderLoginPage()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /login/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
      })
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      mockFetch.mockImplementationOnce(() => new Promise(() => {})) // Never resolves

      renderLoginPage()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      expect(screen.getByRole('button', { name: /processing/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled()
    })
  })

  describe('Signup Submission', () => {
    it('submits signup form with correct data', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access: 'test-access-token',
          refresh: 'test-refresh-token',
          user: { id: 1, email: 'new@example.com', name: 'New User', is_staff: false }
        }),
      })

      renderLoginPage()

      await user.click(screen.getByRole('tab', { name: /sign up/i }))
      await user.type(screen.getByLabelText(/name/i), 'New User')
      await user.type(screen.getByLabelText(/email/i), 'new@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/sign-up/'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ name: 'New User', email: 'new@example.com', password: 'password123' }),
          })
        )
      })
    })

    it('displays error message on failed signup', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Email already exists' }),
      })

      renderLoginPage()

      await user.click(screen.getByRole('tab', { name: /sign up/i }))
      await user.type(screen.getByLabelText(/name/i), 'New User')
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid signup information/i)).toBeInTheDocument()
      })
    })
  })
})
