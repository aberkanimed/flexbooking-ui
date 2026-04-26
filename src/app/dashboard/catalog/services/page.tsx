import { getServices } from "@/lib/api/catalog"
import { ServiceCard } from "@/components/catalog/service-card"
import { Wrench } from "lucide-react"

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {services.length === 0
              ? "No services yet"
              : `${services.length} ${services.length === 1 ? "service" : "services"} in your catalog`}
          </p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Wrench className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No services found</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Services you add will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}
