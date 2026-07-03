// Client-safe — no server-only imports
import type {
  ServiceDetailResponse,
  CharacteristicSpecificationDetailResponse,
} from "@/lib/api/catalog"
import type { ConfiguredItem } from "@/lib/booking/types"

export const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function isSpecVisible(
  spec: CharacteristicSpecificationDetailResponse,
  configuredItems: Record<string, ConfiguredItem>,
): boolean {
  if (!spec.parentRelationships || spec.parentRelationships.length === 0) return true
  return spec.parentRelationships.every((rel) => rel.id in configuredItems)
}

export function seedDefaults(
  detail: ServiceDetailResponse,
): Record<string, ConfiguredItem> {
  const result: Record<string, ConfiguredItem> = {}
  for (const spec of detail.characteristics) {
    if (!spec.active) continue
    if (spec.range) {
      result[spec.id] = { value: spec.valueFrom ?? 0 }
    } else if (spec.values.length > 0) {
      const def = spec.values.find((v) => v.isDefault) ?? spec.values[0]
      result[spec.id] = { value: def.value }
    } else {
      // boolean: seed as "false" so pricing starts with zero contribution
      result[spec.id] = { value: "false" }
    }
  }
  return result
}

export function computeEstimate(
  detail: ServiceDetailResponse,
  configuredItems: Record<string, ConfiguredItem>,
): { lineItems: { label: string; amountCents: number }[]; totalCents: number } {
  const lineItems: { label: string; amountCents: number }[] = [
    { label: "Base price", amountCents: detail.basePrice },
  ]

  for (const spec of detail.characteristics) {
    if (!spec.active) continue
    if (!isSpecVisible(spec, configuredItems)) continue

    const name = spec.characteristic.name
    let amountCents: number

    if (!spec.configurable) {
      // Non-configurable: operator default, always included
      amountCents = spec.range
        ? spec.price * (spec.valueFrom ?? 0)
        : spec.price
    } else if (spec.range) {
      // Configurable range: exclude when qty is 0
      const qty = Number(configuredItems[spec.id]?.value ?? spec.valueFrom ?? 0)
      if (qty <= 0) continue
      amountCents = spec.price * qty
    } else if (spec.characteristic.valueType === "BOOLEAN") {
      // Configurable boolean: exclude when off
      if (configuredItems[spec.id]?.value !== "true") continue
      amountCents = spec.price
    } else {
      // Configurable value-set (string): always included
      amountCents = spec.price
    }

    lineItems.push({ label: name, amountCents })
  }

  const totalCents = lineItems.reduce((sum, li) => sum + li.amountCents, 0)
  return { lineItems, totalCents }
}

export function buildConfiguredItemsPayload(
  detail: ServiceDetailResponse,
  configuredItems: Record<string, ConfiguredItem>,
): { code: string; value: string | number; valueType: string; unit?: string }[] {
  const result: { code: string; value: string | number; valueType: string; unit?: string }[] = []
  for (const spec of detail.characteristics) {
    if (!spec.active) continue
    if (!isSpecVisible(spec, configuredItems)) continue
    const item = configuredItems[spec.id]
    const value = item !== undefined ? item.value : (spec.valueFrom ?? 0)
    // Exclude configurable items that are "not selected"
    if (spec.configurable) {
      if (spec.characteristic.valueType === "BOOLEAN" && value !== "true") continue
      if (spec.range && Number(value) <= 0) continue
    }
    const entry: { code: string; value: string | number; valueType: string; unit?: string } = {
      code: spec.code,
      value,
      valueType: spec.characteristic.valueType,
    }
    if (spec.unitOfMeasure && spec.unitOfMeasure !== "NONE") {
      entry.unit = spec.unitOfMeasure
    }
    result.push(entry)
  }
  return result
}
