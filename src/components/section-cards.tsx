import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type CardItem = {
  label: string
  value: string
  description: string
  trend?: {
    value: string
    direction: "up" | "down"
  }
}

export function SectionCards({ items }: { items: CardItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 xl:grid-cols-4 lg:px-6 *:data-[slot=card]:shadow-xs *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
      {items.map((item) => (
        <Card className="@container/card" key={item.label}>
          <CardHeader className="relative">
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {item.value}
            </CardTitle>
            {item.trend && (
              <div className="absolute right-4 top-4">
                <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                  {item.trend.direction === "up" ? (
                    <TrendingUpIcon className="size-3" />
                  ) : (
                    <TrendingDownIcon className="size-3" />
                  )}
                  {item.trend.value}
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="text-muted-foreground">{item.description}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
