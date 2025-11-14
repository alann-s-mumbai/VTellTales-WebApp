// Session-based authentication service
// Uses HTTP-only cookies for secure session management

interface User {
  id: string
  email: string
  name?: string
  profileImg?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
}

class AuthService {
  private static instance: AuthService
  private authState: AuthState = {
    isAuthenticated: false,
    user: null
  }
  private listeners: Set<(state: AuthState) => void> = new Set()

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.authState))
  }

  // Set authenticated user
  setUser(user: User): void {
    this.authState = {
      isAuthenticated: true,
      user
    }
    this.notify()
    // Dispatch event for components using window events
    window.dispatchEvent(new Event('userStateChanged'))
  }

  // Get current user
  getUser(): User | null {
    return this.authState.user
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated
  }

  // Clear auth state (logout)
  clearAuth(): void {
    this.authState = {
      isAuthenticated: false,
      user: null
    }
    this.notify()
    window.dispatchEvent(new Event('userStateChanged'))
  }

  // Initialize - fetch current session from backend
  async initialize(): Promise<void> {
    try {
      const response = await fetch('/api/storyapi/StoryBook/GetCurrentUser', {
        credentials: 'include' // Send cookies
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user || data.User) {
          const user = data.user || data.User
          this.setUser({
            id: user.id || user.Id,
            email: user.email || user.Email,
            name: user.name || user.Name,
            profileImg: user.profileImg || user.ProfileImg
          })
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      this.clearAuth()
    }
  }
}

export const authService = AuthService.getInstance()
export type { User, AuthState }
