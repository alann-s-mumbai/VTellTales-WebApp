import React from 'react'
import { Link } from 'react-router-dom'
import { Eye, Heart, MessageCircle, Clock, User, BookOpen } from 'lucide-react'
import { StoryData } from '../services/api'

interface StoryCardProps {
  story: StoryData
  viewMode: 'grid' | 'list'
  showStats?: boolean
}

export function StoryCard({ story, viewMode, showStats = true }: StoryCardProps) {
  const views = story.storyview ?? 0
  const likes = story.storylike ?? 0
  const comments = story.storycomment ?? 0
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Recent'
    }
  }

  const getStoryTypeColor = (typeName: string) => {
    const colors: Record<string, string> = {
      'Adventure': 'bg-orange-100 text-orange-800',
      'Fantasy': 'bg-purple-100 text-purple-800',
      'Mystery': 'bg-gray-100 text-gray-800',
      'Romance': 'bg-pink-100 text-pink-800',
      'Science Fiction': 'bg-blue-100 text-blue-800',
      'Horror': 'bg-red-100 text-red-800',
      'Comedy': 'bg-yellow-100 text-yellow-800',
      'Drama': 'bg-green-100 text-green-800'
    }
    return colors[typeName] || 'bg-gray-100 text-gray-800'
  }

  if (viewMode === 'list') {
    return (
      <Link
        to={`/story/${story.storyid}`}
        className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
      >
        <div className="flex gap-6">
          {/* Story Image */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center overflow-hidden">
               {story.storyimg ? (
                 <img
                   src={story.storyimg}
                   alt={story.storytitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `<BookOpen className="h-8 w-8 text-blue-500" />`
                    }
                  }}
                />
              ) : (
                <BookOpen className="h-8 w-8 text-blue-500" />
              )}
            </div>
          </div>

          {/* Story Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
                    {story.storytitle}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                     <span>{story.followername || story.userid || 'Anonymous'}</span>
                  </div>
                </div>
                
                 {story.storytype && (
                   <span className={`px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStoryTypeColor(story.storytype)}`}>
                     {story.storytype}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm line-clamp-2 flex-1 mb-3">
                 {story.storydesc || 'A captivating story waiting to be discovered...'}
              </p>

              {/* Stats and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                     <span>{formatDate(story.createdate)}</span>
                  </div>
                  {showStats && (
                    <div
                      data-testid="story-stats"
                      className="flex items-center gap-3 text-gray-500"
                      role="group"
                      aria-label="Story engagement stats"
                    >
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        <span>{views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" aria-hidden="true" />
                        <span>{likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        <span>{comments}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Grid view
  return (
    <Link
       to={`/story/${story.storyid}`}
      className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-blue-300 hover:-translate-y-1"
    >
      {/* Story Image */}
      <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
         {story.storyimg ? (
           <img
             src={story.storyimg}
             alt={story.storytitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `
                  <div class="flex items-center justify-center h-full">
                    <svg class="h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                  </div>
                `
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="h-12 w-12 text-blue-500" />
          </div>
        )}

        {/* Category Badge */}
         {story.storytype && (
           <div className="absolute top-3 left-3">
             <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStoryTypeColor(story.storytype)}`}>
               {story.storytype}
            </span>
          </div>
        )}

        {/* Stats Overlay */}
        {showStats && (
          <div
            data-testid="story-stats"
            className="absolute bottom-3 right-3 flex items-center gap-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-lg"
            role="group"
            aria-label="Story engagement stats"
          >
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" aria-hidden="true" />
              <span>{views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" aria-hidden="true" />
              <span>{likes}</span>
            </div>
          </div>
        )}
      </div>

      {/* Story Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
             {story.storytitle}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="h-4 w-4" />
             <span>{story.followername || story.userid || 'Anonymous'}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
           {story.storydesc || 'A captivating story waiting to be discovered...'}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
             <span>{formatDate(story.createdate)}</span>
          </div>
          {showStats && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4 text-gray-500" aria-hidden="true" />
              <span className="text-gray-700 font-medium">
                {comments}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
