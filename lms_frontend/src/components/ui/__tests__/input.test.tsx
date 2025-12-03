import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />)

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('handles text input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Enter text" />)

    const input = screen.getByPlaceholderText('Enter text')
    await user.type(input, 'Hello World')

    expect(input).toHaveValue('Hello World')
  })

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password')

    rerender(<Input type="number" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'number')
  })

  it('can be disabled', async () => {
    const user = userEvent.setup()
    render(<Input disabled placeholder="Disabled input" />)

    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()

    await user.type(input, 'test')
    expect(input).toHaveValue('')
  })

  it('handles onChange events', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Input onChange={handleChange} placeholder="Enter text" />)

    await user.type(screen.getByPlaceholderText('Enter text'), 'a')
    expect(handleChange).toHaveBeenCalled()
  })

  it('supports required attribute', () => {
    render(<Input required placeholder="Required input" />)

    expect(screen.getByPlaceholderText('Required input')).toBeRequired()
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" data-testid="input" />)

    expect(screen.getByTestId('input')).toHaveClass('custom-class')
  })

  it('supports value prop for controlled input', () => {
    render(<Input value="controlled value" readOnly data-testid="input" />)

    expect(screen.getByTestId('input')).toHaveValue('controlled value')
  })
})
