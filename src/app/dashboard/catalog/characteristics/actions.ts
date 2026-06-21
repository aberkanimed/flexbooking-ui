"use server"

import { revalidatePath } from "next/cache"
import {
  createCharacteristic,
  updateCharacteristic,
  deleteCharacteristic,
  type CharacteristicRequest,
} from "@/lib/api/catalog"
import { instrumentAction } from "@/lib/log"

export interface ActionState {
  errors: string[]
  fieldErrors?: { name?: string; description?: string; valueType?: string }
}

const VALUE_TYPES = ["STRING", "NUMBER", "BOOLEAN"] as const
type ValueType = (typeof VALUE_TYPES)[number]

function validateFields(formData: FormData): {
  data: CharacteristicRequest
  fieldErrors: ActionState["fieldErrors"]
} {
  const name = (formData.get("name") as string | null)?.trim() ?? ""
  const description = (formData.get("description") as string | null)?.trim() ?? ""
  const valueTypeRaw = (formData.get("valueType") as string | null)?.trim() ?? ""
  const active = formData.get("active") === "on"

  const fieldErrors: ActionState["fieldErrors"] = {}
  if (!name) fieldErrors.name = "Name is required."
  if (!description) fieldErrors.description = "Description is required."
  if (!VALUE_TYPES.includes(valueTypeRaw as ValueType)) {
    fieldErrors.valueType = "Value type is required."
  }

  const valueType = valueTypeRaw as ValueType

  return { data: { name, description, valueType, active }, fieldErrors }
}

/** Create or update a characteristic. Pass `id` for update, omit for create. */
export const saveCharacteristicAction = instrumentAction(
  "saveCharacteristic",
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
        await updateCharacteristic(id, data)
      } else {
        await createCharacteristic(data)
      }
      revalidatePath("/dashboard/catalog/characteristics")
      return { errors: [] }
    } catch (err) {
      const errors =
        (err as { errors?: string[] }).errors ?? [(err as Error).message ?? "An error occurred."]
      return { errors }
    }
  },
)

/** Delete a characteristic by id. Stays on the listing (no redirect). */
export const deleteCharacteristicAction = instrumentAction(
  "deleteCharacteristic",
  async (
    id: string,
    _prev: ActionState,
    _formData: FormData,
  ): Promise<ActionState> => {
    try {
      await deleteCharacteristic(id)
      revalidatePath("/dashboard/catalog/characteristics")
      return { errors: [] }
    } catch (err) {
      const errors =
        (err as { errors?: string[] }).errors ?? [(err as Error).message ?? "An error occurred."]
      return { errors }
    }
  },
)
