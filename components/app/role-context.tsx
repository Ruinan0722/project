"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Role = "customer" | "sdr" | "sales" | "leader" | "presales" | "ops" | "admin"

export type SectionKey =
  | "intake"
  | "home"
  | "leads"
  | "customers"
  | "requests"
  | "opportunities"
  | "contracts"
  | "dashboard"
  | "settings"

export const ROLE_META: Record<Role, { label: string; desc: string; sections: SectionKey[] }> = {
  customer: {
    label: "客户",
    desc: "仅填写并提交需求单",
    sections: ["intake"],
  },
  sdr: {
    label: "SDR",
    desc: "承接与跟进线索、转出客户",
    sections: ["home", "leads", "customers", "requests", "dashboard"],
  },
  sales: {
    label: "销售",
    desc: "维护客户、推进商机与需求",
    sections: ["home", "leads", "customers", "requests", "opportunities", "contracts", "dashboard"],
  },
  leader: {
    label: "销售 Leader",
    desc: "查看本部门全量经营数据",
    sections: ["home", "leads", "customers", "requests", "opportunities", "contracts", "dashboard"],
  },
  presales: {
    label: "售前顾问",
    desc: "支持需求确认与方案沟通",
    sections: ["home", "customers", "requests", "opportunities", "dashboard"],
  },
  ops: {
    label: "销售运营",
    desc: "维护合同、配置系统",
    sections: ["home", "customers", "opportunities", "contracts", "dashboard", "settings"],
  },
  admin: {
    label: "管理员",
    desc: "拥有全部权限",
    sections: ["home", "leads", "customers", "requests", "opportunities", "contracts", "dashboard", "settings", "intake"],
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
  const [role, setRoleState] = useState<Role>("sales")

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
