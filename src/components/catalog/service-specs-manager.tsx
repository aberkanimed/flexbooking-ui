"use client"

import { useMemo, useState } from "react"
import { Plus, SlidersHorizontal } from "lucide-react"
import type { CharacteristicResponse, CharacteristicSpecificationDetailResponse } from "@/lib/api/catalog"
import { Button } from "@/components/ui/button"
import { CharCards } from "@/components/catalog/char-cards"
import { SpecFormSheet } from "@/components/catalog/spec-form-sheet"

interface ServiceSpecsManagerProps {
  serviceId: string
  specs: CharacteristicSpecificationDetailResponse[]
  characteristics: CharacteristicResponse[]
}

export function ServiceSpecsManager({ serviceId, specs, characteristics }: ServiceSpecsManagerProps) {
  const [open, setOpen] = useState(false)

  // Derived from `specs`/`characteristics` props — memoized to avoid recomputing the
  // filtered list (and reallocating the Set) on every render.
  const availableCharacteristics = useMemo(() => {
    const attachedIds = new Set(specs.map((s) => s.characteristic.id))
    return characteristics.filter((c) => c.active && !attachedIds.has(c.id))
  }, [specs, characteristics])

  return (
    <div className="mt-8">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-heading text-[22px] font-bold tracking-[-0.02em]">Items & pricing</h2>
          <p className="text-[13.5px] text-muted-foreground mt-1">
            Characteristics and add-on prices for this service.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setOpen(true)}
          disabled={availableCharacteristics.length === 0}
        >
          <Plus className="size-3.5" />
          Add an item
        </Button>
      </div>

      <div className="mt-4">
        {specs.length === 0 ? (
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
          <CharCards serviceId={serviceId} specs={specs} cardBg="bg-card" />
        )}
      </div>

      <SpecFormSheet
        key={open ? serviceId : "closed"}
        open={open}
        onOpenChange={setOpen}
        serviceId={serviceId}
        availableCharacteristics={availableCharacteristics}
        attached={specs}
      />
    </div>
  )
}
