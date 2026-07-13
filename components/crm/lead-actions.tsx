"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCrm } from "./store"
import { LEAD_SOURCES, REGIONS, SALES_REPS, type Lead, type LeadLevel } from "@/lib/crm-data"

const LEVELS: LeadLevel[] = ["A", "B", "C", "D"]

const selectCls = "h-9 w-full rounded-lg border border-border bg-card px-3 text-sm"
const labelCls = "mb-1 block text-xs text-muted-foreground"

export function ConvertLeadDialog({
  leadId,
  open,
  onOpenChange,
}: {
  leadId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const { getLead, updateLead, convertLeadToCustomer } = useCrm()
  const lead = getLead(leadId)
  const [sales, setSales] = useState(lead && lead.sales !== "未分配" ? lead.sales : "")

  if (!lead) return null

  function convert() {
    if (!sales) {
      toast.error("请先指定分配销售，才能生成客户")
      return
    }
    updateLead(leadId, { sales })
    const cid = convertLeadToCustomer(leadId)
    onOpenChange(false)
    if (cid) {
      toast.success("已生成客户档案")
      router.push(`/customers/${cid}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>生成客户</DialogTitle>
          <DialogDescription>
            将线索「{lead.companyName}」转为正式客户前，需指定承接销售。系统会自动创建客户档案并带入首个联系人。
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl bg-secondary/40 p-4 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">公司名称</span>
            <span className="font-medium">{lead.companyName}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">联系人</span>
            <span className="font-medium">
              {lead.contactName}（{lead.contactTitle}）
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">所在地区</span>
            <span className="font-medium">
              {lead.region} · {lead.city}
            </span>
          </div>
        </div>
        <div>
          <label className={labelCls}>
            分配销售 <span className="text-destructive">*</span>
          </label>
          <select value={sales} onChange={(e) => setSales(e.target.value)} className={selectCls}>
            <option value="">请选择承接销售</option>
            {SALES_REPS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {!sales && <p className="mt-1.5 text-xs text-amber-600">未指定分配销售时无法生成客户。</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={convert} disabled={!sales}>
            确认生成
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const emptyForm = {
  companyName: "",
  contactName: "",
  contactTitle: "",
  email: "",
  region: REGIONS[0] as string,
  city: "",
  source: LEAD_SOURCES[0] as string,
  level: "B" as LeadLevel,
  sales: "未分配",
  firstContactDate: "",
}

export function LeadFormDialog({
  leadId,
  open,
  onOpenChange,
}: {
  leadId?: string // 传入则为编辑，否则为新增
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { getLead, createLead, updateLead } = useCrm()
  const editing = leadId ? getLead(leadId) : undefined
  const [form, setForm] = useState(() =>
    editing
      ? {
          companyName: editing.companyName,
          contactName: editing.contactName,
          contactTitle: editing.contactTitle,
          email: editing.email,
          region: editing.region,
          city: editing.city,
          source: editing.source,
          level: editing.level,
          sales: editing.sales,
          firstContactDate: editing.firstContactDate,
        }
      : emptyForm,
  )

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function submit() {
    if (!form.companyName.trim()) {
      toast.error("请填写公司名称")
      return
    }
    const patch: Partial<Lead> = {
      companyName: form.companyName.trim(),
      contactName: form.contactName.trim(),
      contactTitle: form.contactTitle.trim(),
      email: form.email.trim(),
      region: form.region,
      city: form.city.trim(),
      source: form.source,
      level: form.level,
      sales: form.sales,
      firstContactDate: form.firstContactDate,
    }
    if (editing) {
      updateLead(editing.id, patch)
      toast.success("线索信息已更新")
    } else {
      createLead(patch)
      toast.success("线索已新增")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "编辑线索" : "新增线索"}</DialogTitle>
          <DialogDescription>维护线索的公司、联系人与承接信息。分配销售后即可生成客户。</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>公司名称 *</label>
            <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="如：深圳市某某科技有限公司" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>联系人</label>
              <Input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>职位</label>
              <Input value={form.contactTitle} onChange={(e) => set("contactTitle", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>邮箱</label>
            <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>区域</label>
              <select value={form.region} onChange={(e) => set("region", e.target.value)} className={selectCls}>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>城市</label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>线索来源</label>
              <select value={form.source} onChange={(e) => set("source", e.target.value)} className={selectCls}>
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>线索等级</label>
              <select value={form.level} onChange={(e) => set("level", e.target.value as LeadLevel)} className={selectCls}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l} 级
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>分配销售</label>
              <select value={form.sales} onChange={(e) => set("sales", e.target.value)} className={selectCls}>
                <option value="未分配">未分配</option>
                {SALES_REPS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>首次触达日期</label>
              <Input type="date" value={form.firstContactDate} onChange={(e) => set("firstContactDate", e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={submit}>{editing ? "保存" : "新增"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
