import { TopHeader } from "@/components/dashboard/top-header"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col">
      <TopHeader />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex lg:w-56 lg:shrink-0 lg:flex-col border-r bg-sidebar">
          <SidebarNav />
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
