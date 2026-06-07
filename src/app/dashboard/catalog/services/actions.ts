"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  createService,
  updateService,
  deleteService,
  addServiceCharacteristics,
  removeServiceCharacteristics,
  type ServiceRequest,
  type ServiceUpdateRequest,
  type CharacteristicSpecificationRequest,
} from "@/lib/api/catalog"

export interface ActionState {
  errors: string[]
  fieldErrors?: {
    name?: string
    description?: string
    basePrice?: string
    productId?: string
  }
}

function validateFields(formData: FormData): {
  name: string
  description: string
  active: boolean
  basePrice: number
  productId: string
  fieldErrors: NonNullable<ActionState["fieldErrors"]>
} {
  const name = (formData.get("name") as string | null)?.trim() ?? ""
  const description = (formData.get("description") as string | null)?.trim() ?? ""
  const active = formData.get("active") === "on"
  const productId = (formData.get("productId") as string | null)?.trim() ?? ""
  const priceRaw = (formData.get("basePrice") as string | null)?.trim() ?? ""

  const fieldErrors: NonNullable<ActionState["fieldErrors"]> = {}
  if (!name) fieldErrors.name = "Name is required."
  if (!description) fieldErrors.description = "Description is required."

  let basePrice = 0
  const priceValue = Number(priceRaw)
  if (!priceRaw || Number.isNaN(priceValue) || priceValue < 0) {
    fieldErrors.basePrice = "Enter a non-negative price."
  } else {
    basePrice = Math.round(priceValue * 100)
  }

  return { name, description, active, basePrice, productId, fieldErrors }
}

/** Create or update a service. Pass `id` for update, omit for create. */
export async function saveServiceAction(
  id: string | undefined,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { name, description, active, basePrice, productId, fieldErrors } =
    validateFields(formData)

  if (!id && !productId) {
    fieldErrors.productId = "Choose a product."
  }

  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return { errors: [], fieldErrors }
  }

  try {
    if (id) {
      const data: ServiceUpdateRequest = { name, description, active, basePrice }
      await updateService(id, data)
      revalidatePath(`/dashboard/catalog/services/${id}`)
      revalidatePath("/dashboard/catalog/services")
    } else {
      const data: ServiceRequest = { name, description, active, basePrice, productId }
      await createService(data)
      revalidatePath("/dashboard/catalog/services")
    }
    return { errors: [] }
  } catch (err) {
    const errors =
      (err as { errors?: string[] }).errors ?? [(err as Error).message ?? "An error occurred."]
    return { errors }
  }
}

export interface SpecActionState {
  errors: string[]
  fieldErrors?: {
    characteristicId?: string
    unitOfMeasure?: string
    price?: string
    valueFrom?: string
    valueTo?: string
    values?: string
  }
}

/** Attach a characteristic specification to a service. */
export async function addSpecAction(
  serviceId: string,
  _prev: SpecActionState,
  formData: FormData,
): Promise<SpecActionState> {
  const characteristicId = (formData.get("characteristicId") as string | null)?.trim() ?? ""
  const configurable = formData.get("configurable") === "on"
  const active = formData.get("active") === "on"
  const unitOfMeasure = (formData.get("unitOfMeasure") as string | null) ?? ""
  const priceRaw = (formData.get("price") as string | null)?.trim() ?? ""
  const isRange = formData.get("mode") === "range"

  const fieldErrors: NonNullable<SpecActionState["fieldErrors"]> = {}

  if (!characteristicId) fieldErrors.characteristicId = "Choose a characteristic."
  if (!unitOfMeasure) fieldErrors.unitOfMeasure = "Choose a unit of measure."

  let price = 0
  if (priceRaw) {
    const priceValue = Number(priceRaw)
    if (Number.isNaN(priceValue) || priceValue < 0) {
      fieldErrors.price = "Enter a non-negative price."
    } else {
      price = Math.round(priceValue * 100)
    }
  }

  let valueFrom: number | undefined
  let valueTo: number | undefined
  let characteristicValues: { value: string; isDefault: boolean }[] | undefined

  if (isRange) {
    const fromRaw = (formData.get("valueFrom") as string | null)?.trim() ?? ""
    const toRaw = (formData.get("valueTo") as string | null)?.trim() ?? ""
    const fromValue = Number(fromRaw)
    const toValue = Number(toRaw)
    if (!fromRaw || Number.isNaN(fromValue)) {
      fieldErrors.valueFrom = "Enter a starting value."
    } else {
      valueFrom = fromValue
    }
    if (!toRaw || Number.isNaN(toValue)) {
      fieldErrors.valueTo = "Enter an ending value."
    } else {
      valueTo = toValue
    }
    if (
      valueFrom !== undefined &&
      valueTo !== undefined &&
      valueFrom >= valueTo
    ) {
      fieldErrors.valueTo = "Ending value must be greater than the starting value."
    }
  } else {
    const rawValues = formData.getAll("valueOption").map((v) => (v as string).trim())
    const defaultIndexRaw = formData.get("defaultValueIndex") as string | null
    const defaultIndex = defaultIndexRaw !== null ? Number(defaultIndexRaw) : -1

    const nonEmpty = rawValues
      .map((value, index) => ({ value, index }))
      .filter(({ value }) => value.length > 0)

    if (nonEmpty.length === 0) {
      fieldErrors.values = "Add at least one value."
    } else {
      characteristicValues = nonEmpty.map(({ value, index }) => ({
        value,
        isDefault: index === defaultIndex,
      }))
      if (!characteristicValues.some((v) => v.isDefault)) {
        // Guard against malformed/tampered submissions where no option was marked default
        // (the form always sets one); ensures the request always has exactly one default.
        characteristicValues[0].isDefault = true
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { errors: [], fieldErrors }
  }

  const spec: CharacteristicSpecificationRequest = {
    characteristicId,
    configurable,
    range: isRange,
    unitOfMeasure: unitOfMeasure as CharacteristicSpecificationRequest["unitOfMeasure"],
    price,
    active,
    ...(isRange ? { valueFrom, valueTo } : { characteristicValues }),
  }

  try {
    await addServiceCharacteristics(serviceId, [spec])
    revalidatePath(`/dashboard/catalog/services/${serviceId}`)
    return { errors: [] }
  } catch (err) {
    const errors =
      (err as { errors?: string[] }).errors ?? [(err as Error).message ?? "An error occurred."]
    return { errors }
  }
}

/**
 * Remove an attached characteristic specification from a service.
 * `characteristicId` must be `spec.characteristic.id` (the underlying characteristic's id),
 * not `CharacteristicSpecificationDetailResponse.id` — confirmed via live API testing.
 */
export async function removeSpecAction(
  serviceId: string,
  characteristicId: string,
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    await removeServiceCharacteristics(serviceId, [characteristicId])
    revalidatePath(`/dashboard/catalog/services/${serviceId}`)
    return { errors: [] }
  } catch (err) {
    const errors =
      (err as { errors?: string[] }).errors ?? [(err as Error).message ?? "An error occurred."]
    return { errors }
  }
}

/** Delete a service by id. Redirects to the services listing on success. */
export async function deleteServiceAction(
  id: string,
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    await deleteService(id)
    revalidatePath("/dashboard/catalog/services")
  } catch (err) {
    const errors =
      (err as { errors?: string[] }).errors ?? [(err as Error).message ?? "An error occurred."]
    return { errors }
  }
  redirect("/dashboard/catalog/services")
}
