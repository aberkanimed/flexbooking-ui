"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, Wrench, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { label: "Products", href: "/dashboard/catalog/products", icon: Package },
  { label: "Services", href: "/dashboard/catalog/services", icon: Wrench },
  { label: "Characteristics", href: "/dashboard/catalog/characteristics", icon: Tag },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="sm:hidden flex items-stretch border-t border-border bg-card/96 backdrop-blur-md px-2 pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Main"
    >
      {NAV.map(({ label, href, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors duration-150",
              active ? "text-primary" : "text-muted-foreground"
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
