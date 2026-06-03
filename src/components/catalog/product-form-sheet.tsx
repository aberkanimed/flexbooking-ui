"use client"

import { useActionState, useEffect, useMemo } from "react"
import type { ProductResponse } from "@/lib/api/catalog"
import { saveProductAction, type ActionState } from "@/app/dashboard/catalog/products/actions"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const initialState: ActionState = { errors: [] }

interface ProductFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass an existing product to enable edit mode; omit for create mode. */
  product?: ProductResponse
}

export function ProductFormSheet({ open, onOpenChange, product }: ProductFormSheetProps) {
  const isEdit = Boolean(product)

  const boundAction = useMemo(() => saveProductAction.bind(null, product?.id), [product?.id])
  const [state, formAction, isPending] = useActionState(boundAction, initialState)

  // Close the sheet on successful save (no errors, not the initial empty state)
  useEffect(() => {
    if (
      !isPending &&
      state.errors.length === 0 &&
      !state.fieldErrors &&
      state !== initialState
    ) {
      onOpenChange(false)
    }
  }, [state, isPending, onOpenChange])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle>{isEdit ? "Edit product" : "Add a product"}</SheetTitle>
        </SheetHeader>

        <form action={formAction} className="flex flex-col gap-5 px-4 py-2 flex-1">
          {/* Server-error banner */}
          {state.errors.length > 0 && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
            >
              <ul className="list-inside list-disc space-y-0.5">
                {state.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-name">Name</Label>
            <Input
              id="pf-name"
              name="name"
              placeholder="e.g. Window cleaning"
              defaultValue={product?.name ?? ""}
              aria-invalid={Boolean(state.fieldErrors?.name)}
              aria-describedby={state.fieldErrors?.name ? "pf-name-err" : undefined}
              disabled={isPending}
            />
            {state.fieldErrors?.name && (
              <p id="pf-name-err" className="text-[13px] text-destructive">
                {state.fieldErrors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-desc">Description</Label>
            <Textarea
              id="pf-desc"
              name="description"
              placeholder="Brief description for your operators"
              defaultValue={product?.description ?? ""}
              aria-invalid={Boolean(state.fieldErrors?.description)}
              aria-describedby={
                state.fieldErrors?.description ? "pf-desc-err" : undefined
              }
              disabled={isPending}
            />
            {state.fieldErrors?.description && (
              <p id="pf-desc-err" className="text-[13px] text-destructive">
                {state.fieldErrors.description}
              </p>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="pf-active" className="cursor-pointer">
              Active
            </Label>
            <Switch
              id="pf-active"
              name="active"
              defaultChecked={product ? product.active : true}
              disabled={isPending}
            />
          </div>

          <SheetFooter className="px-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save changes"
                  : "Create product"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
