import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  Clock3Icon,
  EyeIcon,
  type LucideIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"

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

const cardDecor: Array<{
  icon: LucideIcon
  accentClass: string
  iconClass: string
  labelClass: string
  descriptionClass: string
  valueClass: string
}> = [
  {
    icon: EyeIcon,
    accentClass:
      "border-secondary/30 bg-[radial-gradient(circle_at_top_left,_hsla(186,100%,50%,0.12),_transparent_44%)]",
    iconClass: "bg-secondary/15 text-secondary",
    labelClass: "text-card-foreground",
    descriptionClass: "text-muted-foreground",
    valueClass: "text-card-foreground",
  },
  {
    icon: Clock3Icon,
    accentClass:
      "border-amber-500/30 bg-[radial-gradient(circle_at_top_left,_hsla(30,100%,60%,0.12),_transparent_40%)]",
    iconClass: "bg-amber-500/15 text-amber-400",
    labelClass: "text-card-foreground",
    descriptionClass: "text-muted-foreground",
    valueClass: "text-card-foreground",
  },
  {
    icon: CheckCircle2Icon,
    accentClass:
      "border-emerald-500/30 bg-[radial-gradient(circle_at_top_left,_hsla(160,60%,45%,0.12),_transparent_42%)]",
    iconClass: "bg-emerald-500/15 text-emerald-400",
    labelClass: "text-card-foreground",
    descriptionClass: "text-muted-foreground",
    valueClass: "text-card-foreground",
  },
  {
    icon: AlertTriangleIcon,
    accentClass:
      "border-destructive/30 bg-[radial-gradient(circle_at_top_left,_hsla(0,84%,60%,0.12),_transparent_40%)]",
    iconClass: "bg-destructive/15 text-destructive",
    labelClass: "text-card-foreground",
    descriptionClass: "text-muted-foreground",
    valueClass: "text-card-foreground",
  },
]

export function SectionCards({ items }: { items: CardItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const decor = cardDecor[index % cardDecor.length]
        const Icon = decor.icon

        return (
        <Card
          className={`@container/card overflow-hidden border shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg ${decor.accentClass}`}
          key={item.label}
        >
          <CardHeader className="relative">
            <div className={`mb-4 flex size-10 items-center justify-center rounded-2xl ${decor.iconClass}`}>
              <Icon className="size-5" />
            </div>
            <CardDescription className={`text-base font-medium ${decor.labelClass}`}>{item.label}</CardDescription>
            <CardTitle className={`@[250px]/card:text-3xl text-2xl font-semibold tabular-nums ${decor.valueClass}`}>
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
          <CardFooter className="flex-col items-start gap-2 text-base">
            <div className={decor.descriptionClass}>{item.description}</div>
          </CardFooter>
        </Card>
      )})}
    </div>
  )
}
