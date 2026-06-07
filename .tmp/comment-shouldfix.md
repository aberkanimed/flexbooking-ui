**Code-review finding (should-fix) — `src/components/catalog/characteristic-card.tsx:129`**

The delete confirmation dialog text says "This will permanently delete \"{name}\". This action cannot be undone." — but per the new filter fix in `8300bdd`, delete is actually a soft-delete/deactivate (the record persists server-side and reappears if reactivated via edit). This copy now actively misleads operators: they'll believe the record is gone forever.

Recommend updating the copy to reflect the real behavior, e.g. "This removes \"{name}\" from your active catalog. You can restore it later by reactivating it." — consistent with Golden Rule #10 (operator-facing, accurate copy).
