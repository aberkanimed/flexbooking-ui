"use client"

import { useActionState, useEffect, useMemo } from "react"
import type { CharacteristicResponse } from "@/lib/api/catalog"
import { saveCharacteristicAction, type ActionState } from "@/app/dashboard/catalog/characteristics/actions"
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

interface CharacteristicFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass an existing characteristic to enable edit mode; omit for create mode. */
  characteristic?: CharacteristicResponse
}

export function CharacteristicFormSheet({
  open,
  onOpenChange,
  characteristic,
}: CharacteristicFormSheetProps) {
  const isEdit = Boolean(characteristic)

  const boundAction = useMemo(
    () => saveCharacteristicAction.bind(null, characteristic?.id),
    [characteristic?.id],
  )
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
          <SheetTitle>
            {isEdit ? "Edit characteristic" : "Add a characteristic"}
          </SheetTitle>
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
            <Label htmlFor="cf-name">Name</Label>
            <Input
              id="cf-name"
              name="name"
              placeholder="e.g. Surface area"
              defaultValue={characteristic?.name ?? ""}
              aria-invalid={Boolean(state.fieldErrors?.name)}
              aria-describedby={state.fieldErrors?.name ? "cf-name-err" : undefined}
              disabled={isPending}
            />
            {state.fieldErrors?.name && (
              <p id="cf-name-err" className="text-[13px] text-destructive">
                {state.fieldErrors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cf-desc">Description</Label>
            <Textarea
              id="cf-desc"
              name="description"
              placeholder="Brief description for your operators"
              defaultValue={characteristic?.description ?? ""}
              aria-invalid={Boolean(state.fieldErrors?.description)}
              aria-describedby={
                state.fieldErrors?.description ? "cf-desc-err" : undefined
              }
              disabled={isPending}
            />
            {state.fieldErrors?.description && (
              <p id="cf-desc-err" className="text-[13px] text-destructive">
                {state.fieldErrors.description}
              </p>
            )}
          </div>

          {/* Value type */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cf-value-type">Value type</Label>
            <Select
              name="valueType"
              defaultValue={characteristic?.valueType}
              disabled={isPending}
            >
              <SelectTrigger
                id="cf-value-type"
                className="w-full"
                aria-invalid={Boolean(state.fieldErrors?.valueType)}
                aria-describedby={state.fieldErrors?.valueType ? "cf-value-type-err" : undefined}
              >
                <SelectValue placeholder="Select a value type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STRING">String</SelectItem>
                <SelectItem value="NUMBER">Number</SelectItem>
                <SelectItem value="BOOLEAN">Boolean</SelectItem>
              </SelectContent>
            </Select>
            {state.fieldErrors?.valueType && (
              <p id="cf-value-type-err" className="text-[13px] text-destructive">
                {state.fieldErrors.valueType}
              </p>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="cf-active" className="cursor-pointer">
              Active
            </Label>
            <Switch
              id="cf-active"
              name="active"
              defaultChecked={characteristic ? characteristic.active : true}
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
                  : "Create characteristic"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
