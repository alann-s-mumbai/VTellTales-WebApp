export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:5001'

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
    profileImg?: string
  }
  token?: string
  message?: string
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
  try {
    const response = await fetch(buildUrl(`storyapi/StoryBook/viewprofile/${userId}`))
    
    // Check if response is ok before parsing
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.warn('Backend unavailable, using demo profile data:', error)
    
    // Check for stored demo profile data first
    const storedProfile = localStorage.getItem(`demo_profile_${userId}`)
    if (storedProfile) {
      const profile = JSON.parse(storedProfile)
      return {
        userid: userId,
        email: userId === 'demo-user-1' ? 'test@vtelltales.com' : 'demo@example.com',
        name: profile.name || 'John Doe', // Use stored name or default
        age: profile.age || '25',
        interest: profile.interest || 'Technology, Reading, Writing',
        location: profile.location || 'Demo City',
        profileimg: profile.profileimg || '',
        followingcount: '12',
        followercount: '8',
        storycount: '3',
        tokan: 'demo-token',
        is_active: 1,
        cdate: new Date().toISOString(),
        udate: new Date().toISOString()
      }
    }
    
    // Return demo profile data with editable placeholder information
    if (userId === 'demo-user-1') {
      return {
        userid: 'demo-user-1',
        email: 'test@vtelltales.com',
        name: 'John Doe', // Dummy name that should be edited
        age: '25', // Placeholder age
        interest: 'Technology, Reading, Writing', // Placeholder interests
        location: 'Demo City', // Placeholder location
        profileimg: '',
        followingcount: '12',
        followercount: '8',
        storycount: '3',
        tokan: 'demo-token',
        is_active: 1,
        cdate: new Date().toISOString(),
        udate: new Date().toISOString()
      }
    }
    
    // Default demo profile for other demo users
    return {
      userid: userId,
      email: 'demo@example.com',
      name: 'John Doe', // Dummy placeholder that needs to be updated
      age: '25',
      interest: 'Reading, Writing',
      location: 'Demo City',
      profileimg: '',
      followingcount: '0',
      followercount: '0',
      storycount: '0',
      tokan: 'demo-token',
      is_active: 1,
      cdate: new Date().toISOString(),
      udate: new Date().toISOString()
    }
  }
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
  // For demo users, immediately use localStorage without trying backend
  if (profileData.userid.startsWith('demo')) {
    const existingProfile = localStorage.getItem(`demo_profile_${profileData.userid}`)
    const profile = existingProfile ? JSON.parse(existingProfile) : {}
    
    // Update profile data
    if (profileData.name) profile.name = profileData.name
    if (profileData.age) profile.age = profileData.age
    if (profileData.interest) profile.interest = profileData.interest
    if (profileData.location) profile.location = profileData.location
    
    localStorage.setItem(`demo_profile_${profileData.userid}`, JSON.stringify(profile))
    
    // Update user data in localStorage as well
    const userData = localStorage.getItem('vtelltales_user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (profileData.name && user.id === profileData.userid) {
          user.name = profileData.name
          localStorage.setItem('vtelltales_user', JSON.stringify(user))
          // Notify other components of the update
          window.dispatchEvent(new Event('userStateChanged'))
        }
      } catch (e) {
        console.error('Error updating user data:', e)
      }
    }
    
    return { result: 1 } // Success
  }
  
  // For real users, try backend API
  try {
    const formData = new FormData()
    formData.append('userid', profileData.userid)
    if (profileData.name) formData.append('name', profileData.name)
    if (profileData.age) formData.append('age', profileData.age)
    if (profileData.interest) formData.append('interest', profileData.interest)
    if (profileData.location) formData.append('location', profileData.location)
    if (profileData.profileimg) formData.append('profileimg', profileData.profileimg)
    
    return postFormData<{ result: number }>('storyapi/StoryBook/updateProfile', formData)
  } catch (error) {
    console.error('Backend error updating profile:', error)
    return { result: 0 } // Failure
  }
}

export const isProfileComplete = (profile: ProfileData): boolean => {
  // Check if required fields are filled - for demo, just check name
  // In a real app, you could check multiple fields like:
  // profile.name, profile.age, profile.location, etc.
  const requiredFields = [
    profile.name?.trim()
  ]
  
  // For demo users, check if name has been updated from default placeholder
  if (profile.userid.startsWith('demo')) {
    return !!(profile.name?.trim() && 
           profile.name.trim() !== 'Demo User' && 
           profile.name.trim() !== 'John Doe' && // Check against dummy data too
           profile.name.trim().length > 0)
  }
  
  return requiredFields.every(field => field && field.length > 0)
}

export const checkProfileCompletion = async (userId: string): Promise<boolean> => {
  try {
    const profile = await fetchProfile(userId)
    if (!profile) return false
    
    return isProfileComplete(profile)
  } catch (error) {
    console.error('Error checking profile completion:', error)
    return false
  }
}

// Helper function for testing - clears profile completion status
export const clearProfileCompletion = (): void => {
  localStorage.removeItem('profileCompleted')
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
  try {
    const response = await fetch(buildUrl('storyapi/StoryBook/getallstorytype'))
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.warn('Backend unavailable, using demo story types:', error)
    
    // Return demo story types
    return [
      { stid: 1, sttype: 'Adventure' },
      { stid: 2, sttype: 'Fantasy' },
      { stid: 3, sttype: 'Educational' },
      { stid: 4, sttype: 'Comedy' },
      { stid: 5, sttype: 'Mystery' },
      { stid: 6, sttype: 'Science Fiction' }
    ]
  }
}

