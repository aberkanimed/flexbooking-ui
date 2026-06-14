"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductRequest,
} from "@/lib/api/catalog"
import { instrumentAction } from "@/lib/log"

export interface ActionState {
  errors: string[]
  fieldErrors?: { name?: string; description?: string }
}

function validateFields(formData: FormData): {
  data: ProductRequest
  fieldErrors: ActionState["fieldErrors"]
} {
  const name = (formData.get("name") as string | null)?.trim() ?? ""
  const description = (formData.get("description") as string | null)?.trim() ?? ""
  const active = formData.get("active") === "on"

  const fieldErrors: ActionState["fieldErrors"] = {}
  if (!name) fieldErrors.name = "Name is required."
  if (!description) fieldErrors.description = "Description is required."

  return { data: { name, description, active }, fieldErrors }
}

/** Create or update a product. Pass `id` for update, omit for create. */
export const saveProductAction = instrumentAction(
  "saveProduct",
  async (
    id: string | undefined,
    _prev: ActionState,
    formData: FormData,
  ): Promise<ActionState> => {
    const { data, fieldErrors } = validateFields(formData)

    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      return { errors: [], fieldErrors }
    }

    try {
      if (id) {
        await updateProduct(id, data)
        revalidatePath(`/dashboard/catalog/products/${id}`)
        revalidatePath("/dashboard/catalog/products")
      } else {
        await createProduct(data)
        revalidatePath("/dashboard/catalog/products")
      }
      return { errors: [] }
    } catch (err) {
      const errors =
        (err as { errors?: string[] }).errors ?? [(err as Error).message ?? "An error occurred."]
      return { errors }
    }
  },
)

/** Delete a product by id. Redirects to the products listing on success. */
export const deleteProductAction = instrumentAction(
  "deleteProduct",
  async (
    id: string,
    _prev: ActionState,
    _formData: FormData,
  ): Promise<ActionState> => {
    try {
      await deleteProduct(id)
      revalidatePath("/dashboard/catalog/products")
    } catch (err) {
      const errors =
        (err as { errors?: string[] }).errors ?? [(err as Error).message ?? "An error occurred."]
      return { errors }
    }
    redirect("/dashboard/catalog/products")
  },
)
