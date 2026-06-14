"use client"

import { useState, useActionState, useMemo } from "react"
import { Pencil, Trash2 } from "lucide-react"
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
import { ServiceFormSheet } from "@/components/catalog/service-form-sheet"
import { deleteServiceAction, type ActionState } from "@/app/dashboard/catalog/services/actions"
import type { ServiceDetailResponse } from "@/lib/api/catalog"

const initialState: ActionState = { errors: [] }

interface ServiceHeroControlsProps {
  service: ServiceDetailResponse
}

export function ServiceHeroControls({ service }: ServiceHeroControlsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const boundDeleteAction = useMemo(() => deleteServiceAction.bind(null, service.id), [service.id])
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    boundDeleteAction,
    initialState,
  )

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Edit */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-3.5" />
          Edit
        </Button>

        {/* Delete */}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isDeletePending}
          onClick={() => setDeleteConfirmOpen(true)}
        >
          <Trash2 className="size-3.5" />
          {isDeletePending ? "Deleting…" : "Delete"}
        </Button>
      </div>

      {/* Delete error banner */}
      {deleteState.errors.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/8 px-3 py-2.5 text-sm text-destructive mt-2"
        >
          <ul className="list-inside list-disc space-y-0.5">
            {deleteState.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit sheet */}
      <ServiceFormSheet
        key={service?.id ?? "create"}
        open={editOpen}
        onOpenChange={setEditOpen}
        service={service}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{service.name}&quot; will be permanently removed. This cannot be undone.
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
    </>
  )
}
