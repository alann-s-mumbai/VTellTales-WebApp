export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'https://webapp.vtelltales.com/api'

const handleJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const payload = await response.text()
    throw new Error(payload || response.statusText)
  }

  return response.json()
}

const buildUrl = (route: string) => `${API_BASE_URL}/${route}`.replace(/([^:]\/)\/+/g, '$1')

const postFormData = async <T>(route: string, formData: FormData): Promise<T> => {
  const response = await fetch(buildUrl(route), {
    method: 'POST',
    body: formData
  })
  return handleJsonResponse<T>(response)
}

export interface StoryData {
  userid: string
  storyid: number
  storytitle: string
  storydesc?: string
  spages: number
  storylike: number
  storyview: number
  storycomment: number
  storyimg?: string
  storystatus: number
  storypages: number
  storytype?: string
  storytypeid: number
  createdate: string
  followerid: string
  followername: string
  followingid?: string
  followingname?: string
  islike: boolean
}

export interface ProfileData {
  userid: string
  email: string
  password?: string
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  profileimg?: string | null
  age?: string | null
  interest?: string | null
  location?: string | null
  cdate: string
  udate: string
  follower?: number
  following?: number
  followingcount?: string
  followercount?: string
  storycount?: string
  tokan?: string | null
  stories?: number
  fanflag?: number
  blockbyadmin?: number
  is_active?: number
}

export interface UpdateProfileData {
  userid: string
  name?: string
  firstName?: string
  lastName?: string
  age?: string
  interest?: string
  location?: string
  profileimg?: string
}

export interface NotificationData {
  userid: string
  notificationto: string
  storyid: number
  notification?: string | null
  notificationdate?: string | null
  toname?: string | null
  storytitle?: string | null
}

export interface ProfileFollowPayload {
  userid: string
  followingid: string
}

export interface StoryComment {
  storyid: string
  userid: string
  uname: string
  comdate: string
  pimg: string
  storycomment: string
}

export interface StoryType {
  stid: number
  sttype: string
}

export interface CreateStoryInput {
  userId?: string
  title: string
  description?: string
  coverFile?: File | null
  storyTypeId?: number
  storyType?: string
  pageCount: number
  status?: number
}

export interface StoryPageInput {
  storyId: number
  pageNumber: number
  content: string
  userId?: string
  pageType?: number
  format?: string
}

export interface FirebaseAuthResult {
  success: boolean
  uid?: string
  email?: string | null
  name?: string | null
  message?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: {
    id: string
    email: string
    name?: string
    firstName?: string
    lastName?: string
    username?: string
    profileImg?: string
    userType?: string
    isEmailVerified?: boolean
    isProfileComplete?: boolean
  }
  token?: string
  message?: string
  requiresEmailVerification?: boolean
}

export const DEFAULT_USER_ID = 'demo'

export const fetchFeaturedStories = async (
  userId = DEFAULT_USER_ID
): Promise<StoryData[]> => {
  const response = await fetch(buildUrl(`storyapi/StoryBook/GetTopStory/${userId}`))
  return handleJsonResponse<StoryData[]>(response)
}

export const fetchStoryDetails = async (
  storyId: number,
  userId = DEFAULT_USER_ID
): Promise<StoryData> => {
  const response = await fetch(buildUrl(`storyapi/StoryBook/story/${userId}/${storyId}`))
  return handleJsonResponse<StoryData>(response)
}

export const fetchProfile = async (
  userId = DEFAULT_USER_ID
): Promise<ProfileData> => {
  const response = await fetch(buildUrl(`storyapi/StoryBook/viewprofile/${userId}`))
  return handleJsonResponse<ProfileData>(response)
}

export const fetchNotifications = async (
  userId = DEFAULT_USER_ID
): Promise<NotificationData[]> => {
  const response = await fetch(buildUrl(`storyapi/StoryBook/getallnotifications/${userId}`))
  return handleJsonResponse<NotificationData[]>(response)
}

export const fetchUnreadNotificationCount = async (
  userId = DEFAULT_USER_ID
): Promise<number> => {
  const response = await fetch(buildUrl(`storyapi/StoryBook/unreadnotifications/${userId}`))
  return handleJsonResponse<number>(response)
}

