import { LogOut, Headphones } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { PrivacyBadge } from './PrivacyBadge'
import { useAuth } from '@/context/AuthContext'
import type { SpotifyProfile } from '@/types/spotify'

interface HeaderProps {
  profile: SpotifyProfile | undefined
}

export function Header({ profile }: HeaderProps) {
  const { logout } = useAuth()
  const displayName = profile?.display_name ?? 'Listener'
  const avatarUrl = profile?.images[0]?.url

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Headphones className="h-5 w-5 text-primary" />
          <span>Podcast Stats</span>
        </div>

        <div className="flex items-center gap-3">
          <PrivacyBadge />
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-xs">{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:block">{displayName}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="Disconnect">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
