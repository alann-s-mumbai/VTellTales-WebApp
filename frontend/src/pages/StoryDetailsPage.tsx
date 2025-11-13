import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  addFollowing,
  addStoryComment,
  DEFAULT_USER_ID,
  fetchFanClub,
  fetchStoryComments,
  fetchStoryDetails,
  likeStory,
  StoryComment,
  StoryData,
  unFollowing
} from '../services/api'

type Status = 'idle' | 'loading' | 'error'

export function StoryDetailsPage() {
  const { id } = useParams<{ id?: string }>()
  const [story, setStory] = useState<StoryData | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [comments, setComments] = useState<StoryComment[]>([])
  const [commentsStatus, setCommentsStatus] = useState<Status>('idle')
  const [commentsError, setCommentsError] = useState<string | null>(null)
  const [commentText, setCommentText] = useState<string>('')
  const [postingComment, setPostingComment] = useState(false)
  const [likePending, setLikePending] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followStatusState, setFollowStatusState] = useState<'idle' | 'loading' | 'processing' | 'error'>('idle')
  const [followMessage, setFollowMessage] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    async function loadStory(storyId: number) {
      setStatus('loading')
      setError(null)

      try {
        const data = await fetchStoryDetails(storyId)
        if (!cancelled) {
          setStory(data)
          setStatus('idle')
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setError((err as Error).message)
        }
      }
    }

    if (id) {
      const parsed = Number(id)
      if (!Number.isNaN(parsed)) {
        loadStory(parsed)
      } else {
        setStatus('error')
        setError('Story ID is invalid')
      }
    } else {
      setStatus('error')
      setError('No story selected')
    }

    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    setIsFollowing(false)
    setFollowMessage('')
    setFollowStatusState('idle')
  }, [story?.userid])

  useEffect(() => {
    if (!story?.userid) return

    setFollowStatusState('loading')
    setFollowMessage('')

    fetchFanClub(story.userid)
      .then((fans) => {
        setIsFollowing(fans.includes(DEFAULT_USER_ID))
        setFollowStatusState('idle')
      })
      .catch((err) => {
        setFollowStatusState('error')
        setFollowMessage((err as Error).message)
      })
  }, [story?.userid])

  const loadComments = useCallback(async () => {
    if (!story) return
    setCommentsStatus('loading')
    setCommentsError(null)
    try {
      const fetched = await fetchStoryComments(story.storyid)
      setComments(fetched)
      setCommentsStatus('idle')
    } catch (err) {
      setCommentsStatus('error')
      setCommentsError((err as Error).message)
    }
  }, [story])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!story || !commentText.trim()) return

    setPostingComment(true)
    try {
      await addStoryComment(story.storyid, commentText.trim())
      setCommentText('')
      setStory((prev) => (prev ? { ...prev, storycomment: prev.storycomment + 1 } : prev))
      await loadComments()
    } catch (err) {
      setCommentsError((err as Error).message)
    } finally {
      setPostingComment(false)
    }
  }

  const handleLike = async () => {
    if (!story || likePending) return

    setLikePending(true)
    try {
      await likeStory(story.storyid)
      setStory((prev) => (prev ? { ...prev, storylike: prev.storylike + 1 } : prev))
    } catch (err) {
      setCommentsError((err as Error).message)
    } finally {
      setLikePending(false)
    }
  }

  const handleFollow = async () => {
    if (!story) return
    setFollowStatusState('processing')
    setFollowMessage('')

    try {
      await addFollowing({ userid: DEFAULT_USER_ID, followingid: story.userid })
      setIsFollowing(true)
      setFollowMessage(`Now following ${story.followername || story.userid}`)
      setFollowStatusState('idle')
    } catch (err) {
      setFollowStatusState('error')
      setFollowMessage((err as Error).message)
    }
  }

  const handleUnfollow = async () => {
    if (!story) return
    setFollowStatusState('processing')
    setFollowMessage('')

    try {
      await unFollowing({ userid: DEFAULT_USER_ID, followingid: story.userid })
      setIsFollowing(false)
      setFollowMessage(`Unfollowed ${story.followername || story.userid}`)
      setFollowStatusState('idle')
    } catch (err) {
      setFollowStatusState('error')
      setFollowMessage((err as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <header>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-2">Story Details</p>
          <h1 className="text-4xl font-bold text-gray-900">Explore the story state</h1>
        </header>

        {status === 'loading' && (
          <div className="rounded-2xl border border-dashed border-primary-yellow bg-white/80 p-8 text-center text-gray-600">
            Loading story details…
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-semibold">Unable to load story</p>
            <small>{error}</small>
          </div>
        )}

        {story && (
          <>
            <article className="rounded-[32px] bg-white shadow-xl overflow-hidden">
              {story.storyimg && (
                <img
                  src={story.storyimg}
                  alt={story.storytitle}
                  className="w-full h-80 object-cover"
                />
              )}
              <div className="space-y-4 p-8">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Story #{story.storyid}</span>
                  <span>{new Date(story.createdate).toLocaleDateString()}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{story.storytitle}</h2>
                <p className="text-gray-600 leading-relaxed">{story.storydesc ?? 'No description provided.'}</p>
                <dl className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <dt>Views</dt>
                    <dd className="text-lg font-semibold text-gray-900">{story.storyview.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt>Likes</dt>
                    <dd className="text-lg font-semibold text-gray-900">{story.storylike}</dd>
                  </div>
                  <div>
                    <dt>Comments</dt>
                    <dd className="text-lg font-semibold text-gray-900">{story.storycomment}</dd>
                  </div>
                  <div>
                    <dt>Pages</dt>
                    <dd className="text-lg font-semibold text-gray-900">{story.storypages}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleLike}
                    disabled={likePending}
                    className="inline-flex items-center gap-2 rounded-2xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {likePending ? 'Liking…' : '♥ Like story'}
                  </button>
                <button
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  disabled={followStatusState === 'processing' || followStatusState === 'loading'}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                    isFollowing
                      ? 'border-red-500 text-red-600 hover:bg-red-50'
                      : 'border-primary-blue text-primary-blue hover:bg-primary-blue/10'
                  }`}
                >
                  {followStatusState === 'processing' || followStatusState === 'loading'
                    ? 'Updating…'
                    : isFollowing
                    ? 'Unfollow author'
                    : 'Follow author'}
                </button>
                  <span className="text-sm text-gray-500">Live likes: {story.storylike}</span>
                  <span className="text-sm text-gray-500">{comments.length} comments loaded</span>
                </div>
                {followMessage && (
                  <p
                    className={`mt-2 text-sm ${
                      followStatusState === 'error' ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {followMessage}
                  </p>
                )}
              </div>
            </article>

            <section className="space-y-6 rounded-[28px] bg-white/50 p-6 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Community</p>
                  <h2 className="text-2xl font-semibold text-gray-900">Comments</h2>
                </div>
                <span className="text-xs font-semibold text-gray-500">{comments.length} total</span>
              </div>

              {commentsStatus === 'loading' && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white/90 p-6 text-center text-gray-600">
                  Loading comments…
                </div>
              )}

              {commentsStatus === 'error' && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
                  <p className="font-semibold">Could not load comments</p>
                  <small>{commentsError}</small>
                </div>
              )}

              {commentsStatus !== 'loading' && comments.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 p-6 text-center text-gray-500">
                  No comments yet — be the first to leave one!
                </div>
              )}

              <div className="space-y-4">
                {comments.map((comment) => (
                  <article
                    key={`${comment.storyid}-${comment.userid}-${comment.comdate}`}
                    className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-gray-400">
                      <span>{comment.uname}</span>
                      <span>{new Date(comment.comdate).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{comment.storycomment}</p>
                  </article>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <label className="text-sm font-semibold text-gray-700">Add your comment</label>
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  rows={3}
                  placeholder="Share what you liked about the story…"
                />
                <div className="flex items-center justify-between">
                  <small className="text-xs text-gray-500">Comments are sent to the backend immediately</small>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-blue to-accent-purple px-4 py-2 text-sm font-semibold text-white transition hover:from-primary-blue/90 hover:to-accent-purple/90 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={postingComment || !commentText.trim()}
                  >
                    {postingComment ? 'Posting…' : 'Post comment'}
                  </button>
                </div>
                {commentsError && (
                  <p className="text-xs text-red-500">Error: {commentsError}</p>
                )}
              </form>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
