import { getProductById } from "@/lib/api/catalog"
import { ProductDetailHero } from "@/components/catalog/product-detail-hero"
import { RollupStats } from "@/components/catalog/rollup-stats"
import { ServicesWorkbench } from "@/components/catalog/services-workbench"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const product = await getProductById(id)

  return (
    <div className="space-y-0 pb-8">
      <ProductDetailHero product={product} />
      <RollupStats services={product.services} productActive={product.active} />
      <ServicesWorkbench services={product.services} />
    </div>
  )
}