export const fetchStoriesByPage = async (
  userId = DEFAULT_USER_ID,
  page = 1,
  limit = 12
): Promise<StoryData[]> => {
  try {
    const response = await fetch(buildUrl(`storyapi/StoryBook/GetTopStoriesByPage?userId=${userId}&page=${page}&pageSize=${limit}`))
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.warn('Backend unavailable, using demo stories:', error)
    
    // Return demo stories for the current page
    const demoStories: StoryData[] = [
      {
        storyid: 1,
        storytitle: 'The Magic Forest Adventure',
        storydesc: 'Join Lucy as she discovers a magical forest filled with talking animals and hidden treasures.',
        storyimg: '/demo-cover-1.jpg',
        userid: 'demo-user-1',
        storytype: 'Adventure',
        storylike: 15,
        storyview: 127,
        createdate: '2024-01-15T10:30:00Z',
        islike: false,
        spages: 12,
        storycomment: 8,
        storystatus: 1,
        storypages: 12,
        storytypeid: 1,
        followerid: 'demo-user-1',
        followername: 'Demo Author'
      },
      {
        storyid: 2,
        storytitle: 'Space Explorer Sam',
        storydesc: 'Sam builds a rocket and travels to different planets, meeting alien friends along the way.',
        storyimg: '/demo-cover-2.jpg',
        userid: 'demo-user-2',
        storytype: 'Science Fiction',
        storylike: 23,
        storyview: 89,
        createdate: '2024-01-12T14:20:00Z',
        islike: true,
        spages: 15,
        storycomment: 12,
        storystatus: 1,
        storypages: 15,
        storytypeid: 6,
        followerid: 'demo-user-2',
        followername: 'Space Writer'
      },
      {
        storyid: 3,
        storytitle: 'The Curious Cat Detective',
        storydesc: 'Detective Whiskers solves mysteries around the neighborhood with clever clues and teamwork.',
        storyimg: '/demo-cover-3.jpg',
        userid: 'demo-user-3',
        storytype: 'Mystery',
        storylike: 31,
        storyview: 156,
        createdate: '2024-01-10T09:15:00Z',
        islike: false,
        spages: 18,
        storycomment: 5,
        storystatus: 1,
        storypages: 18,
        storytypeid: 5,
        followerid: 'demo-user-3',
        followername: 'Mystery Master'
      },
      {
        storyid: 4,
        storytitle: 'Learning Numbers with Nola',
        storydesc: 'Nola the elephant teaches children about numbers through fun games and colorful adventures.',
        storyimg: '/demo-cover-4.jpg',
        userid: 'demo-user-1',
        storytype: 'Educational',
        storylike: 18,
        storyview: 203,
        createdate: '2024-01-08T16:45:00Z',
        islike: false,
        spages: 10,
        storycomment: 15,
        storystatus: 1,
        storypages: 10,
        storytypeid: 3,
        followerid: 'demo-user-1',
        followername: 'Demo Author'
      }
    ]
    
    // Return a subset of demo stories for pagination simulation
    if (page === 1) {
      return demoStories.slice(0, Math.min(limit, demoStories.length))
    } else {
      // For pages beyond 1, return fewer stories to simulate end of data
      return []
    }
  }
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
  try {
    // Try backend first
    const response = await fetch(buildUrl('storyapi/StoryBook/LoginUser'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    
    if (response.ok) {
      return handleJsonResponse<AuthResponse>(response)
    }
  } catch (error) {
    console.warn('Backend unavailable, using demo mode:', error)
  }
  
  // Fallback demo authentication - demo user with incomplete profile
  if (credentials.email === 'test@vtelltales.com' && credentials.password === 'password') {
    return {
      success: true,
      user: {
        id: 'demo-user-1',
        email: 'test@vtelltales.com',
        name: '' // Empty name to trigger profile completion
      },
      message: 'Demo login successful! Please complete your profile.'
    }
  }
  
  // Demo user registration simulation - creates user with incomplete profile
  if (credentials.email && credentials.password.length >= 6) {
    return {
      success: true,
      user: {
        id: `demo-${Date.now()}`,
        email: credentials.email,
        name: '' // Empty name to require profile completion
      },
      message: 'Demo account created! Please complete your profile.'
    }
  }
  
  return {
    success: false,
    message: 'Invalid credentials. Try test@vtelltales.com / password or create new account.'
  }
}

export const registerWithEmail = async (userData: {
  email: string
  password: string
  name: string
}): Promise<AuthResponse> => {
  try {
    // Try backend first
    const response = await fetch(buildUrl('storyapi/StoryBook/RegisterUser'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    
    if (response.ok) {
      return handleJsonResponse<AuthResponse>(response)
    }
  } catch (error) {
    console.warn('Backend unavailable, using demo mode:', error)
  }
  
  // Fallback demo registration
  if (userData.email && userData.password.length >= 6 && userData.name) {
    return {
      success: true,
      user: {
        id: `demo-${Date.now()}`,
        email: userData.email,
        name: userData.name
      },
      message: 'Demo registration successful!'
    }
  }
  
  return {
    success: false,
    message: 'Please fill in all fields with valid data.'
  }
}

// Check if user exists by email
export const checkUserExists = async (email: string): Promise<{ exists: boolean }> => {
  try {
    const response = await fetch(buildUrl(`storyapi/StoryBook/CheckUserExists/${encodeURIComponent(email)}`), {
      method: 'GET'
    })
    
    if (response.ok) {
      return handleJsonResponse<{ exists: boolean }>(response)
    }
  } catch (error) {
    console.warn('Backend unavailable for user check:', error)
  }
  
  // Demo fallback - test user exists, others don't
  return { exists: email === 'test@vtelltales.com' }
}
