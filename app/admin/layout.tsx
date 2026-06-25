import { AdminProvider } from "@/components/admin/store"
import { AdminSidebar } from "@/components/admin/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <div className="flex min-h-screen bg-secondary/30">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col lg:pl-60">{children}</div>
      </div>
    </AdminProvider>
  )
}
