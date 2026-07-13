"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import {
  MOCK_CONTRACTS,
  MOCK_CUSTOMERS,
  MOCK_LEADS,
  MOCK_OPPORTUNITIES,
  type Contact,
  type Contract,
  type Customer,
  type FollowUp,
  type Lead,
  type LeadStatus,
  type Opportunity,
  type OppStage,
} from "@/lib/crm-data"

function nowDate() {
  return new Date().toISOString().slice(0, 10)
}
function nowStr() {
  return new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-")
}
function rid(prefix: string) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`
}

interface CrmContextValue {
  leads: Lead[]
  customers: Customer[]
  opportunities: Opportunity[]
  contracts: Contract[]
  // 查询
  getLead: (id: string) => Lead | undefined
  getCustomer: (id: string) => Customer | undefined
  getOpportunity: (id: string) => Opportunity | undefined
  getContract: (id: string) => Contract | undefined
  // 线索
  createLead: (data: Partial<Lead>) => string
  updateLead: (id: string, patch: Partial<Lead>) => void
  addLeadNote: (id: string, content: string, wechatAdded: boolean, author?: string) => void
  convertLeadToCustomer: (id: string) => string // 返回新客户 id
  markLeadInvalid: (id: string, reason: string) => void
  // 客户
  updateCustomer: (id: string, patch: Partial<Customer>) => void
  addCustomerNote: (id: string, content: string, author?: string) => void
  addContact: (customerId: string, contact: Omit<Contact, "id">) => void
  updateContact: (customerId: string, contactId: string, patch: Partial<Contact>) => void
  setPrimaryContact: (customerId: string, contactId: string) => void
  // 商机
  updateOpportunity: (id: string, patch: Partial<Opportunity>) => void
  addOpportunityNote: (id: string, content: string, author?: string) => void
  addAdvisorNote: (id: string, content: string, author?: string) => void
  createOpportunity: (customerId: string, data: Partial<Opportunity>) => string
  setOppStage: (id: string, stage: OppStage) => void
  markOppLost: (id: string, info: { lostStage: string; lostReason: string; competitor: string }) => void
  // 合同
  createContract: (data: Partial<Contract>) => string
  updateContract: (id: string, patch: Partial<Contract>) => void
}

const CrmContext = createContext<CrmContextValue | null>(null)

export function CrmProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(() => MOCK_LEADS)
  const [customers, setCustomers] = useState<Customer[]>(() => MOCK_CUSTOMERS)
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => MOCK_OPPORTUNITIES)
  const [contracts, setContracts] = useState<Contract[]>(() => MOCK_CONTRACTS)

  const getLead = useCallback((id: string) => leads.find((l) => l.id === id), [leads])
  const getCustomer = useCallback((id: string) => customers.find((c) => c.id === id), [customers])
  const getOpportunity = useCallback((id: string) => opportunities.find((o) => o.id === id), [opportunities])
  const getContract = useCallback((id: string) => contracts.find((c) => c.id === id), [contracts])

  // ===== 线索 =====
  const createLead = useCallback((data: Partial<Lead>): string => {
    const id = rid("l")
    const lead: Lead = {
      id,
      firstContactDate: data.firstContactDate || nowDate(),
      transferDate: data.transferDate ?? "",
      source: data.source ?? "线上投放",
      companyName: data.companyName ?? "未命名公司",
      city: data.city ?? "",
      region: data.region ?? "华东区",
      contactName: data.contactName ?? "",
      contactTitle: data.contactTitle ?? "",
      email: data.email ?? "",
      sdr: data.sdr ?? "周 SDR",
      sales: data.sales ?? "未分配",
      level: data.level ?? "B",
      followState: data.followState ?? "need",
      status: data.status ?? "untouched",
      invalidReason: data.invalidReason,
      notes: data.notes ?? [],
    }
    setLeads((prev) => [lead, ...prev])
    return id
  }, [])

  const updateLead = useCallback((id: string, patch: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }, [])

  const addLeadNote = useCallback((id: string, content: string, wechatAdded: boolean, author = "当前用户") => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: l.status === "untouched" ? "touched" : l.status,
              notes: [...l.notes, { id: rid("ln"), author, content, date: nowStr(), wechatAdded }],
            }
          : l,
      ),
    )
  }, [])

  const markLeadInvalid = useCallback((id: string, reason: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: "invalid", invalidReason: reason, followState: "no_need" } : l)))
  }, [])

  const convertLeadToCustomer = useCallback(
    (id: string): string => {
      const lead = leads.find((l) => l.id === id)
      if (!lead) return ""
      if (lead.convertedCustomerId) return lead.convertedCustomerId
      const newId = rid("c")
      const customer: Customer = {
        id: newId,
        companyName: lead.companyName,
        brandName: "",
        region: lead.region,
        city: lead.city,
        industryL1: "",
        industryL2: "",
        foundedDate: "",
        creditCode: "",
        registeredCapital: 0,
        scale: "",
        nature: "",
        status: "following",
        owner: lead.sales !== "未分配" ? lead.sales : "待分配",
        sdrTransferDate: nowDate(),
        lastFollowAt: nowStr(),
        source: lead.source,
        isKey: lead.level === "A",
        createdAt: nowDate(),
        contacts: [
          {
            id: rid("ct"),
            name: lead.contactName,
            title: lead.contactTitle,
            phone: "",
            email: lead.email,
            isPrimary: true,
            active: true,
            wechatAdded: lead.notes.some((n) => n.wechatAdded),
          },
        ],
        notes: [],
      }
      setCustomers((prev) => [customer, ...prev])
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, status: "converted", transferDate: nowDate(), convertedCustomerId: newId } : l,
        ),
      )
      return newId
    },
    [leads],
  )

  // ===== 客户 =====
  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const addCustomerNote = useCallback((id: string, content: string, author = "当前用户") => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, lastFollowAt: nowStr(), notes: [...c.notes, { id: rid("f"), author, content, date: nowStr() }] }
          : c,
      ),
    )
  }, [])

  const addContact = useCallback((customerId: string, contact: Omit<Contact, "id">) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c
        const isFirst = c.contacts.length === 0
        return { ...c, contacts: [...c.contacts, { ...contact, id: rid("ct"), isPrimary: contact.isPrimary || isFirst }] }
      }),
    )
  }, [])

  const updateContact = useCallback((customerId: string, contactId: string, patch: Partial<Contact>) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, contacts: c.contacts.map((ct) => (ct.id === contactId ? { ...ct, ...patch } : ct)) }
          : c,
      ),
    )
  }, [])

  const setPrimaryContact = useCallback((customerId: string, contactId: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, contacts: c.contacts.map((ct) => ({ ...ct, isPrimary: ct.id === contactId })) }
          : c,
      ),
    )
  }, [])

  // ===== 商机 =====
  const updateOpportunity = useCallback((id: string, patch: Partial<Opportunity>) => {
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }, [])

  const addOpportunityNote = useCallback((id: string, content: string, author = "当前用户") => {
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, lastFollowAt: nowStr(), notes: [...o.notes, { id: rid("of"), author, content, date: nowStr() }] }
          : o,
      ),
    )
  }, [])

  const addAdvisorNote = useCallback((id: string, content: string, author = "售前顾问") => {
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, advisorNotes: [...o.advisorNotes, { id: rid("ad"), author, content, date: nowStr() }] }
          : o,
      ),
    )
  }, [])

  const createOpportunity = useCallback(
    (customerId: string, data: Partial<Opportunity>): string => {
      const cust = customers.find((c) => c.id === customerId)
      const newId = rid("o")
      const opp: Opportunity = {
        id: newId,
        name: data.name || `${cust?.brandName || cust?.companyName || "新"} GEO 优化项目`,
        customerId,
        brandName: data.brandName ?? cust?.brandName ?? "",
        region: data.region ?? cust?.region ?? "",
        goal: data.goal ?? "recommend",
        platform: data.platform ?? "ChatGPT",
        period: data.period ?? "6 个月",
        amount: data.amount ?? 0,
        probability: data.probability ?? 20,
        expectedSignDate: data.expectedSignDate ?? "",
        stage: "contact",
        owner: data.owner ?? cust?.owner ?? "当前用户",
        projectTypes: data.projectTypes && data.projectTypes.length ? data.projectTypes : ["监测"],
        primaryContactId: data.primaryContactId ?? cust?.contacts.find((c) => c.isPrimary)?.id ?? "",
        requestIds: data.requestIds ?? [],
        notes: [],
        advisorNotes: [],
        createdAt: nowDate(),
        lastFollowAt: nowStr(),
      }
      setOpportunities((prev) => [opp, ...prev])
      return newId
    },
    [customers],
  )

  // 商机进入签署中 -> 自动生成待签订合同
  const autoCreateContract = useCallback(
    (opp: Opportunity) => {
      setContracts((prev) => {
        if (prev.some((c) => c.opportunityId === opp.id)) return prev
        const cust = customers.find((c) => c.id === opp.customerId)
        const contract: Contract = {
          id: rid("ct-"),
          code: "",
          name: `${opp.name} 服务合同`,
          customerId: opp.customerId,
          company: cust?.companyName ?? "",
          region: opp.region,
          city: cust?.city ?? "",
          type: "新签",
          signType: "线上电子签",
          status: "pending",
          projectStatus: "not_started",
          signSubject: "",
          signer: "",
          owner: opp.owner,
          signerManager: "",
          dept: "",
          amount: 0,
          effectiveDate: "",
          dualSignDate: "",
          validMonths: 0,
          endDate: "",
          attachments: [],
          opportunityId: opp.id,
          createdAt: nowDate(),
        }
        return [contract, ...prev]
      })
    },
    [customers],
  )

  const setOppStage = useCallback(
    (id: string, stage: OppStage) => {
      setOpportunities((prev) => {
        const next = prev.map((o) => (o.id === id ? { ...o, stage, lastFollowAt: nowStr() } : o))
        const target = next.find((o) => o.id === id)
        if (target && stage === "signing") autoCreateContract(target)
        return next
      })
    },
    [autoCreateContract],
  )

  const markOppLost = useCallback(
    (id: string, info: { lostStage: string; lostReason: string; competitor: string }) => {
      setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, stage: "lost", ...info, probability: 0 } : o)))
    },
    [],
  )

  // ===== 合同 =====
  const createContract = useCallback(
    (data: Partial<Contract>): string => {
      const id = rid("ct-")
      const cust = data.customerId ? customers.find((c) => c.id === data.customerId) : undefined
      const contract: Contract = {
        id,
        code: data.code ?? "",
        name: data.name ?? "新建合同",
        customerId: data.customerId ?? "",
        company: data.company ?? cust?.companyName ?? "",
        region: data.region ?? cust?.region ?? "",
        city: data.city ?? cust?.city ?? "",
        type: data.type ?? "新签",
        signType: data.signType ?? "线上电子签",
        status: data.status ?? "pending",
        projectStatus: data.projectStatus ?? "not_started",
        signSubject: data.signSubject ?? "",
        signer: data.signer ?? "",
        owner: data.owner ?? "",
        signerManager: data.signerManager ?? "",
        dept: data.dept ?? "",
        amount: data.amount ?? 0,
        effectiveDate: data.effectiveDate ?? "",
        dualSignDate: data.dualSignDate ?? "",
        validMonths: data.validMonths ?? 0,
        endDate: data.endDate ?? "",
        attachments: data.attachments ?? [],
        opportunityId: data.opportunityId ?? "",
        createdAt: nowDate(),
      }
      setContracts((prev) => [contract, ...prev])
      return id
    },
    [customers],
  )

  const updateContract = useCallback((id: string, patch: Partial<Contract>) => {
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const value = useMemo<CrmContextValue>(
    () => ({
      leads,
      customers,
      opportunities,
      contracts,
      getLead,
      getCustomer,
      getOpportunity,
      getContract,
      createLead,
      updateLead,
      addLeadNote,
      convertLeadToCustomer,
      markLeadInvalid,
      updateCustomer,
      addCustomerNote,
      addContact,
      updateContact,
      setPrimaryContact,
      updateOpportunity,
      addOpportunityNote,
      addAdvisorNote,
      createOpportunity,
      setOppStage,
      markOppLost,
      createContract,
      updateContract,
    }),
    [
      leads,
      customers,
      opportunities,
      contracts,
      getLead,
      getCustomer,
      getOpportunity,
      getContract,
      createLead,
      updateLead,
      addLeadNote,
      convertLeadToCustomer,
      markLeadInvalid,
      updateCustomer,
      addCustomerNote,
      addContact,
      updateContact,
      setPrimaryContact,
      updateOpportunity,
      addOpportunityNote,
      addAdvisorNote,
      createOpportunity,
      setOppStage,
      markOppLost,
      createContract,
      updateContract,
    ],
  )

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>
}

export function useCrm() {
  const ctx = useContext(CrmContext)
  if (!ctx) throw new Error("useCrm must be used within CrmProvider")
  return ctx
}

// 派生：某客户的商机 / 合同 / 需求数量在组件内用 useCrm 过滤即可
