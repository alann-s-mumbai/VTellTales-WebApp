import { useEffect, useState } from 'react'
import {
  fetchNotifications,
  fetchProfile,
  fetchUnreadNotificationCount,
  NotificationData,
  ProfileData,
  DEFAULT_USER_ID
} from '../services/api'

type Status = 'idle' | 'loading' | 'error'

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setStatus('loading')
      setError(null)

      try {
        const [profileData, notificationData, unread] = await Promise.all([
          fetchProfile(DEFAULT_USER_ID),
          fetchNotifications(DEFAULT_USER_ID),
          fetchUnreadNotificationCount(DEFAULT_USER_ID)
        ])

        if (!cancelled) {
          setProfile(profileData)
          setNotifications(notificationData)
          setUnreadCount(unread)
          setStatus('idle')
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setError((err as Error).message)
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Profile</p>
          <h1 className="text-4xl font-bold text-gray-900">Your storyteller dashboard</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Connected to the `.NET` story API, this view surfaces profile metadata, followers, and live notifications.
          </p>
        </header>

        {status === 'loading' && (
          <div className="rounded-2xl border border-dashed border-primary-blue bg-white/80 p-8 text-center text-gray-600">
            Loading profile & notifications…
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-semibold">Unable to load data</p>
            <small>{error}</small>
          </div>
        )}

        {profile && (
          <section className="rounded-[32px] bg-white shadow-xl overflow-hidden">
            <div className="flex flex-col gap-6 p-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-primary-yellow to-accent-orange">
                  {profile.profileimg ? (
                    <img
                      src={profile.profileimg}
                      alt={profile.name ?? 'Profile image'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl font-bold text-white">
                      {profile.name?.[0] ?? 'V'}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{profile.name || 'Storyteller'}</h2>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                  {unreadCount !== null && (
                    <span className="mt-2 inline-flex items-center rounded-full border border-primary-blue bg-primary-blue/10 px-3 py-1 text-xs font-semibold text-primary-blue">
                      Unread notifications: {unreadCount}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center text-sm text-gray-500 lg:grid-cols-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{profile.stories}</p>
                  <p>Stories</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{profile.follower}</p>
                  <p>Followers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{profile.following}</p>
                  <p>Following</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{profile.fanflag}</p>
                  <p>Fans</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 px-8 py-6">
              <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.4em] text-gray-500">
                <span>Joined:</span>
                <span>{new Date(profile.cdate).toLocaleDateString()}</span>
                <span>Last updated:</span>
                <span>{new Date(profile.udate).toLocaleDateString()}</span>
                {profile.location && <span>• {profile.location}</span>}
              </div>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Notifications</p>
              <h2 className="text-2xl font-semibold text-gray-900">Latest activity</h2>
            </div>
            <span className="text-xs font-semibold text-gray-500">{notifications.length} total</span>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white/80 p-6 text-center text-gray-500">
                No notifications yet
              </div>
            )}

            {notifications.map((notification) => (
              <article
                key={`${notification.storyid}-${notification.notificationdate ?? ''}`}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-primary-blue/40 hover:shadow-lg"
              >
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{notification.toname ?? 'Community'}</span>
                  <span>{notification.notificationdate ? new Date(notification.notificationdate).toLocaleString() : 'just now'}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">
                  {notification.notification ?? 'Story updated'}
                </h3>
                {notification.storytitle && (
                  <p className="mt-1 text-sm text-gray-600">Story: {notification.storytitle}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
