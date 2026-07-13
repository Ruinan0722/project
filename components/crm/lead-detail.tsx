"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Ban, MessageSquarePlus, UserCheck, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pill, InfoRow, EmptyState } from "./ui"
import { useCrm } from "./store"
import { useRole } from "@/components/app/role-context"
import { LEAD_STATUS_META, type Lead } from "@/lib/crm-data"

export function LeadDetail({ id }: { id: string }) {
  const router = useRouter()
  const { getLead, addLeadNote, convertLeadToCustomer, markLeadInvalid } = useCrm()
  const { canEdit } = useRole()
  const editable = canEdit("leads")
  const lead = getLead(id)

  const [note, setNote] = useState("")
  const [wechat, setWechat] = useState(false)
  const [invalidOpen, setInvalidOpen] = useState(false)
  const [invalidReason, setInvalidReason] = useState("")

  if (!lead) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">未找到该线索。</p>
        <Link href="/leads" className="mt-3 inline-block text-sm text-primary hover:underline">
          返回线索列表
        </Link>
      </div>
    )
  }

  const meta = LEAD_STATUS_META[lead.status]

  function submitNote() {
    if (!note.trim()) {
      toast.error("请输入跟进内容")
      return
    }
    addLeadNote(lead.id, note.trim(), wechat)
    setNote("")
    setWechat(false)
    toast.success("跟进记录已添加")
  }

  function convert() {
    const cid = convertLeadToCustomer(lead.id)
    if (cid) {
      toast.success("已生成客户，正在跳转至客户详情")
      router.push(`/customers/${cid}`)
    }
  }

  function confirmInvalid() {
    if (!invalidReason.trim()) {
      toast.error("请填写无效原因")
      return
    }
    markLeadInvalid(lead.id, invalidReason.trim())
    setInvalidOpen(false)
    toast.success("线索已标记为无效")
  }

  const canConvert = editable && lead.status !== "converted" && lead.status !== "invalid"

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回线索列表
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight">{lead.companyName}</h1>
            <Pill label={meta.label} tone={meta.tone} />
            <Pill label={`${lead.level} 级`} tone={lead.level === "A" ? "danger" : lead.level === "B" ? "warning" : "muted"} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {lead.contactName} · {lead.contactTitle} · 来源：{lead.source}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canConvert && (
            <Button variant="outline" className="gap-1.5 text-destructive" onClick={() => setInvalidOpen(true)}>
              <Ban className="size-4" />
              置为无效
            </Button>
          )}
          {canConvert && (
            <Button className="gap-1.5" onClick={convert}>
              <UserCheck className="size-4" />
              生成客户
              <ArrowRight className="size-4" />
            </Button>
          )}
          {lead.convertedCustomerId && (
            <Link href={`/customers/${lead.convertedCustomerId}`}>
              <Button variant="outline" className="gap-1.5">
                <Wallet className="size-4" />
                查看关联客户
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* 左：线索信息 */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">线索信息</h2>
            <dl className="mt-2">
              <InfoRow label="公司名称">{lead.companyName}</InfoRow>
              <InfoRow label="所在地区">
                {lead.region} · {lead.city}
              </InfoRow>
              <InfoRow label="联系人">
                {lead.contactName}（{lead.contactTitle}）
              </InfoRow>
              <InfoRow label="邮箱">{lead.email || "—"}</InfoRow>
              <InfoRow label="线索来源">{lead.source}</InfoRow>
              <InfoRow label="首次触达日期">{lead.firstContactDate || "—"}</InfoRow>
              <InfoRow label="转出日期">{lead.transferDate || "—"}</InfoRow>
              <InfoRow label="SDR">{lead.sdr}</InfoRow>
              <InfoRow label="分配销售">{lead.sales}</InfoRow>
              <InfoRow label="跟进状态">{lead.followState === "need" ? "需要跟进" : "无需跟进"}</InfoRow>
              {lead.status === "invalid" && <InfoRow label="无效原因">{lead.invalidReason}</InfoRow>}
            </dl>
          </div>
        </div>

        {/* 右：跟进记录 */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">跟进记录</h2>
            {canConvert && (
              <div className="mt-3 space-y-2.5 rounded-xl bg-secondary/40 p-3">
                <Textarea
                  rows={3}
                  placeholder="记录本次沟通内容…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox checked={wechat} onCheckedChange={(v) => setWechat(v === true)} />
                  本次已添加企业微信
                </label>
                <Button size="sm" className="w-full gap-1.5" onClick={submitNote}>
                  <MessageSquarePlus className="size-4" />
                  添加记录
                </Button>
              </div>
            )}
            <div className="mt-4 space-y-3">
              {lead.notes.length === 0 ? (
                <EmptyState text="暂无跟进记录" />
              ) : (
                [...lead.notes].reverse().map((n) => (
                  <div key={n.id} className="border-l-2 border-primary/30 pl-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium">{n.author}</span>
                      <span className="text-[11px] text-muted-foreground">{n.date}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed">{n.content}</p>
                    {n.wechatAdded && <Pill label="已加企微" tone="success" className="mt-1.5" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 置为无效弹窗 */}
      <Dialog open={invalidOpen} onOpenChange={setInvalidOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>标记为无效线索</DialogTitle>
            <DialogDescription>请填写无效原因，便于后续质量分析。</DialogDescription>
          </DialogHeader>
          <Textarea
            rows={3}
            placeholder="例如：无海外品牌建设需求 / 联系方式无效 / 非目标行业"
            value={invalidReason}
            onChange={(e) => setInvalidReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvalidOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmInvalid}>
              确认无效
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
