"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Search, Bell, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { FlexBookingLogoMark } from "@/components/ui/flex-booking-logo"

const NAV = [
  { label: "Products", href: "/dashboard/catalog/products" },
  { label: "Services", href: "/dashboard/catalog/services" },
  { label: "Items", href: "/dashboard/catalog/characteristics" },
  { label: "Bookings", href: "/dashboard/bookings", disabled: true },
  { label: "Customers", href: "/dashboard/customers", disabled: true },
]


export function TopHeader() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const isCatalog = pathname.startsWith("/dashboard/catalog/")

  function closeSearch() {
    setSearchOpen(false)
  }

  return (
    <header className="z-40 flex shrink-0 flex-col border-b border-border/60 bg-background/92 backdrop-blur-sm">
      {/* â”€â”€ Main bar â”€â”€ */}
      <div className="flex h-[60px] items-center gap-3 px-4 lg:h-[68px] lg:gap-5 lg:px-8">
        {/* Logo + wordmark */}
        <div className="flex shrink-0 items-center gap-2.5">
          <FlexBookingLogoMark size={32} />
          {/*
            - Mobile (<sm):  wordmark visible (no nav in topbar, it's at the bottom)
            - Tablet (smâ€“lg): wordmark hidden (nav tabs need the space)
            - Laptop (lg+):  wordmark visible again alongside full nav
          */}
          <span className="inline font-heading text-[19px] font-bold tracking-[-0.02em] sm:hidden lg:inline">
            Flex<span className="text-primary">Booking</span>
          </span>
        </div>

        {/* Top nav tabs â€” hidden on mobile (bottom nav), shown sm+ */}
        {!searchOpen && (
          <nav className="hidden sm:flex items-center gap-0.5 ml-1.5" aria-label="Main">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.disabled ? "#" : n.href}
                aria-disabled={n.disabled}
                className={cn(
                  "h-9 px-3 lg:px-4 rounded-full text-[14px] lg:text-[14.5px] font-semibold transition-colors duration-150 inline-flex items-center whitespace-nowrap",
                  pathname === n.href
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary-tint",
                  n.disabled && "pointer-events-none opacity-50"
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Inline search field â€” tablet/laptop only, when search is open */}
          {isCatalog && searchOpen && (
            <label className="hidden sm:flex items-center gap-2.5 h-[42px] w-[230px] lg:w-[280px] cursor-text rounded-full border border-border bg-card px-4">
              <Search className="size-[17px] shrink-0 text-muted-foreground" />
              <input
                autoFocus
                className="min-w-0 flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Search catalogâ€¦"
              />
            </label>
          )}

          {/* Search toggle */}
          {isCatalog && (
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={searchOpen ? "Close search" : "Search catalog"}
              aria-pressed={searchOpen}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full border transition-colors duration-150",
                searchOpen
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card hover:border-primary-soft hover:bg-primary-tint"
              )}
            >
              {searchOpen ? <X className="size-[18px]" /> : <Search className="size-[18px]" />}
            </button>
          )}

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card transition-colors duration-150 hover:border-primary-soft hover:bg-primary-tint"
          >
            <Bell className="size-[18px]" />
          </button>

          {/* Avatar */}
          <div className="inline-flex size-10 shrink-0 select-none items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            AB
          </div>
        </div>
      </div>

      {/* â”€â”€ Mobile search row â€” drops below topbar, mobile only â”€â”€ */}
      {isCatalog && searchOpen && (
        <div className="px-4 pb-3 sm:hidden">
          <label className="flex cursor-text items-center gap-2.5 rounded-full border border-border bg-card px-4 h-11">
            <Search className="size-[17px] shrink-0 text-muted-foreground" />
            <input
              autoFocus
              className="min-w-0 flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Search your catalogâ€¦"
            />
            <button
              onClick={closeSearch}
              aria-label="Close search"
              className="shrink-0 text-muted-foreground"
            >
              <X className="size-[18px]" />
            </button>
          </label>
        </div>
      )}
    </header>
  )
}
