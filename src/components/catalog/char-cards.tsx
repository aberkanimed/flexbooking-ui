"use client"

import { useEffect, useMemo, useState } from "react"
import { useActionState } from "react"
import { Check, SlidersHorizontal, Type, Hash, ToggleLeft, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { removeSpecAction, type ActionState } from "@/app/dashboard/catalog/services/actions"
import type { CharacteristicSpecificationDetailResponse } from "@/lib/api/catalog"

const initialRemoveState: ActionState = { errors: [] }

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })
const money = (cents: number) => usd.format(cents / 100)

const UNIT_SUFFIX: Record<string, string> = {
  UNIT: "unit",
  SQUARE_FOOTAGE: "sq ft",
  HOUR: "hr",
  MINUTE: "min",
  NONE: "",
}

const VALUE_TYPE_META = {
  STRING: { label: "Text", Icon: Type },
  NUMBER: { label: "Number", Icon: Hash },
  BOOLEAN: { label: "Yes · no", Icon: ToggleLeft },
}

function VTypeBadge({ type }: { type: "STRING" | "NUMBER" | "BOOLEAN" }) {
  const meta = VALUE_TYPE_META[type] ?? VALUE_TYPE_META.STRING
  return (
    <span className="inline-flex items-center gap-1 h-[22px] px-2.5 rounded-full bg-muted border border-border text-[11.5px] font-semibold text-muted-foreground whitespace-nowrap">
      <meta.Icon className="size-3 text-muted-foreground" />
      {meta.label}
    </span>
  )
}

function CharConfig({ spec }: { spec: CharacteristicSpecificationDetailResponse }) {
  if (spec.range) {
    const unit = UNIT_SUFFIX[spec.unitOfMeasure] ?? ""
    return (
      <span className="inline-flex items-center gap-2">
        <span className="font-heading font-bold text-[14px] tabular-nums px-2.5 py-0.5 rounded-[9px] bg-muted border border-border text-foreground">
          {spec.valueFrom?.toLocaleString()}
        </span>
        <span className="w-11 h-[3px] rounded-full bg-gradient-to-r from-primary-soft to-primary shrink-0" />
        <span className="font-heading font-bold text-[14px] tabular-nums px-2.5 py-0.5 rounded-[9px] bg-muted border border-border text-foreground">
          {spec.valueTo?.toLocaleString()}
        </span>
        {unit && <span className="text-[12.5px] text-muted-foreground font-semibold">{unit}</span>}
      </span>
    )
  }
  if (spec.values && spec.values.length > 0) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {spec.values.map((v, i) => (
          <span
            key={i}
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[12.5px] font-semibold",
              v.isDefault
                ? "border-[var(--status-active-bg)] bg-[var(--status-active-bg)] text-[var(--status-active-fg)]"
                : "border-border bg-background text-muted-foreground"
            )}
          >
            {v.isDefault && <Check className="size-3 text-[var(--status-active-fg)]" />}
            {v.value}
          </span>
        ))}
      </div>
    )
  }
  return <span className="text-[13px] text-muted-foreground font-semibold">—</span>
}

function Addon({ spec }: { spec: CharacteristicSpecificationDetailResponse }) {
  if (!spec.price) {
    return (
      <span className="text-[13px] font-semibold" style={{ color: "var(--status-active-fg)" }}>
        Included
      </span>
    )
  }
  const unit = UNIT_SUFFIX[spec.unitOfMeasure] ?? ""
  const per = unit ? `/ ${unit}` : ""
  return (
    <span className="font-heading font-bold text-[14px] tabular-nums tracking-[-0.01em] text-foreground">
      +{money(spec.price)}{" "}
      {per && <span className="font-sans text-[11.5px] font-semibold text-muted-foreground tracking-normal">{per}</span>}
    </span>
  )
}

function RemoveSpecControl({
  serviceId,
  spec,
}: {
  serviceId: string
  spec: CharacteristicSpecificationDetailResponse
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const boundRemoveAction = useMemo(
    () => removeSpecAction.bind(null, serviceId, spec.id),
    [serviceId, spec.id],
  )
  const [removeState, removeFormAction, isRemovePending] = useActionState(
    boundRemoveAction,
    initialRemoveState,
  )

  // Close the confirmation dialog only after a successful removal (no errors,
  // not the initial empty state). Closing eagerly on click would unmount the
  // <form> — and the pending submission — before the server action runs.
  useEffect(() => {
    if (!isRemovePending && removeState.errors.length === 0 && removeState !== initialRemoveState) {
      queueMicrotask(() => setConfirmOpen(false))
    }
  }, [removeState, isRemovePending])

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove ${spec.characteristic.name}`}
        disabled={isRemovePending}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{spec.characteristic.name}&quot; will be removed from this service. This action is permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {removeState.errors.length > 0 && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
            >
              <ul className="list-inside list-disc space-y-0.5">
                {removeState.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <AlertDialogFooter className="flex-col sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <form action={removeFormAction} className="w-full sm:w-auto">
              <AlertDialogAction
                type="submit"
                variant="destructive"
                disabled={isRemovePending}
                className="w-full sm:w-auto"
              >
                {isRemovePending ? "Removing…" : "Remove"}
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function CharCards({
  serviceId,
  specs,
  cardBg = "bg-background",
}: {
  serviceId: string
  specs: CharacteristicSpecificationDetailResponse[]
  cardBg?: string
}) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(248px, 1fr))" }}>
      {specs.map((spec) => (
        <div
          key={spec.id}
          className={cn(
            "flex flex-col gap-2.5 rounded-2xl border border-border p-[15px_15px_14px]",
            cardBg
          )}
        >
          <div className="flex items-start justify-between gap-2.5">
            <span className="text-[14.5px] font-semibold text-foreground leading-snug">
              {spec.characteristic.name}
            </span>
            <VTypeBadge type={spec.characteristic.valueType} />
          </div>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed">
            {spec.characteristic.description}
          </p>
          <CharConfig spec={spec} />
          <div className="flex items-center justify-between gap-2.5 mt-auto pt-2.5 border-t border-border">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
              {spec.configurable ? (
                <span className="inline-flex items-center gap-1 h-[22px] px-2 rounded-full bg-primary-tint text-accent-foreground text-[11.5px] font-bold">
                  <SlidersHorizontal className="size-[11px]" />
                  Configurable
                </span>
              ) : (
                "Fixed"
              )}
            </span>
            <div className="flex items-center gap-1">
              <Addon spec={spec} />
              <RemoveSpecControl serviceId={serviceId} spec={spec} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
