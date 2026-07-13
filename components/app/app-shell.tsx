"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Briefcase,
  FileEdit,
  FileText,
  FileSignature,
  LayoutDashboard,
  Lock,
  Menu,
  Settings,
  Sparkles,
  Target,
  Users,
  UserPlus,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ROLE_META, useRole, type Role, type SectionKey } from "./role-context"

const NAV: { key: SectionKey; href: string; label: string; desc: string; icon: typeof FileText }[] = [
  { key: "home", href: "/home", label: "首页工作台", desc: "待办与经营概览", icon: LayoutDashboard },
  { key: "leads", href: "/leads", label: "线索管理", desc: "承接与跟进线索", icon: UserPlus },
  { key: "customers", href: "/customers", label: "客户管理", desc: "客户与联系人档案", icon: Users },
  { key: "requests", href: "/requests", label: "需求管理", desc: "需求收集与确认", icon: FileText },
  { key: "opportunities", href: "/opportunities", label: "商机管理", desc: "销售机会推进", icon: Target },
  { key: "contracts", href: "/contracts", label: "合同管理", desc: "签约与合同信息", icon: FileSignature },
  { key: "dashboard", href: "/dashboard", label: "数据看板", desc: "经营数据统计", icon: Briefcase },
  { key: "intake", href: "/intake", label: "客户需求填报", desc: "填写并提交需求", icon: FileEdit },
  { key: "settings", href: "/settings", label: "系统设置", desc: "人员、权限与配置", icon: Settings },
]

function sectionOf(pathname: string): SectionKey {
  if (pathname.startsWith("/home")) return "home"
  if (pathname.startsWith("/leads")) return "leads"
  if (pathname.startsWith("/customers")) return "customers"
  if (pathname.startsWith("/requests")) return "requests"
  if (pathname.startsWith("/opportunities")) return "opportunities"
  if (pathname.startsWith("/contracts")) return "contracts"
  if (pathname.startsWith("/dashboard")) return "dashboard"
  if (pathname.startsWith("/settings")) return "settings"
  return "intake"
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { role, setRole, canAccess } = useRole()
  const [mobileOpen, setMobileOpen] = useState(false)
  const current = sectionOf(pathname)
  const allowed = canAccess(current)

  const visibleNav = NAV.filter((n) => ROLE_META[role].sections.includes(n.key))

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Sparkles className="size-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">GEO 客户经营平台</p>
          <p className="text-[11px] text-sidebar-foreground/60">线索 · 客户 · 商机 · 合同</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 p-3">
        {visibleNav.map((item) => {
          const active = current === item.key
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="mt-0.5 size-4 shrink-0" />
              <span className="leading-tight">
                <span className="block font-medium">{item.label}</span>
                <span
                  className={cn(
                    "block text-[11px]",
                    active ? "text-sidebar-primary-foreground/75" : "text-sidebar-foreground/50",
                  )}
                >
                  {item.desc}
                </span>
              </span>
            </Link>
          )
        })}
      </nav>

      {/* 角色切换（演示用） */}
      <div className="border-t border-sidebar-border p-3">
        <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wide text-sidebar-foreground/50">
          当前身份（演示切换）
        </p>
        <div className="space-y-1">
          {(Object.keys(ROLE_META) as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                role === r
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60",
              )}
            >
              <span className="leading-tight">
                <span className="block font-medium">{ROLE_META[r].label}</span>
                <span className="block text-[11px] text-sidebar-foreground/50">{ROLE_META[r].desc}</span>
              </span>
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  role === r ? "bg-sidebar-primary" : "bg-transparent ring-1 ring-sidebar-foreground/30",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* 桌面侧边栏 */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block print:hidden">
        {sidebar}
      </aside>

      {/* 移动端顶部条 */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden print:hidden">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4" />
          <span className="text-sm font-semibold">GEO 客户经营平台</span>
        </div>
        <button onClick={() => setMobileOpen(true)} aria-label="打开菜单">
          <Menu className="size-5" />
        </button>
      </div>

      {/* 移动端抽屉 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-sidebar text-sidebar-foreground">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 text-sidebar-foreground/70"
              aria-label="关闭菜单"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      {/* 内容区 */}
      <div className="lg:pl-64 print:pl-0">
        {allowed ? children : <AccessDenied section={current} />}
      </div>
    </div>
  )
}

function AccessDenied({ section }: { section: SectionKey }) {
  const label = NAV.find((n) => n.key === section)?.label ?? "该页面"
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Lock className="size-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">无访问权限</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          当前身份无法访问「{label}」。请在左下角切换为有权限的身份后再试。
        </p>
      </div>
      <Link
        href="/intake"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        返回客户需求填报
      </Link>
    </div>
  )
}
