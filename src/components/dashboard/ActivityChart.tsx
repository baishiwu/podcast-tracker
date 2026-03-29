import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DayActivity } from '@/types/spotify'

interface ActivityChartProps {
  data: DayActivity[]
  isLoading: boolean
}

function formatDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ActivityChart({ data, isLoading }: ActivityChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Listening activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No activity data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tickFormatter={formatDay}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                labelFormatter={formatDay}
                formatter={(value: number) => [value, 'episodes']}
                contentStyle={{ fontSize: 12, borderRadius: 6 }}
              />
              <Bar dataKey="episodes" radius={[3, 3, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={index} fill="hsl(142.1 76.2% 36.3%)" fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
