"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import type { ProductResponse, ServiceResponse } from "@/lib/api/catalog"
import { saveServiceAction, type ActionState } from "@/app/dashboard/catalog/services/actions"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const initialState: ActionState = { errors: [] }

interface ServiceFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass an existing service to enable edit mode; omit for create mode. */
  service?: ServiceResponse
  /** Products for the picker — only shown (and required) in create mode. */
  products?: ProductResponse[]
}

export function ServiceFormSheet({ open, onOpenChange, service, products = [] }: ServiceFormSheetProps) {
  const isEdit = Boolean(service)

  // Controlled active toggle — keep it in sync with the service being edited
  // so Switch never flips from uncontrolled to controlled. Reset the value
  // during render (not in an effect) whenever the sheet starts editing a
  // different service — the React-recommended way to derive state from
  // changing props without cascading effects.
  const defaultActive = service ? service.active : true
  const [active, setActive] = useState(defaultActive)
  const [activeFor, setActiveFor] = useState(service?.id)
  if (activeFor !== service?.id) {
    setActiveFor(service?.id)
    setActive(defaultActive)
  }

  const boundAction = useMemo(() => saveServiceAction.bind(null, service?.id), [service?.id])
  const [state, formAction, isPending] = useActionState(boundAction, initialState)

  // Close the sheet on successful save (no errors, not the initial empty state)
  useEffect(() => {
    if (
      !isPending &&
      state.errors.length === 0 &&
      !state.fieldErrors &&
      state !== initialState
    ) {
      queueMicrotask(() => onOpenChange(false))
    }
  }, [state, isPending, onOpenChange])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle>{isEdit ? "Edit service" : "Add a service"}</SheetTitle>
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

          {/* Product picker — create mode only */}
          {!isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sf-product">Product</Label>
              <Select name="productId" disabled={isPending}>
                <SelectTrigger
                  id="sf-product"
                  className="w-full"
                  aria-invalid={Boolean(state.fieldErrors?.productId)}
                  aria-describedby={state.fieldErrors?.productId ? "sf-product-err" : undefined}
                >
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.fieldErrors?.productId && (
                <p id="sf-product-err" className="text-[13px] text-destructive">
                  {state.fieldErrors.productId}
                </p>
              )}
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sf-name">Name</Label>
            <Input
              id="sf-name"
              name="name"
              placeholder="e.g. Window cleaning"
              defaultValue={service?.name ?? ""}
              aria-invalid={Boolean(state.fieldErrors?.name)}
              aria-describedby={state.fieldErrors?.name ? "sf-name-err" : undefined}
              disabled={isPending}
            />
            {state.fieldErrors?.name && (
              <p id="sf-name-err" className="text-[13px] text-destructive">
                {state.fieldErrors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sf-desc">Description</Label>
            <Textarea
              id="sf-desc"
              name="description"
              placeholder="Brief description for your operators"
              defaultValue={service?.description ?? ""}
              aria-invalid={Boolean(state.fieldErrors?.description)}
              aria-describedby={
                state.fieldErrors?.description ? "sf-desc-err" : undefined
              }
              disabled={isPending}
            />
            {state.fieldErrors?.description && (
              <p id="sf-desc-err" className="text-[13px] text-destructive">
                {state.fieldErrors.description}
              </p>
            )}
          </div>

          {/* Base price */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sf-price">Base price (USD)</Label>
            <Input
              id="sf-price"
              name="basePrice"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              defaultValue={service ? (service.basePrice / 100).toFixed(2) : ""}
              aria-invalid={Boolean(state.fieldErrors?.basePrice)}
              aria-describedby={state.fieldErrors?.basePrice ? "sf-price-err" : undefined}
              disabled={isPending}
            />
            {state.fieldErrors?.basePrice && (
              <p id="sf-price-err" className="text-[13px] text-destructive">
                {state.fieldErrors.basePrice}
              </p>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="sf-active" className="cursor-pointer">
              Active
            </Label>
            <Switch
              id="sf-active"
              name="active"
              checked={active}
              onCheckedChange={setActive}
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
                  : "Create service"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
