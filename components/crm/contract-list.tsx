"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCrm } from "./store"
import { useRole } from "@/components/app/role-context"
import {
  CONTRACT_STATUS_META,
  CONTRACT_TYPES,
  PROJECT_STATUS_META,
  SIGN_TYPES,
  money,
  type ContractStatus,
} from "@/lib/crm-data"
import { Pill, StatCards, FilterChips, EmptyState } from "./ui"

export function ContractList() {
  const { contracts } = useCrm()
  const { canEdit, contractScope, identity } = useRole()
  const canEditContract = canEdit("contracts")
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<ContractStatus | "all">("all")
  const [createOpen, setCreateOpen] = useState(false)

  // 按角色数据范围过滤：全部 / 本部门 / 仅本人签约
  const scoped = useMemo(() => {
    if (contractScope === "all") return contracts
    if (contractScope === "own") return contracts.filter((c) => c.owner === identity.name)
    if (contractScope === "dept") return contracts.filter((c) => c.dept === identity.dept)
    return []
  }, [contracts, contractScope, identity])

  const scopeHint =
    contractScope === "own"
      ? "当前身份仅可查看本人签约的合同"
      : contractScope === "dept"
        ? `当前身份仅可查看本部门（${identity.dept}）的合同`
        : null

  const stats = useMemo(() => {
    const signed = scoped.filter((c) => c.status === "signed")
    return {
      total: scoped.length,
      signed: signed.length,
      pending: scoped.filter((c) => c.status === "pending" || c.status === "signing").length,
      amount: signed.reduce((s, c) => s + c.amount, 0),
    }
  }, [scoped])

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return scoped.filter((c) => {
      const ms = status === "all" || c.status === status
      const mkw =
        !kw ||
        c.name.toLowerCase().includes(kw) ||
        c.company.toLowerCase().includes(kw) ||
        c.code.toLowerCase().includes(kw)
      return ms && mkw
    })
  }, [scoped, keyword, status])

  return (
    <div className="space-y-6">
      <StatCards
        items={[
          { label: "合同总数", value: stats.total },
          { label: "已签订", value: stats.signed, tone: "text-emerald-600" },
          { label: "待签 / 签署中", value: stats.pending, tone: "text-amber-600" },
          { label: "已签约金额", value: money(stats.amount), tone: "text-primary" },
        ]}
      />

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="搜索合同名称、客户或编号"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          {canEditContract && (
            <Button className="gap-1.5 self-start lg:self-auto" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              新增合同
            </Button>
          )}
        </div>
        <div className="mt-3">
          <FilterChips
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "全部" },
              { value: "pending", label: "待签订" },
              { value: "signing", label: "签署中" },
              { value: "signed", label: "已签订" },
              { value: "void", label: "已作废" },
              { value: "terminated", label: "已终止" },
            ]}
          />
        </div>
        {scopeHint && <p className="mt-3 text-xs text-muted-foreground">{scopeHint}</p>}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">合同编号 / 名称</th>
                <th className="px-4 py-3 font-medium">客户</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">金额</th>
                <th className="px-4 py-3 font-medium">负责人</th>
                <th className="px-4 py-3 font-medium">项目状态</th>
                <th className="px-4 py-3 font-medium">合同状态</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 transition-colors hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-muted-foreground">{c.code || "编号待生成"}</p>
                    <p className="font-medium">{c.name}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.company}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.type}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{money(c.amount)}</td>
                  <td className="px-4 py-3">{c.owner}</td>
                  <td className="px-4 py-3">
                    <Pill
                      label={PROJECT_STATUS_META[c.projectStatus].label}
                      tone={PROJECT_STATUS_META[c.projectStatus].tone}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Pill label={CONTRACT_STATUS_META[c.status].label} tone={CONTRACT_STATUS_META[c.status].tone} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/contracts/${c.id}`}>
                      <Button variant="ghost" size="sm">
                        查看
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState text="没有符合条件的合同" />}
      </div>
      <p className="text-center text-xs text-muted-foreground">共 {filtered.length} 份合同</p>

      {createOpen && <NewContractDialog open={createOpen} onOpenChange={setCreateOpen} />}
    </div>
  )
}

function NewContractDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter()
  const { customers, createContract } = useCrm()
  const [form, setForm] = useState({
    name: "",
    customerId: "",
    type: CONTRACT_TYPES[0] as string,
    signType: SIGN_TYPES[0] as string,
    owner: "",
    dept: "",
    amount: "",
  })

  function submit() {
    if (!form.name.trim()) {
      toast.error("请填写合同名称")
      return
    }
    if (!form.customerId) {
      toast.error("请选择关联客户")
      return
    }
    const cust = customers.find((c) => c.id === form.customerId)
    const id = createContract({
      name: form.name.trim(),
      customerId: form.customerId,
      company: cust?.companyName,
      region: cust?.region,
      city: cust?.city,
      type: form.type,
      signType: form.signType,
      owner: form.owner.trim() || cust?.owner || "",
      dept: form.dept.trim(),
      amount: Number(form.amount) || 0,
    })
    onOpenChange(false)
    toast.success("合同已创建")
    router.push(`/contracts/${id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增合同</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">合同名称</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="如：Anker 品牌 GEO 优化服务合同" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">关联客户</label>
            <select
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm"
            >
              <option value="">请选择客户</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">合同类型</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm"
              >
                {CONTRACT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">签约类型</label>
              <select
                value={form.signType}
                onChange={(e) => setForm({ ...form, signType: e.target.value })}
                className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm"
              >
                {SIGN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">销售负责人</label>
              <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="选填" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">签约部门</label>
              <Input value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} placeholder="选填" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">合同金额（元）</label>
            <Input
              inputMode="numeric"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9]/g, "") })}
              placeholder="选填，可在签署时填写"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={submit}>创建合同</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
