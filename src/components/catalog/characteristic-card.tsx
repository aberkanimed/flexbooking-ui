"use client"

import { useState, useActionState, useEffect, useMemo } from "react"
import { Pencil, Trash2, Tag } from "lucide-react"
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
import { CharacteristicFormSheet } from "@/components/catalog/characteristic-form-sheet"
import { deleteCharacteristicAction, type ActionState } from "@/app/dashboard/catalog/characteristics/actions"
import type { CharacteristicResponse } from "@/lib/api/catalog"
import { StatusPill } from "@/components/catalog/status-pill"

const initialState: ActionState = { errors: [] }

const VALUE_TYPE_LABELS: Record<CharacteristicResponse["valueType"], string> = {
  STRING: "String",
  NUMBER: "Number",
  BOOLEAN: "Boolean",
}

interface CharacteristicCardProps {
  characteristic: CharacteristicResponse
}

export function CharacteristicCard({ characteristic }: CharacteristicCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const boundDeleteAction = useMemo(
    () => deleteCharacteristicAction.bind(null, characteristic.id),
    [characteristic.id],
  )
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    boundDeleteAction,
    initialState,
  )

  // Close the confirmation dialog only after a successful delete (no errors,
  // not the initial empty state). Closing eagerly on click would unmount the
  // <form> — and the pending submission — before the server action runs.
  useEffect(() => {
    if (!isDeletePending && deleteState.errors.length === 0 && deleteState !== initialState) {
      queueMicrotask(() => setDeleteConfirmOpen(false))
    }
  }, [deleteState, isDeletePending])

  return (
    <div className="flex flex-col gap-3.5 rounded-3xl border border-border bg-card p-[18px] shadow-[var(--shadow-card)]">
      {/* Icon thumbnail + status pill */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-[50px] shrink-0 items-center justify-center rounded-[15px] bg-primary-soft text-primary">
          <Tag className="size-6" />
        </div>
        <StatusPill active={characteristic.active} />
      </div>

      {/* Name + description + value type */}
      <div>
        <h3 className="font-heading text-[17.5px] font-semibold leading-snug tracking-[-0.01em] text-card-foreground">
          {characteristic.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {characteristic.description}
        </p>
        <span className="mt-2 inline-flex items-center rounded-md border border-border px-2 py-0.5 text-[12px] font-medium tracking-wide text-muted-foreground">
          {VALUE_TYPE_LABELS[characteristic.valueType]}
        </span>
      </div>

      {/* Delete error banner */}
      {deleteState.errors.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
        >
          <ul className="list-inside list-disc space-y-0.5">
            {deleteState.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer — edit + delete icon buttons */}
      <div className="mt-auto flex items-center justify-end gap-1.5 pt-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${characteristic.name}`}
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${characteristic.name}`}
          disabled={isDeletePending}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setDeleteConfirmOpen(true)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* Edit sheet */}
      <CharacteristicFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        characteristic={characteristic}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{characteristic.name}&quot; will be deactivated and removed from this list. You can bring it back later by editing it and turning it active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <form action={deleteFormAction} className="w-full sm:w-auto">
              <AlertDialogAction
                type="submit"
                variant="destructive"
                disabled={isDeletePending}
                className="w-full sm:w-auto"
              >
                {isDeletePending ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
