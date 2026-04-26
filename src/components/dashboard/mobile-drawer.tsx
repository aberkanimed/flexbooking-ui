"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SidebarNav } from "./sidebar-nav"

export function MobileDrawer() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Open navigation" />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" showCloseButton className="p-0">
        <SidebarNav />
      </SheetContent>
    </Sheet>
  )
}
