import { getAllCharacteristics } from "@/lib/api/catalog"
import { CharacteristicCard } from "@/components/catalog/characteristic-card"
import { AddCharacteristicButton } from "@/components/catalog/add-characteristic-button"
import { Tag } from "lucide-react"

export default async function CharacteristicsPage() {
  const characteristics = await getAllCharacteristics()
  const count = characteristics.length

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Hero */}
      <header className="flex flex-col gap-4 pt-3 pb-2 sm:flex-row sm:items-end sm:justify-between sm:pt-5 sm:pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary mb-2">
            Your catalog
          </p>
          <h1 className="font-heading text-[30px] font-bold tracking-[-0.03em] leading-[1.02] sm:text-[38px] lg:text-[44px]">
            Items
          </h1>
          <p className="mt-2.5 text-[15px] text-muted-foreground max-w-[460px] leading-relaxed lg:text-base">
            {count === 0
              ? "No items yet."
              : `${count} ${count === 1 ? "item" : "items"} in your catalog.`}
          </p>
        </div>
        <AddCharacteristicButton />
      </header>

      {/* Grid or empty state */}
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3.5 rounded-3xl border border-dashed border-border py-16 text-center bg-white/35">
          <div className="flex size-14 items-center justify-center rounded-[18px] bg-primary-soft text-primary">
            <Tag className="size-7" />
          </div>
          <div>
            <p className="font-heading text-xl font-bold">No items found</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-[320px] leading-relaxed">
              Add an item to start building your services catalog.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 pb-24 sm:grid-cols-2 sm:gap-4 sm:pb-0 xl:grid-cols-3 lg:gap-[18px]">
          {characteristics.map((characteristic) => (
            <CharacteristicCard key={characteristic.id} characteristic={characteristic} />
          ))}
        </div>
      )}
    </div>
  )
}
