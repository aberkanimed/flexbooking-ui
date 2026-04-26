import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card"
import type { ProductResponse } from "@/lib/api/catalog"

export function ProductCard({ product }: { product: ProductResponse }) {
  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardHeader>
        <CardTitle className="truncate">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2 leading-relaxed">
          {product.description}
        </CardDescription>
        <CardAction>
          {product.active ? (
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="shadow-none">Inactive</Badge>
          )}
        </CardAction>
      </CardHeader>
    </Card>
  )
}