export const updateProfile = async (profileData: UpdateProfileData): Promise<{ result: number }> => {
  const formData = new FormData()
  formData.append('userid', profileData.userid)
  if (profileData.name) formData.append('name', profileData.name)
  if (profileData.age) formData.append('age', profileData.age)
  if (profileData.interest) formData.append('interest', profileData.interest)
  if (profileData.location) formData.append('location', profileData.location)
  if (profileData.profileimg) formData.append('profileimg', profileData.profileimg)

  return postFormData<{ result: number }>('storyapi/StoryBook/updateProfile', formData)
}

export const isProfileComplete = (profile: ProfileData): boolean => {
  const requiredFields = [
    profile.name?.trim()
  ]
  return requiredFields.every(field => field && field.length > 0)
}

export const checkProfileCompletion = async (userId: string): Promise<boolean> => {
  try {
    const profile = await fetchProfile(userId)
    
    // Check if profile has a name with both first and last name
    const hasCompleteName = profile?.name && profile.name.trim().split(' ').length >= 2
    
    if (!hasCompleteName) {
      // Profile is incomplete
      return false
    }
    
    // Profile is complete
    return true
  } catch (error) {
    console.error('Error checking profile completion:', error)
    return false
  }
}

export const fetchStoryComments = async (
  storyId: number
): Promise<StoryComment[]> => {
  const response = await fetch(buildUrl(`storyapi/StoryBook/GetStoryComments/${storyId}`))
  return handleJsonResponse<StoryComment[]>(response)
}

export const addStoryComment = async (
  storyId: number,
  comment: string,
  userId = DEFAULT_USER_ID,
  userName = 'VTellTales User',
  avatarUrl = ''
): Promise<number> => {
  const formData = new FormData()
  formData.append('storyid', storyId.toString())
  formData.append('userid', userId)
  formData.append('uname', userName)
  formData.append('comdate', new Date().toISOString())
  formData.append('storycomment', comment)
  formData.append('pimg', avatarUrl)
  return postFormData<number>('storyapi/StoryBook/AddStoryComment', formData)
}

export const likeStory = async (
  storyId: number,
  userId = DEFAULT_USER_ID
): Promise<number> => {
  const formData = new FormData()
  formData.append('storyid', storyId.toString())
  formData.append('likebyid', userId)
  return postFormData<number>('storyapi/StoryBook/AddStoryLike', formData)
}

export const createStory = async (input: CreateStoryInput): Promise<number> => {
  const formData = new FormData()
  formData.append('userid', input.userId ?? DEFAULT_USER_ID)
  formData.append('storytitle', input.title)
  formData.append('storydesc', input.description ?? '')
  formData.append('storylike', '0')
  formData.append('storystatus', (input.status ?? 1).toString())
  formData.append('storypages', Math.max(1, input.pageCount).toString())
  if (input.storyType) {
    formData.append('storytype', input.storyType)
  }
  if (input.storyTypeId != null) {
    formData.append('storytypeid', input.storyTypeId.toString())
  }
  if (input.coverFile) {
    formData.append('file', input.coverFile)
  }

  const response = await postFormData<{ result: string }>('storyapi/StoryBook/SaveStory', formData)
  const storyId = Number.parseInt(response.result, 10)
  if (Number.isNaN(storyId)) {
    throw new Error(`Unable to parse story id from backend: ${response.result}`)
  }
  return storyId
}

export const saveStoryPage = async (payload: StoryPageInput): Promise<number> => {
  const formData = new FormData()
  formData.append('userid', payload.userId ?? DEFAULT_USER_ID)
  formData.append('storyid', payload.storyId.toString())
  formData.append('pageno', payload.pageNumber.toString())
  formData.append('storypagetype', (payload.pageType ?? 0).toString())
  formData.append('pagestory', payload.content)
  formData.append('storyformat', payload.format ?? 'text')

  const response = await postFormData<string>('storyapi/StoryBook/SaveStorypage', formData)
  const result = Number.parseInt(response, 10)
  return Number.isNaN(result) ? 0 : result
}

export const fetchStoryTypes = async (): Promise<StoryType[]> => {
  const response = await fetch(buildUrl('storyapi/StoryBook/getallstorytype'))
  return handleJsonResponse<StoryType[]>(response)
}

