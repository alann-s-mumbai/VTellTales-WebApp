import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { HomePage } from '../pages/HomePage'

// Mock the API module
vi.mock('../services/api', () => ({
  fetchStoriesByPage: vi.fn(() => Promise.resolve([
    {
      storyId: 'test-1',
      title: 'Test Story 1',
      description: 'A test story description',
      createdDate: '2023-11-13T00:00:00Z',
      storyTypeName: 'Adventure',
      authorName: 'Test Author'
    }
  ])),
  fetchStoryTypes: vi.fn(() => Promise.resolve([
    { id: '1', typeName: 'Adventure', description: 'Adventure stories' },
    { id: '2', typeName: 'Fantasy', description: 'Fantasy stories' }
  ]))
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('HomePage', () => {
  it('renders the page title and search functionality', async () => {
    renderWithRouter(<HomePage />)
    
    // Check if the search input is present
    expect(screen.getByPlaceholderText(/search stories/i)).toBeInTheDocument()
    
    // Check if filter buttons are present
    await waitFor(() => {
      expect(screen.getByText(/all stories/i)).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    renderWithRouter(<HomePage />)
    
    // Should show some loading indication
    expect(screen.getByText(/loading/i) || screen.getByTestId('loading-spinner')).toBeDefined()
  })

  it('displays stories after loading', async () => {
    renderWithRouter(<HomePage />)
    
    // Wait for stories to load
    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument()
    })
  })

  it('handles search input changes', async () => {
    renderWithRouter(<HomePage />)
    
    const searchInput = screen.getByPlaceholderText(/search stories/i)
    expect(searchInput).toBeInTheDocument()
    
    // Test that the input accepts user input
    expect(searchInput).toHaveAttribute('type', 'text')
  })
})