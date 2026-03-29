import { ShieldCheck } from 'lucide-react'

export function PrivacyBadge() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
      <span>Session only — no data stored</span>
    </div>
  )
}
