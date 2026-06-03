import { getAllProducts } from "@/lib/api/catalog"
import { ProductCard } from "@/components/catalog/product-card"
import { AddProductButton } from "@/components/catalog/add-product-button"
import { Package } from "lucide-react"

export default async function ProductsPage() {
  const products = await getAllProducts()
  const count = products.length

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Hero */}
      <header className="flex flex-col gap-4 pt-3 pb-2 sm:flex-row sm:items-end sm:justify-between sm:pt-5 sm:pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary mb-2">
            Your catalog
          </p>
          <h1 className="font-heading text-[30px] font-bold tracking-[-0.03em] leading-[1.02] sm:text-[38px] lg:text-[44px]">
            Products
          </h1>
          <p className="mt-2.5 text-[15px] text-muted-foreground max-w-[460px] leading-relaxed lg:text-base">
            Everything you stock and resell, kept tidy and ready to book.{" "}
            {count === 0
              ? "No products yet."
              : `${count} ${count === 1 ? "product" : "products"} in your catalog.`}
          </p>
        </div>
        <AddProductButton />
      </header>

      {/* Grid or empty state */}
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3.5 rounded-3xl border border-dashed border-border py-16 text-center bg-white/35">
          <div className="flex size-14 items-center justify-center rounded-[18px] bg-primary-soft text-primary">
            <Package className="size-7" />
          </div>
          <div>
            <p className="font-heading text-xl font-bold">No products found</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-[320px] leading-relaxed">
              Products you add will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3 sm:gap-4 lg:gap-[18px]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
