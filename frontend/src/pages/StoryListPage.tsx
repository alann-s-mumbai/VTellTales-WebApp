import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEFAULT_USER_ID,
  fetchStoryTypes,
  fetchStoriesByPage,
  StoryData,
  StoryType
} from '../services/api'

type Status = 'idle' | 'loading' | 'error'
const STORIES_PER_PAGE = 6

export function StoryListPage() {
  const [stories, setStories] = useState<StoryData[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [storyTypes, setStoryTypes] = useState<StoryType[]>([])
  const [selectedType, setSelectedType] = useState<number | null>(null)

  const loadStories = useCallback(async (nextPage: number, replace = false) => {
    if (replace) {
      setStatus('loading')
    } else {
      setLoadingMore(true)
    }
    setError(null)

    try {
      const fetched = await fetchStoriesByPage(DEFAULT_USER_ID, nextPage, STORIES_PER_PAGE)
      setStories((prev) => (replace ? fetched : [...prev, ...fetched]))
      setHasMore(fetched.length === STORIES_PER_PAGE)
      setPage(nextPage)
      if (replace) {
        setStatus('idle')
      }
    } catch (err) {
      const message = (err as Error).message
      if (replace) {
        setStatus('error')
      }
      setError(message)
    } finally {
      if (!replace) {
        setLoadingMore(false)
      }
    }
  }, [])

  useEffect(() => {
    loadStories(1, true)
  }, [loadStories])

  useEffect(() => {
    let cancelled = false
    async function loadTypes() {
      try {
        const fetched = await fetchStoryTypes()
        if (!cancelled) {
          setStoryTypes(fetched)
        }
      } catch {
        // ignore story type failures
      }
    }

    loadTypes()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredStories = useMemo(() => {
    if (selectedType === null) {
      return stories
    }
    return stories.filter((story) => story.storytypeid === selectedType)
  }, [selectedType, stories])

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) {
      return
    }
    loadStories(page + 1, false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Story Collection</p>
          <h1 className="text-4xl font-bold text-gray-900">Every tale lives in the Story API</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Stories are fetched with pagination (`GetAllStoriesbypage`) so each card reflects real back-end data.
          </p>
        </header>

        <section className="space-y-3 rounded-[28px] bg-white/80 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType(null)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selectedType === null
                    ? 'border-primary-blue bg-primary-blue/10 text-primary-blue'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary-blue'
                }`}
              >
                All stories
              </button>
              {storyTypes.map((type) => (
                <button
                  key={type.stid}
                  onClick={() => setSelectedType(type.stid)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selectedType === type.stid
                      ? 'border-primary-blue bg-primary-blue/10 text-primary-blue'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-primary-blue'
                  }`}
                >
                  {type.sttype}
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.6em] text-gray-400">
              Page {page}
            </span>
          </div>

          {status === 'loading' && (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white/80 p-6 text-center text-gray-600">
              Fetching stories from `storyapi/StoryBook/GetAllStoriesbypage`…
            </p>
          )}

          {status === 'error' && (
            <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              Unable to load stories: {error}
            </p>
          )}

          {status === 'idle' && filteredStories.length === 0 && (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white/80 p-6 text-center text-gray-500">
              No stories match the selected filter yet.
            </p>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {filteredStories.map((story) => (
              <Link
                key={`${story.storyid}-${story.userid}`}
                to={`/story/${story.storyid}`}
                className="group block overflow-hidden rounded-[28px] bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="h-48 overflow-hidden rounded-[28px] border-b border-gray-100">
                  {story.storyimg ? (
                    <img
                      src={story.storyimg}
                      alt={story.storytitle}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
                      No cover image
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{story.storytype ?? 'Story'}</p>
                  <h2 className="text-xl font-semibold text-gray-900">{story.storytitle}</h2>
                  <p className="text-sm text-gray-600 line-clamp-3">{story.storydesc ?? 'No description yet.'}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{story.storyview.toLocaleString()} views</span>
                    <span>{story.storylike} likes</span>
                    <span>{story.storycomment} comments</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore || !hasMore}
              className="rounded-3xl border border-primary-blue/50 bg-white px-6 py-3 text-sm font-semibold text-primary-blue transition hover:border-primary-blue hover:bg-primary-blue/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMore ? 'Loading more stories…' : hasMore ? 'Load more stories' : 'No more stories'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
