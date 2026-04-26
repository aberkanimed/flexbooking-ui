import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card"
import type { ServiceResponse } from "@/lib/api/catalog"

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

export function ServiceCard({ service }: { service: ServiceResponse }) {
  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardHeader>
        <CardTitle className="truncate">{service.name}</CardTitle>
        <CardDescription className="line-clamp-2 leading-relaxed">
          {service.description}
        </CardDescription>
        <CardAction>
          {service.active ? (
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="shadow-none">Inactive</Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardFooter>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Base price
        </span>
        <span className="ml-auto text-sm font-semibold tabular-nums">
          {usd.format(service.basePrice / 100)}
        </span>
      </CardFooter>
    </Card>
  )
}
