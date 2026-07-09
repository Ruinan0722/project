"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { useCrm } from "./store"
import { LOST_STAGES, OPT_PERIODS, PROJECT_TYPES } from "@/lib/crm-data"

export function CreateOpportunityDialog({
  customerId,
  open,
  onOpenChange,
  onCreated,
}: {
  customerId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (oppId: string) => void
}) {
  const { getCustomer, createOpportunity } = useCrm()
  const customer = getCustomer(customerId)
  const [form, setForm] = useState({
    name: "",
    projectType: PROJECT_TYPES[0] as string,
    period: OPT_PERIODS[1] as string,
    amount: "",
    expectedSignDate: "",
  })

  if (!customer) return null

  function submit() {
    const oid = createOpportunity(customerId, {
      name: form.name.trim() || `${customer.brandName || customer.companyName} GEO 优化项目`,
      projectType: form.projectType,
      period: form.period,
      amount: Number(form.amount) || 0,
      expectedSignDate: form.expectedSignDate,
    })
    onOpenChange(false)
    toast.success("商机已创建")
    onCreated?.(oid)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建商机</DialogTitle>
          <DialogDescription>为客户「{customer.brandName || customer.companyName}」创建销售商机。</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">商机名称</label>
            <Input
              placeholder={`${customer.brandName || customer.companyName} GEO 优化项目`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">项目类型</label>
              <select
                value={form.projectType}
                onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm"
              >
                {PROJECT_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">优化周期</label>
              <select
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm"
              >
                {OPT_PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">商机金额（元）</label>
              <Input
                inputMode="numeric"
                placeholder="例如：260000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9]/g, "") })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">预计签约日期</label>
              <Input
                type="date"
                value={form.expectedSignDate}
                onChange={(e) => setForm({ ...form, expectedSignDate: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={submit}>创建商机</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function LostOpportunityDialog({
  oppId,
  open,
  onOpenChange,
}: {
  oppId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { markOppLost } = useCrm()
  const [lostStage, setLostStage] = useState(LOST_STAGES[3] as string)
  const [lostReason, setLostReason] = useState("")
  const [competitor, setCompetitor] = useState("")

  function submit() {
    if (!lostReason.trim()) {
      toast.error("请填写输单原因")
      return
    }
    markOppLost(oppId, { lostStage, lostReason: lostReason.trim(), competitor: competitor.trim() })
    onOpenChange(false)
    toast.success("商机已标记为输单")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>标记输单</DialogTitle>
          <DialogDescription>请填写输单信息，用于复盘与赢率分析。</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">输单阶段</label>
            <select
              value={lostStage}
              onChange={(e) => setLostStage(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm"
            >
              {LOST_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">竞争对手</label>
            <Input placeholder="如无可留空" value={competitor} onChange={(e) => setCompetitor(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">输单原因</label>
            <Textarea
              rows={3}
              placeholder="例如：预算不足 / 竞品价格更低 / 决策周期延后"
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant="destructive" onClick={submit}>
            确认输单
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
