"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, Wrench, CalendarCheck, UsersRound } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { label: "Products", href: "/dashboard/catalog/products", icon: Package },
  { label: "Services", href: "/dashboard/catalog/services", icon: Wrench },
  { label: "Bookings", href: "/dashboard/bookings", icon: CalendarCheck, disabled: true },
  { label: "Customers", href: "/dashboard/customers", icon: UsersRound, disabled: true },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="sm:hidden flex items-stretch border-t border-border bg-card/96 backdrop-blur-md px-2 pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Main"
    >
      {NAV.map(({ label, href, icon: Icon, disabled }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={disabled ? "#" : href}
            aria-disabled={disabled}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors duration-150",
              active ? "text-primary" : "text-muted-foreground",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <span
              className={cn(
                "w-12 h-[26px] rounded-full flex items-center justify-center transition-colors duration-150",
                active && "bg-primary-soft"
              )}
            >
              <Icon className="size-5" />
            </span>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
