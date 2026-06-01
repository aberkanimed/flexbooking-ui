import { getServiceById } from "@/lib/api/catalog"
import { ServiceDetailHero } from "@/components/catalog/service-detail-hero"
import { CharCards } from "@/components/catalog/char-cards"
import { SlidersHorizontal } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params
  const service = await getServiceById(id)

  return (
    <div className="space-y-0 pb-8">
      <ServiceDetailHero service={service} />

      <div className="mt-8">
        <h2 className="font-heading text-[22px] font-bold tracking-[-0.02em]">Items & pricing</h2>
        <p className="text-[13.5px] text-muted-foreground mt-1">
          Characteristics and add-on prices for this service.
        </p>
        <div className="mt-4">
          {service.characteristics.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3.5 rounded-[22px] border border-dashed border-border py-14 text-center bg-white/35">
              <div className="flex size-14 items-center justify-center rounded-[18px] bg-primary-soft text-primary">
                <SlidersHorizontal className="size-[26px]" />
              </div>
              <div>
                <p className="font-heading text-xl font-bold">No items defined</p>
                <p className="mt-1 text-sm text-muted-foreground max-w-[320px] leading-relaxed">
                  Items you add to this service will appear here.
                </p>
              </div>
            </div>
          ) : (
            <CharCards specs={service.characteristics} cardBg="bg-card" />
          )}
        </div>
      </div>
    </div>
  )
}
