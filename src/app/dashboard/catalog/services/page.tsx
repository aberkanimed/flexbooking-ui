import { getServices, getAllProducts } from "@/lib/api/catalog"
import { ServiceCard } from "@/components/catalog/service-card"
import { AddServiceButton } from "@/components/catalog/add-service-button"
import { Wrench } from "lucide-react"

export default async function ServicesPage() {
  const [services, products] = await Promise.all([getServices(), getAllProducts()])
  const count = services.length

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Hero */}
      <header className="flex flex-col gap-4 pt-3 pb-2 sm:flex-row sm:items-end sm:justify-between sm:pt-5 sm:pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary mb-2">
            Your catalog
          </p>
          <h1 className="font-heading text-[30px] font-bold tracking-[-0.03em] leading-[1.02] sm:text-[38px] lg:text-[44px]">
            Services
          </h1>
          <p className="mt-2.5 text-[15px] text-muted-foreground max-w-[460px] leading-relaxed lg:text-base">
            The jobs you offer and what they cost, all in one place.{" "}
            {count === 0
              ? "No services yet."
              : `${count} ${count === 1 ? "service" : "services"} in your catalog.`}
          </p>
        </div>
        <AddServiceButton products={products} />
      </header>

      {/* Grid or empty state */}
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3.5 rounded-3xl border border-dashed border-border py-16 text-center bg-white/35">
          <div className="flex size-14 items-center justify-center rounded-[18px] bg-primary-soft text-primary">
            <Wrench className="size-7" />
          </div>
          <div>
            <p className="font-heading text-xl font-bold">No services found</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-[320px] leading-relaxed">
              Services you add will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 pb-24 sm:grid-cols-2 sm:pb-0 xl:grid-cols-3 sm:gap-4 lg:gap-[18px]">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}