export const fetchStoriesByPage = async (
  userId = DEFAULT_USER_ID,
  page = 1,
  limit = 12
): Promise<StoryData[]> => {
  // Use '0' as default userId when not provided
  const userIdParam = userId || '0'
  const response = await fetch(buildUrl(`storyapi/StoryBook/GetAllStoriesbypage/${userIdParam}/${page}/${limit}`))
  return handleJsonResponse<StoryData[]>(response)
}

export interface StoryPageData {
  storyid: number
  pageno: number
  pagestory: string
  storypagetype: number
  storyformat: string
}

export const fetchStoryPages = async (storyId: number): Promise<StoryPageData[]> => {
  const response = await fetch(buildUrl(`storyapi/StoryBook/GetStoryPages/${storyId}`))
  return handleJsonResponse<StoryPageData[]>(response)
}

export const updateStoryPage = async (payload: StoryPageInput): Promise<number> => {
  const formData = new FormData()
  formData.append('userid', payload.userId ?? DEFAULT_USER_ID)
  formData.append('storyid', payload.storyId.toString())
  formData.append('pageno', payload.pageNumber.toString())
  formData.append('storypagetype', (payload.pageType ?? 0).toString())
  formData.append('pagestory', payload.content)
  formData.append('storyformat', payload.format ?? 'text')

  const response = await postFormData<string>('storyapi/StoryBook/UpdateStoryPage', formData)
  const result = Number.parseInt(response, 10)
  return Number.isNaN(result) ? 0 : result
}

export const fetchFanClub = async (authorId: string): Promise<string[]> => {
  const response = await fetch(buildUrl(`storyapi/StoryBook/Getfanclub/${authorId}`))
  const data = await handleJsonResponse<StoryComment[]>(response)
  return data.map((fan) => fan.userid)
}

export const addFollowing = async (payload: ProfileFollowPayload) => {
  const response = await fetch(buildUrl('storyapi/StoryBook/AddFollowing'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return handleJsonResponse<{ result: number }>(response)
}

export const unFollowing = async (payload: ProfileFollowPayload) => {
  const response = await fetch(buildUrl('storyapi/StoryBook/UnFollowing'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return handleJsonResponse<{ result: number }>(response)
}

export const validateFirebaseToken = async (idToken: string): Promise<FirebaseAuthResult> => {
  const response = await fetch(buildUrl('storyapi/StoryBook/ValidateFirebaseToken'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  })
  return handleJsonResponse<FirebaseAuthResult>(response)
}

// Email/Password Authentication
export const loginWithEmail = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(buildUrl('storyapi/StoryBook/LoginUser'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Enable cookie support
    body: JSON.stringify(credentials)
  })

  const data = await response.json()
  
  // Normalize backend response (capital Success/User) to match interface (lowercase)
  return {
    success: data.Success ?? data.success ?? false,
    user: data.User ?? data.user,
    token: data.Token ?? data.token,
    message: data.Message ?? data.message
  }
}

export const registerWithEmail = async (userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  userType?: string
}): Promise<AuthResponse> => {
  const response = await fetch(buildUrl('storyapi/StoryBook/RegisterUser'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Enable cookie support
    body: JSON.stringify(userData)
  })

  const data = await response.json()
  
  // Normalize backend response (capital Success/User) to match interface (lowercase)
  return {
    success: data.Success ?? data.success ?? false,
    user: data.User ?? data.user,
    token: data.Token ?? data.token,
    message: data.Message ?? data.message,
    requiresEmailVerification: data.RequiresEmailVerification ?? data.requiresEmailVerification ?? false
  }
}

// Logout - clear session
export const logout = async (): Promise<void> => {
  try {
    await fetch(buildUrl('storyapi/StoryBook/Logout'), {
      method: 'POST',
      credentials: 'include'
    })
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Get current authenticated user
export const getCurrentUser = async (): Promise<AuthResponse> => {
  const response = await fetch(buildUrl('storyapi/StoryBook/GetCurrentUser'), {
    method: 'GET',
    credentials: 'include'
  })

  const data = await response.json()
  
  return {
    success: data.Success ?? data.success ?? false,
    user: data.User ?? data.user,
    message: data.Message ?? data.message
  }
}

// Check if user exists by email
export const checkUserExists = async (email: string): Promise<{ exists: boolean }> => {
  const response = await fetch(buildUrl(`storyapi/StoryBook/CheckUserExists/${encodeURIComponent(email)}`), {
    method: 'GET'
  })

  return handleJsonResponse<{ exists: boolean }>(response)
}
