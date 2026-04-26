import { getProducts } from "@/lib/api/catalog"
import { ProductCard } from "@/components/catalog/product-card"
import { Package } from "lucide-react"

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length === 0
              ? "No products yet"
              : `${products.length} ${products.length === 1 ? "product" : "products"} in your catalog`}
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Package className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No products found</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Products you add will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
