import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { StoryCard } from '../components/StoryCard'

const mockStory = {
  storyId: 'test-story-1',
  title: 'Test Story Title',
  description: 'This is a test story description that should be displayed in the card.',
  createdDate: '2023-11-13T10:30:00Z',
  storyTypeName: 'Adventure',
  authorName: 'Test Author',
  imageUrl: 'https://example.com/test-image.jpg'
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('StoryCard', () => {
  it('renders story information correctly in grid view', () => {
    renderWithRouter(<StoryCard story={mockStory} viewMode="grid" />)
    
    expect(screen.getByText('Test Story Title')).toBeInTheDocument()
    expect(screen.getByText('This is a test story description that should be displayed in the card.')).toBeInTheDocument()
    expect(screen.getByText('Test Author')).toBeInTheDocument()
    expect(screen.getByText('Adventure')).toBeInTheDocument()
  })

  it('renders story information correctly in list view', () => {
    renderWithRouter(<StoryCard story={mockStory} viewMode="list" />)
    
    expect(screen.getByText('Test Story Title')).toBeInTheDocument()
    expect(screen.getByText('This is a test story description that should be displayed in the card.')).toBeInTheDocument()
    expect(screen.getByText('Test Author')).toBeInTheDocument()
    expect(screen.getByText('Adventure')).toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', () => {
    const storyWithoutOptionalFields = {
      storyId: 'test-story-2',
      title: 'Minimal Story',
      createdDate: '2023-11-13T10:30:00Z'
    }
    
    renderWithRouter(<StoryCard story={storyWithoutOptionalFields as any} viewMode="grid" />)
    
    expect(screen.getByText('Minimal Story')).toBeInTheDocument()
    expect(screen.getByText('Anonymous')).toBeInTheDocument()
    expect(screen.getByText('A captivating story waiting to be discovered...')).toBeInTheDocument()
  })

  it('creates correct link to story details page', () => {
    renderWithRouter(<StoryCard story={mockStory} viewMode="grid" />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/story/test-story-1')
  })

  it('displays stats when showStats is true', () => {
    renderWithRouter(<StoryCard story={mockStory} viewMode="grid" showStats={true} />)
    
    // Should show view and like icons (stats are generated randomly but icons should be present)
    const eyeIcons = screen.getAllByRole('img', { hidden: true })
    expect(eyeIcons.length).toBeGreaterThan(0)
  })

  it('hides stats when showStats is false', () => {
    renderWithRouter(<StoryCard story={mockStory} viewMode="grid" showStats={false} />)
    
    // Should not show stats
    expect(screen.queryByTestId('story-stats')).not.toBeInTheDocument()
  })
})