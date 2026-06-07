"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  createService,
  updateService,
  deleteService,
  type ServiceRequest,
  type ServiceUpdateRequest,
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
