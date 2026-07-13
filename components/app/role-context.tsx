"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Role = "customer" | "sdr" | "sales" | "leader" | "ops" | "presales" | "admin"

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

// 合同数据可见范围：无 / 仅本人签约 / 本部门 / 全部
export type ContractScope = "none" | "own" | "dept" | "all"

interface RoleConfig {
  label: string
  desc: string
  sections: SectionKey[] // 可见（可进入）的模块
  editable: SectionKey[] // 可操作（新增 / 编辑 / 状态流转）的模块
  advisorFeedback: boolean // 是否可新增 / 编辑商机的「顾问反馈」记录
  contractScope: ContractScope
  identity: { name?: string; dept?: string } // 用于合同等数据的范围过滤（演示用）
}

export const ROLE_META: Record<Role, RoleConfig> = {
  customer: {
    label: "客户",
    desc: "仅填写并提交需求单",
    sections: ["intake"],
    editable: ["intake"],
    advisorFeedback: false,
    contractScope: "none",
    identity: {},
  },
  sdr: {
    label: "SDR",
    desc: "新增跟进线索，只读查看客户与需求",
    sections: ["home", "leads", "customers", "requests", "dashboard"],
    editable: ["leads"],
    advisorFeedback: false,
    contractScope: "none",
    identity: { name: "周 SDR" },
  },
  sales: {
    label: "销售",
    desc: "编辑客户与商机字段，推进商机",
    sections: ["home", "customers", "requests", "opportunities", "contracts", "dashboard"],
    editable: ["customers", "requests", "opportunities"],
    advisorFeedback: false,
    contractScope: "own",
    identity: { name: "李销售" },
  },
  leader: {
    label: "销售 Leader",
    desc: "查看本部门经营数据与签约合同",
    sections: ["home", "customers", "requests", "opportunities", "contracts", "dashboard"],
    editable: ["customers", "requests", "opportunities"],
    advisorFeedback: false,
    contractScope: "dept",
    identity: { dept: "海外事业部" },
  },
  ops: {
    label: "销售运营",
    desc: "维护全部合同、配置系统",
    sections: ["home", "customers", "opportunities", "contracts", "dashboard", "settings"],
    editable: ["customers", "opportunities", "contracts", "settings"],
    advisorFeedback: false,
    contractScope: "all",
    identity: {},
  },
  presales: {
    label: "售前顾问",
    desc: "仅查看商机，编辑顾问反馈记录",
    sections: ["opportunities"],
    editable: [],
    advisorFeedback: true,
    contractScope: "none",
    identity: { name: "刘顾问" },
  },
  admin: {
    label: "管理员",
    desc: "拥有全部权限",
    sections: ["home", "leads", "customers", "requests", "opportunities", "contracts", "dashboard", "settings", "intake"],
    editable: ["home", "leads", "customers", "requests", "opportunities", "contracts", "dashboard", "settings", "intake"],
    advisorFeedback: true,
    contractScope: "all",
    identity: {},
  },
}

const STORAGE_KEY = "geo-current-role"

interface RoleContextValue {
  role: Role
  setRole: (r: Role) => void
  canAccess: (s: SectionKey) => boolean
  canEdit: (s: SectionKey) => boolean
  canEditAdvisor: boolean
  contractScope: ContractScope
  identity: { name?: string; dept?: string }
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
  const canEdit = (s: SectionKey) => ROLE_META[role].editable.includes(s)

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        canAccess,
        canEdit,
        canEditAdvisor: ROLE_META[role].advisorFeedback,
        contractScope: ROLE_META[role].contractScope,
        identity: ROLE_META[role].identity,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error("useRole must be used within RoleProvider")
  return ctx
}
