import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'
import { generateCodeVerifier, generateCodeChallenge, generateState } from '@/lib/pkce'
import { getAuthUrl, exchangeCodeForToken, SpotifyAuthError } from '@/lib/spotify'

interface AuthState {
  status: 'idle' | 'exchanging' | 'authenticated' | 'error'
  accessToken: string | null
  error: string | null
}

type AuthAction =
  | { type: 'EXCHANGE_START' }
  | { type: 'SET_TOKEN'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'ERROR'; payload: string }
  | { type: 'TOKEN_EXPIRED' }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'EXCHANGE_START':
      return { ...state, status: 'exchanging', error: null }
    case 'SET_TOKEN':
      return { status: 'authenticated', accessToken: action.payload, error: null }
    case 'LOGOUT':
      return { status: 'idle', accessToken: null, error: null }
    case 'ERROR':
      return { status: 'error', accessToken: null, error: action.payload }
    case 'TOKEN_EXPIRED':
      return { status: 'error', accessToken: null, error: 'session_expired' }
    default:
      return state
  }
}

interface AuthContextValue extends AuthState {
  login: () => Promise<void>
  logout: () => void
  handleTokenExpired: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    status: 'idle',
    accessToken: null,
    error: null,
  })

  // Detect OAuth callback on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const returnedState = params.get('state')
    const error = params.get('error')

    if (error) {
      sessionStorage.removeItem('pkce_verifier')
      sessionStorage.removeItem('pkce_state')
      // Clean URL
      history.replaceState({}, '', window.location.pathname + window.location.hash)
      dispatch({ type: 'ERROR', payload: `Spotify denied access: ${error}` })
      return
    }

    if (!code) return

    const storedState = sessionStorage.getItem('pkce_state')
    const verifier = sessionStorage.getItem('pkce_verifier')

    // Clean URL immediately so code is never visible in history
    history.replaceState({}, '', window.location.pathname + window.location.hash)

    if (!verifier || !storedState || returnedState !== storedState) {
      sessionStorage.removeItem('pkce_verifier')
      sessionStorage.removeItem('pkce_state')
      dispatch({ type: 'ERROR', payload: 'Authentication state mismatch. Please try again.' })
      return
    }

    dispatch({ type: 'EXCHANGE_START' })

    exchangeCodeForToken(code, verifier)
      .then((tokenData) => {
        sessionStorage.removeItem('pkce_verifier')
        sessionStorage.removeItem('pkce_state')
        dispatch({ type: 'SET_TOKEN', payload: tokenData.access_token })
      })
      .catch((err: unknown) => {
        sessionStorage.removeItem('pkce_verifier')
        sessionStorage.removeItem('pkce_state')
        const message = err instanceof Error ? err.message : 'Token exchange failed'
        dispatch({ type: 'ERROR', payload: message })
      })
  }, [])

  const login = useCallback(async () => {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    const state = generateState()

    sessionStorage.setItem('pkce_verifier', verifier)
    sessionStorage.setItem('pkce_state', state)

    window.location.href = getAuthUrl(challenge, state)
  }, [])

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' })
  }, [])

  const handleTokenExpired = useCallback(() => {
    dispatch({ type: 'TOKEN_EXPIRED' })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, handleTokenExpired }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { SpotifyAuthError }
