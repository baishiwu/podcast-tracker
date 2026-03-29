import { Headphones, ShieldCheck, BarChart3, List, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

export function LandingPage() {
  const { status, error, login } = useAuth()
  const isLoading = status === 'exchanging'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center gap-2 font-semibold text-sm">
          <Headphones className="h-5 w-5 text-primary" />
          Podcast Stats
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
              <Headphones className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Your podcast stats</h1>
            <p className="text-muted-foreground">
              See what you've been listening to on Spotify — top shows, recent episodes, listening trends.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Listening trends</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Headphones className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Top shows</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
              <List className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Recent episodes</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={login}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              )}
              {isLoading ? 'Connecting…' : 'Connect with Spotify'}
            </Button>

            {error && error !== 'session_expired' && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {error === 'session_expired' && (
              <p className="text-sm text-muted-foreground">Your session expired. Reconnect to see your stats.</p>
            )}
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 text-left">
            <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground mb-0.5">No data stored</p>
              <p>Your access token and listening data live only in this browser tab. Nothing is saved to any server or browser storage. When you close the tab, everything is gone.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
