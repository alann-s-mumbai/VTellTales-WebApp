import { FirebaseApp, initializeApp, getApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const isConfigValid = () => {
  const hasApiKey = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined' && firebaseConfig.apiKey.trim() !== ''
  const hasProjectId = firebaseConfig.projectId && firebaseConfig.projectId !== 'undefined' && firebaseConfig.projectId.trim() !== ''
  return hasApiKey && hasProjectId
}

// Only initialize Firebase if configuration is valid
let app: FirebaseApp | null = null
let auth: any = null
let googleProvider: GoogleAuthProvider | null = null

if (isConfigValid()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
  } catch (error) {
    console.warn('Firebase initialization failed:', error)
  }
} else {
  console.warn('Firebase configuration not found. Running in development mode without authentication.')
}

export { auth, googleProvider }

export const signInWithGoogle = async (): Promise<UserCredential | null> => {
  if (!auth || !googleProvider) {
    console.warn('Firebase auth not initialized. Skipping Google sign in.')
    return null
  }
  
  try {
    googleProvider.setCustomParameters({ prompt: 'select_account' })
    return signInWithPopup(auth, googleProvider)
  } catch (error) {
    console.error('Google sign in failed:', error)
    throw error
  }
}
