"use client"

import { useState, useActionState, useMemo } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductFormSheet } from "@/components/catalog/product-form-sheet"
import { deleteProductAction, type ActionState } from "@/app/dashboard/catalog/products/actions"
import type { ProductDetailResponse } from "@/lib/api/catalog"

const initialState: ActionState = { errors: [] }

interface ProductHeroControlsProps {
  product: ProductDetailResponse
}

export function ProductHeroControls({ product }: ProductHeroControlsProps) {
  const [editOpen, setEditOpen] = useState(false)

  const boundDeleteAction = useMemo(() => deleteProductAction.bind(null, product.id), [product.id])
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    boundDeleteAction,
    initialState,
  )

  const canDelete = product.services.length === 0

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
        <form action={deleteFormAction}>
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={!canDelete || isDeletePending}
            aria-disabled={!canDelete}
          >
            <Trash2 className="size-3.5" />
            {isDeletePending ? "Deleting…" : "Delete"}
          </Button>
        </form>

        {/* Guard message */}
        {!canDelete && (
          <p className="text-[13px] text-muted-foreground">
            Remove its services before deleting this product.
          </p>
        )}
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
      <ProductFormSheet open={editOpen} onOpenChange={setEditOpen} product={product} />
    </>
  )
}
