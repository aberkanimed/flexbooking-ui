"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

const navGroups = [
  {
    label: "Catalog",
    items: [
      { label: "Products", href: "/dashboard/catalog/products", icon: Package },
      { label: "Services", href: "/dashboard/catalog/services", icon: Wrench },
    ],
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map(({ label, href, icon: Icon }) => {
              const active = pathname === href
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/40 group-hover:text-sidebar-accent-foreground"
                      )}
                    />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
