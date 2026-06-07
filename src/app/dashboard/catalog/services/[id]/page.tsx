import { getServiceById, getAllCharacteristics } from "@/lib/api/catalog"
import { ServiceDetailHero } from "@/components/catalog/service-detail-hero"
import { ServiceSpecsManager } from "@/components/catalog/service-specs-manager"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params
  const [service, characteristics] = await Promise.all([getServiceById(id), getAllCharacteristics()])

  return (
    <div className="space-y-0 pb-8">
      <ServiceDetailHero service={service} />

      <ServiceSpecsManager
        serviceId={service.id}
        specs={service.characteristics}
        characteristics={characteristics}
      />
    </div>
  )
}
