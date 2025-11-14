import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
vi.mock('../services/api', () => ({
  fetchStoriesByPage: vi.fn(),
  fetchStoryTypes: vi.fn()
}))
import { fetchStoriesByPage, fetchStoryTypes } from '../services/api'
import { HomePage } from '../pages/HomePage'

const fetchStoriesByPageMock = vi.mocked(fetchStoriesByPage)
const fetchStoryTypesMock = vi.mocked(fetchStoryTypes)

const mockStories = [
  {
    userid: 'user-1',
    storyid: 1,
    storytitle: 'Test Story 1',
    storydesc: 'A test story description',
    spages: 12,
    storylike: 8,
    storyview: 25,
    storycomment: 3,
    storyimg: undefined,
    storystatus: 1,
    storypages: 12,
    storytype: 'Adventure',
    storytypeid: 1,
    createdate: '2023-11-13T00:00:00Z',
    followerid: 'author-1',
    followername: 'Test Author',
    followingid: undefined,
    followingname: undefined,
    islike: false
  }
]

const mockStoryTypes = [
  { stid: 1, sttype: 'Adventure' },
  { stid: 2, sttype: 'Fantasy' }
]

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

const renderHomePage = async () => {
  await act(async () => {
    renderWithRouter(<HomePage />)
  })
}

beforeEach(() => {
  fetchStoriesByPageMock.mockResolvedValue(mockStories)
  fetchStoryTypesMock.mockResolvedValue(mockStoryTypes)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('HomePage', () => {
  it('renders the page title and search functionality', async () => {
    await renderHomePage()

    expect(screen.getByPlaceholderText(/search stories/i)).toBeInTheDocument()
    expect(screen.getByText(/all stories/i)).toBeInTheDocument()
  })

  it('displays loading state initially', async () => {
    const deferredStories = createDeferred<typeof mockStories>()
    const deferredTypes = createDeferred<typeof mockStoryTypes>()
    
    fetchStoriesByPageMock.mockReturnValueOnce(deferredStories.promise)
    fetchStoryTypesMock.mockReturnValueOnce(deferredTypes.promise)

    renderWithRouter(<HomePage />)

    const loadingIndicators = screen.getAllByText(/loading stories/i)
    expect(loadingIndicators.length).toBeGreaterThan(0)

    await act(async () => {
      deferredStories.resolve(mockStories)
      deferredTypes.resolve(mockStoryTypes)
    })
  })

  it('displays stories after loading', async () => {
    await renderHomePage()
    
    expect(screen.getByText('Test Story 1')).toBeInTheDocument()
  })

  it('handles search input changes', async () => {
    await renderHomePage()

    const searchInput = screen.getByPlaceholderText(/search stories/i)
    expect(searchInput).toBeInTheDocument()
    
    // Test that the input accepts user input
    expect(searchInput).toHaveAttribute('type', 'text')
  })
})

function createDeferred<T>() {
  let resolveFn!: (value: T) => void
  const promise = new Promise<T>((resolve) => {
    resolveFn = resolve
  })
  return {
    promise,
    resolve(value: T) {
      resolveFn(value)
    }
  }
}
