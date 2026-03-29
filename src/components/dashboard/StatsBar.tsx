import { Headphones, Clock, Radio } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMinutes } from '@/lib/utils'

interface StatsBarProps {
  totalEpisodes: number
  totalMinutes: number
  uniqueShows: number
  isLoading: boolean
}

export function StatsBar({ totalEpisodes, totalMinutes, uniqueShows, isLoading }: StatsBarProps) {
  const items = [
    { icon: Headphones, label: 'Episodes tracked', value: String(totalEpisodes) },
    { icon: Clock, label: 'Total listen time', value: formatMinutes(totalMinutes) },
    { icon: Radio, label: 'Unique shows', value: String(uniqueShows) },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ icon: Icon, label, value }) => (
        <Card key={label} className="p-4 text-center">
          <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
          {isLoading ? (
            <Skeleton className="h-6 w-12 mx-auto mb-1" />
          ) : (
            <p className="text-xl font-bold">{value}</p>
          )}
          <p className="text-xs text-muted-foreground">{label}</p>
        </Card>
      ))}
    </div>
  )
}
