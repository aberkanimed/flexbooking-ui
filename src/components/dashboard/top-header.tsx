import { CalendarRange } from "lucide-react"
import { MobileDrawer } from "./mobile-drawer"

export function TopHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur-sm lg:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <MobileDrawer />
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <CalendarRange className="size-[15px]" />
        </div>
        <span className="text-sm font-semibold tracking-tight">FlexBooking</span>
      </div>
    </header>
  )
}
