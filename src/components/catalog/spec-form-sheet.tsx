"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import { Plus, Trash2, Check } from "lucide-react"
import type { CharacteristicResponse, CharacteristicSpecificationDetailResponse } from "@/lib/api/catalog"
import { addSpecAction, type SpecActionState } from "@/app/dashboard/catalog/services/actions"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
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
import { cn } from "@/lib/utils"

// Defined locally (not exported from the `"use server"` actions module — only async
// function exports survive that boundary; a plain const would resolve to `undefined`
// on the client and crash `useActionState`'s SSR initial-state resolution).
const initialSpecState: SpecActionState = { errors: [] }

interface SpecFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceId: string
  /** Active characteristics not already attached to this service. */
  availableCharacteristics: CharacteristicResponse[]
  attached: CharacteristicSpecificationDetailResponse[]
}

export function SpecFormSheet({
  open,
  onOpenChange,
  serviceId,
  availableCharacteristics,
}: SpecFormSheetProps) {
  const [characteristicId, setCharacteristicId] = useState("")
  const [configurable, setConfigurable] = useState(true)
  const [active, setActive] = useState(true)
  const [mode, setMode] = useState<"range" | "values">("values")
  const [values, setValues] = useState<string[]>(["", ""])
  const [defaultIndex, setDefaultIndex] = useState(0)

  const boundAction = useMemo(() => addSpecAction.bind(null, serviceId), [serviceId])
  const [state, formAction, isPending] = useActionState(boundAction, initialSpecState)

  // Reset local form state each time the sheet is opened (instead of remounting via
  // `key`, which breaks `useActionState`'s SSR initial-state resolution).
  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setCharacteristicId("")
        setConfigurable(true)
        setActive(true)
        setMode("values")
        setValues(["", ""])
        setDefaultIndex(0)
      })
    }
  }, [open])

  // Close the sheet on successful attach (no errors, not the initial empty state)
  useEffect(() => {
    if (
      !isPending &&
      state.errors.length === 0 &&
      !state.fieldErrors &&
      state !== initialSpecState
    ) {
      queueMicrotask(() => onOpenChange(false))
    }
  }, [state, isPending, onOpenChange])

  const addValueRow = () => setValues((prev) => [...prev, ""])
  const removeValueRow = (index: number) => {
    setValues((prev) => prev.filter((_, i) => i !== index))
    setDefaultIndex((prev) => {
      if (index === prev) return 0
      if (index < prev) return prev - 1
      return prev
    })
  }
  const updateValueRow = (index: number, value: string) => {
    setValues((prev) => prev.map((v, i) => (i === index ? value : v)))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle>Add an item</SheetTitle>
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

          {/* Item */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sf-item">Item</Label>
            <Select
              name="characteristicId"
              value={characteristicId}
              onValueChange={(v) => setCharacteristicId(v ?? "")}
              disabled={isPending}
            >
              <SelectTrigger
                id="sf-item"
                className="w-full"
                aria-invalid={Boolean(state.fieldErrors?.characteristicId)}
                aria-describedby={
                  state.fieldErrors?.characteristicId ? "sf-item-err" : undefined
                }
              >
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent>
                {availableCharacteristics.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors?.characteristicId && (
              <p id="sf-item-err" className="text-[13px] text-destructive">
                {state.fieldErrors.characteristicId}
              </p>
            )}
          </div>

          {/* Configurable toggle */}
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="sf-configurable" className="cursor-pointer">
              Configurable
            </Label>
            <Switch
              id="sf-configurable"
              name="configurable"
              checked={configurable}
              onCheckedChange={setConfigurable}
              disabled={isPending}
            />
          </div>

          {/* Unit of measure */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sf-unit">Unit of measure</Label>
            <Select name="unitOfMeasure" defaultValue="NONE" disabled={isPending}>
              <SelectTrigger
                id="sf-unit"
                className="w-full"
                aria-invalid={Boolean(state.fieldErrors?.unitOfMeasure)}
                aria-describedby={state.fieldErrors?.unitOfMeasure ? "sf-unit-err" : undefined}
              >
                <SelectValue placeholder="Select a unit of measure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNIT">Unit</SelectItem>
                <SelectItem value="SQUARE_FOOTAGE">Square footage</SelectItem>
                <SelectItem value="HOUR">Hour</SelectItem>
                <SelectItem value="MINUTE">Minute</SelectItem>
                <SelectItem value="NONE">None</SelectItem>
              </SelectContent>
            </Select>
            {state.fieldErrors?.unitOfMeasure && (
              <p id="sf-unit-err" className="text-[13px] text-destructive">
                {state.fieldErrors.unitOfMeasure}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sf-price">Add-on price</Label>
            <Input
              id="sf-price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              aria-invalid={Boolean(state.fieldErrors?.price)}
              aria-describedby={state.fieldErrors?.price ? "sf-price-err" : undefined}
              disabled={isPending}
            />
            <p className="text-[12.5px] text-muted-foreground">
              Leave at 0.00 if this item is included with the service.
            </p>
            {state.fieldErrors?.price && (
              <p id="sf-price-err" className="text-[13px] text-destructive">
                {state.fieldErrors.price}
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

          {/* Range vs values toggle */}
          <div className="flex flex-col gap-1.5">
            <Label>Configuration type</Label>
            <input type="hidden" name="mode" value={mode} />
            <div className="inline-flex rounded-[12px] border border-border bg-muted p-1 gap-1 self-start">
              <button
                type="button"
                onClick={() => setMode("values")}
                disabled={isPending}
                className={cn(
                  "h-8 px-3.5 rounded-[9px] text-[13px] font-semibold transition-colors",
                  mode === "values"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Value set
              </button>
              <button
                type="button"
                onClick={() => setMode("range")}
                disabled={isPending}
                className={cn(
                  "h-8 px-3.5 rounded-[9px] text-[13px] font-semibold transition-colors",
                  mode === "range"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Numeric range
              </button>
            </div>
          </div>

          {mode === "range" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sf-from">From</Label>
                <Input
                  id="sf-from"
                  name="valueFrom"
                  type="number"
                  step="any"
                  aria-invalid={Boolean(state.fieldErrors?.valueFrom)}
                  aria-describedby={state.fieldErrors?.valueFrom ? "sf-from-err" : undefined}
                  disabled={isPending}
                />
                {state.fieldErrors?.valueFrom && (
                  <p id="sf-from-err" className="text-[13px] text-destructive">
                    {state.fieldErrors.valueFrom}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sf-to">To</Label>
                <Input
                  id="sf-to"
                  name="valueTo"
                  type="number"
                  step="any"
                  aria-invalid={Boolean(state.fieldErrors?.valueTo)}
                  aria-describedby={state.fieldErrors?.valueTo ? "sf-to-err" : undefined}
                  disabled={isPending}
                />
                {state.fieldErrors?.valueTo && (
                  <p id="sf-to-err" className="text-[13px] text-destructive">
                    {state.fieldErrors.valueTo}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <input type="hidden" name="defaultValueIndex" value={defaultIndex} />
              {values.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDefaultIndex(index)}
                    disabled={isPending}
                    title="Mark as default"
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border text-[12.5px] font-semibold transition-colors",
                      defaultIndex === index
                        ? "border-[var(--status-active-bg)] bg-[var(--status-active-bg)] text-[var(--status-active-fg)]"
                        : "border-border bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {defaultIndex === index ? <Check className="size-3.5" /> : index + 1}
                  </button>
                  <Input
                    name="valueOption"
                    value={value}
                    onChange={(e) => updateValueRow(index, e.target.value)}
                    placeholder={`Value ${index + 1}`}
                    disabled={isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeValueRow(index)}
                    disabled={isPending || values.length <= 1}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addValueRow}
                disabled={isPending}
                className="self-start"
              >
                <Plus className="size-3.5" />
                Add value
              </Button>
              <p className="text-[12.5px] text-muted-foreground">
                Pick the circle next to a value to mark it as the default.
              </p>
              {state.fieldErrors?.values && (
                <p className="text-[13px] text-destructive">{state.fieldErrors.values}</p>
              )}
            </div>
          )}

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
              {isPending ? "Adding…" : "Add item"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
