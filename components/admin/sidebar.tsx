"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Database, FileText, Home, LayoutDashboard, Settings, Sparkles, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/admin", label: "需求管理", icon: FileText, exact: false },
  { href: "/admin/config", label: "系统配置", icon: Settings, exact: true },
  { href: "/admin/users", label: "用户与权限", icon: Users, exact: true },
  { href: "/admin/reuse", label: "数据复用接口", icon: Database, exact: true },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <>
      {/* 桌面侧边栏 */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">GEO 需求后台</p>
            <p className="text-[11px] text-sidebar-foreground/60">需求管理中心</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Home className="size-4" />
            返回客户填写页
          </Link>
        </div>
      </aside>

      {/* 移动端顶部条 */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="size-4" />
          <span className="text-sm font-semibold">GEO 需求后台</span>
        </div>
        <nav className="flex gap-1">
          {NAV.slice(0, 2).map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs",
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/70",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
