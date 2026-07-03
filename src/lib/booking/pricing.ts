// Client-safe — no server-only imports
import type {
  ServiceDetailResponse,
  CharacteristicSpecificationDetailResponse,
} from "@/lib/api/catalog"
import type { CharacteristicItemRequest } from "@/lib/api/booking"
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

export function unitText(u: CharacteristicSpecificationDetailResponse["unitOfMeasure"]): string {
  if (u === "SQUARE_FOOTAGE") return "sq ft"
  if (u === "HOUR") return "hr"
  if (u === "MINUTE") return "min"
  if (u === "UNIT") return "unit"
  return ""
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
    const uom = unitText(spec.unitOfMeasure)
    let amountCents: number
    let label: string

    if (!spec.configurable) {
      // Non-configurable: operator default, always included
      if (spec.range) {
        amountCents = spec.price * (spec.valueFrom ?? 0)
        const qty = spec.valueFrom ?? 0
        label = uom ? `${name} — ${qty} ${uom}` : name
      } else {
        amountCents = spec.price
        label = name
      }
    } else if (spec.range) {
      // Configurable range: exclude when qty is 0
      const qty = Number(configuredItems[spec.id]?.value ?? spec.valueFrom ?? 0)
      if (qty <= 0) continue
      amountCents = spec.price * qty
      label = uom ? `${name} — ${qty} ${uom}` : `${name} — ${qty}`
    } else if (spec.characteristic.valueType === "BOOLEAN") {
      // Configurable boolean: exclude when off
      if (configuredItems[spec.id]?.value !== "true") continue
      amountCents = spec.price
      label = name
    } else {
      // Configurable value-set (string): always included
      amountCents = spec.price
      const selectedVal = String(configuredItems[spec.id]?.value ?? "")
      const optionName = spec.values.find((v) => v.value === selectedVal)?.value ?? selectedVal
      label = optionName ? `${name} — ${optionName}` : name
    }

    lineItems.push({ label, amountCents })
  }

  const totalCents = lineItems.reduce((sum, li) => sum + li.amountCents, 0)
  return { lineItems, totalCents }
}

export function buildConfiguredItemsPayload(
  detail: ServiceDetailResponse,
  configuredItems: Record<string, ConfiguredItem>,
): CharacteristicItemRequest[] {
  const result: CharacteristicItemRequest[] = []
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
    result.push({
      code: spec.code,
      value: String(value),
      valueType: spec.characteristic.valueType,
      unitOfMeasure: spec.unitOfMeasure ?? "NONE",
    })
  }
  return result
}
