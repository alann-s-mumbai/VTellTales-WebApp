import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchStoriesByPage, fetchStoryTypes, StoryData, StoryType } from '../services/api'
import { Search, Grid, List, TrendingUp, Clock, Heart } from 'lucide-react'

const landingFilters = [
  { id: 'all', label: 'All Stories', icon: Grid },
  { id: 'popular', label: 'Most Popular', icon: TrendingUp },
  { id: 'recent', label: 'Recently Added', icon: Clock },
  { id: 'liked', label: 'Most Liked', icon: Heart }
]

export function HomePage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [stories, setStories] = useState<StoryData[]>([])
  const [types, setTypes] = useState<StoryType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Load story types for category filtering
        const [storyTypes, storiesData] = await Promise.all([
          fetchStoryTypes(),
          fetchStoriesByPage('', currentPage, 20)
        ])
        
        setTypes(storyTypes)
        setStories(storiesData)
        
      } catch (error) {
        console.error('Error loading stories:', error)
        setError('Unable to load stories. Please check your connection and try again.')
        setStories([])
        setTypes([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [currentPage])

  const availableCategories = useMemo(() => {
    const storyTypeNames = types.map(type => type.sttype)
    const storyCategories = [...new Set(stories.map(story => story.storytype || 'Uncategorized'))]
    const allCategories = [...new Set([...storyTypeNames, ...storyCategories])]
    return ['All Categories', ...allCategories.filter(cat => cat).sort()]
  }, [stories, types])

  const filteredStories = useMemo(() => {
    let filtered = stories
    
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      filtered = filtered.filter(story =>
        (story.storytitle || '').toLowerCase().includes(query) ||
        (story.storydesc || '').toLowerCase().includes(query) ||
        (story.followername || '').toLowerCase().includes(query)
      )
    }
    
    // Filter by category
    if (categoryFilter !== 'All Categories') {
      filtered = filtered.filter(story => (story.storytype || 'Uncategorized') === categoryFilter)
    }
    
    // Filter by landing filter (sorting)
    switch (selectedFilter) {
      case 'popular':
        filtered = [...filtered].sort((a, b) => (b.storyview || 0) - (a.storyview || 0))
        break
      case 'recent':
        filtered = [...filtered].sort((a, b) => new Date(b.createdate || '').getTime() - new Date(a.createdate || '').getTime())
        break
      case 'liked':
        filtered = [...filtered].sort((a, b) => (b.storylike || 0) - (a.storylike || 0))
        break
      default: // 'All Stories'
        break
    }
    
    return filtered
  }, [stories, categoryFilter, selectedFilter, searchQuery])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto max-w-6xl px-4 py-14 space-y-10">
        <section className="rounded-[32px] bg-white/90 p-10 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm uppercase tracking-[0.6em] text-gray-400">VTellTales Story Library</p>
            <h1 className="text-4xl font-bold text-gray-900">Educational Stories for Educators</h1>
            <p className="text-lg text-gray-600">
              Explore our complete collection of educational stories organized by category and type. {' '}
              <Link className="font-semibold text-primary-blue" to="/login">
                Log in
              </Link>{' '}
              to create your own stories and access advanced features.
            </p>
            <p className="text-sm text-gray-500">
              {isLoading ? 'Loading stories...' : error ? 'Unable to load stories' : `${stories.length} stories available`} • Filter by category and popularity
            </p>
            <div className="flex flex-wrap gap-3">
              {landingFilters.map((filter) => {
                const Icon = filter.icon
                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] transition ${
                      selectedFilter === filter.id
                        ? 'border border-primary-blue bg-primary-blue/10 text-primary-blue'
                        : 'border border-gray-200 bg-white text-gray-500 hover:border-primary-blue'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {filter.label}
                  </button>
                )
              })}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search stories"
                  className="w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-600 focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/40"
                  aria-label="Search stories"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                    viewMode === 'grid'
                      ? 'border-primary-blue bg-primary-blue text-white'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-primary-blue'
                  }`}
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid className="h-4 w-4" />
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                    viewMode === 'list'
                      ? 'border-primary-blue bg-primary-blue text-white'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-primary-blue'
                  }`}
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="h-4 w-4" />
                  List
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white/70 p-6 shadow-xl">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Story Library</p>
              <h2 className="text-2xl font-semibold text-gray-900">Available Stories</h2>
              <p className="text-sm text-gray-500 mt-1">
                {error ? 'Error loading stories' : 
                 isLoading ? 'Loading stories...' :
                 `Showing ${filteredStories.length} stories ${categoryFilter !== 'All Categories' ? `in ${categoryFilter}` : 'across all categories'}`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/40"
                disabled={isLoading || error !== null}
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {stories.length > 0 && (
                <button
                  onClick={() => {
                    setCurrentPage(1)
                    setStories([])
                    setError(null)
                    // Force reload data instead of full page refresh
                    const loadData = async () => {
                      setIsLoading(true)
                      try {
                        const [storyTypes, storiesData] = await Promise.all([
                          fetchStoryTypes(),
                          fetchStoriesByPage('', 1, 20)
                        ])
                        setTypes(storyTypes)
                        setStories(storiesData)
                      } catch (error) {
                        console.error('Error loading stories:', error)
                        setError('Unable to load stories. Please check your connection and try again.')
                      } finally {
                        setIsLoading(false)
                      }
                    }
                    loadData()
                  }}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm hover:border-primary-blue focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/40"
                  disabled={isLoading}
                >
                  Refresh
                </button>
              )}
            </div>
          </header>

          <div
            className={`mt-6 grid gap-4 ${
              viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            }`}
          >
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mt-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mt-1"></div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                <div className="text-red-400 text-4xl mb-3">⚠️</div>
                <p className="text-lg font-medium text-red-800 mb-2">Unable to load stories</p>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null)
                    setIsLoading(true)
                    const retryLoad = async () => {
                      try {
                        const [storyTypes, storiesData] = await Promise.all([
                          fetchStoryTypes(),
                          fetchStoriesByPage('', currentPage, 20)
                        ])
                        setTypes(storyTypes)
                        setStories(storiesData)
                      } catch (error) {
                        console.error('Error loading stories:', error)
                        setError('Unable to load stories. Please check your connection and try again.')
                      } finally {
                        setIsLoading(false)
                      }
                    }
                    retryLoad()
                  }}
                  className="rounded-full bg-red-100 border border-red-300 px-6 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredStories.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <div className="text-gray-400 text-4xl mb-3">📚</div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {stories.length === 0 ? 'No stories available yet' : 'No stories match your filters'}
                </p>
                <p className="text-gray-600 mb-4">
                  {stories.length === 0 
                    ? 'Be the first to create a story for educators!' 
                    : 'Try adjusting your category filter to see more stories.'}
                </p>
                <div className="flex justify-center gap-3">
                  {stories.length === 0 ? (
                    <Link
                      to="/login"
                      className="rounded-full bg-primary-blue text-white px-6 py-2 text-sm font-semibold hover:bg-primary-blue/90 transition-colors"
                    >
                      Create First Story
                    </Link>
                  ) : (
                    <button
                      onClick={() => setCategoryFilter('All Categories')}
                      className="rounded-full bg-gray-100 border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      Show All Stories
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredStories.map((story) => (
                <div
                  key={story.storyid}
                  className="rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    // Check if user is logged in
                    const isLoggedIn = authService.isAuthenticated()
                    if (isLoggedIn) {
                      // Navigate to story view - you can implement this route
                      console.log(`Opening story: ${story.storytitle}. Story viewer not yet implemented.`)
                      setError('Story viewer not yet implemented. Coming soon!')
                    } else {
                      console.log('User not logged in - redirecting to login')
                      setError('Please log in to read stories')
                    }
                  }}
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-gray-400">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">{story.storytype || 'General'}</span>
                    <span>{story.spages} pages</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-gray-900">{story.storytitle}</h3>
                  <p className="mt-2 text-sm text-gray-600">{story.storydesc || 'A wonderful educational story waiting to be explored.'}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <span className="text-red-500">❤</span>
                        {story.storylike || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-blue-500">👁</span>
                        {story.storyview || 0}
                      </span>
                    </div>
                    <span>{new Date(story.createdate || '').toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      By {story.followername || 'Anonymous'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      story.storystatus === 1 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {story.storystatus === 1 ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[28px] bg-white/60 p-8 shadow-lg border border-dashed border-gray-200 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Educator Platform</p>
          <h2 className="mt-3 text-3xl font-semibold text-gray-900">Join the VTellTales Community</h2>
          <p className="mt-3 text-gray-600">
            Create, share, and discover educational stories with educators worldwide. 
            Sign up to contribute to our growing library of educational content.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="rounded-full border border-primary-blue bg-primary-blue/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-primary-blue transition hover:border-primary-blue/80 hover:bg-primary-blue/20"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition"
            >
              Create Account
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
