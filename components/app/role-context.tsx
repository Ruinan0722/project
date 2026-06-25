"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Role = "customer" | "staff" | "admin"

export type SectionKey = "intake" | "requests" | "settings"

export const ROLE_META: Record<
  Role,
  { label: string; desc: string; sections: SectionKey[] }
> = {
  customer: {
    label: "客户",
    desc: "仅可填写并提交自己的需求",
    sections: ["intake"],
  },
  staff: {
    label: "内部人员",
    desc: "可填报并管理所有客户需求",
    sections: ["intake", "requests"],
  },
  admin: {
    label: "管理员",
    desc: "拥有全部权限，含系统配置",
    sections: ["intake", "requests", "settings"],
  },
}

const STORAGE_KEY = "geo-current-role"

interface RoleContextValue {
  role: Role
  setRole: (r: Role) => void
  canAccess: (s: SectionKey) => boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("customer")

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (window.localStorage.getItem(STORAGE_KEY) as Role | null) : null
    if (saved && saved in ROLE_META) setRoleState(saved)
  }, [])

  const setRole = (r: Role) => {
    setRoleState(r)
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, r)
  }

  const canAccess = (s: SectionKey) => ROLE_META[role].sections.includes(s)

  return <RoleContext.Provider value={{ role, setRole, canAccess }}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error("useRole must be used within RoleProvider")
  return ctx
}
