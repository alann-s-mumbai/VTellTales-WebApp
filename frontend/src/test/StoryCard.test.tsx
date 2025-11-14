import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { StoryCard } from '../components/StoryCard'
import { type StoryData } from '../services/api'

const mockStory: StoryData = {
  userid: 'author-1',
  storyid: 101,
  storytitle: 'Test Story Title',
  storydesc: 'This is a test story description that should be displayed in the card.',
  spages: 12,
  storylike: 24,
  storyview: 120,
  storycomment: 5,
  storyimg: 'https://example.com/test-image.jpg',
  storystatus: 1,
  storypages: 12,
  storytype: 'Adventure',
  storytypeid: 1,
  createdate: '2023-11-13T10:30:00Z',
  followerid: 'author-1',
  followername: 'Test Author',
  followingid: undefined,
  followingname: undefined,
  islike: false
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
    const storyWithoutOptionalFields: StoryData = {
      userid: 'author-2',
      storyid: 202,
      storytitle: 'Minimal Story',
      spages: 1,
      storylike: 0,
      storyview: 0,
      storycomment: 0,
      storystatus: 0,
      storypages: 1,
      storytypeid: 0,
      createdate: '2023-11-13T10:30:00Z',
      followerid: 'author-2',
      followername: '',
      followingid: undefined,
      followingname: undefined,
      islike: false
    }
    
    renderWithRouter(<StoryCard story={storyWithoutOptionalFields} viewMode="grid" />)
    
    expect(screen.getByText('Minimal Story')).toBeInTheDocument()
    expect(screen.getByText('author-2')).toBeInTheDocument()
    expect(screen.getByText('A captivating story waiting to be discovered...')).toBeInTheDocument()
  })

  it('creates correct link to story details page', () => {
    renderWithRouter(<StoryCard story={mockStory} viewMode="grid" />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/story/101')
  })

  it('displays stats when showStats is true', () => {
    renderWithRouter(<StoryCard story={mockStory} viewMode="grid" showStats={true} />)
    
    const stats = screen.getAllByTestId('story-stats')
    expect(stats.length).toBeGreaterThan(0)
    expect(screen.getAllByText('120')[0]).toBeInTheDocument()
    expect(screen.getAllByText('24')[0]).toBeInTheDocument()
  })

  it('hides stats when showStats is false', () => {
    renderWithRouter(<StoryCard story={mockStory} viewMode="grid" showStats={false} />)
    
    // Should not show stats
    expect(screen.queryByTestId('story-stats')).not.toBeInTheDocument()
  })
})
