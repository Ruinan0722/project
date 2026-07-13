"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, Ban, Check, MessageSquarePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Pill, InfoRow, EmptyState } from "./ui"
import { useCrm } from "./store"
import { useRole } from "@/components/app/role-context"
import {
  OPP_STAGES,
  OPP_STAGE_META,
  goalOrPlatform,
  money,
  type OppStage,
} from "@/lib/crm-data"
import { LostOpportunityDialog } from "./opportunity-actions"

// 正向阶段流转顺序（不含输单）
const FLOW: OppStage[] = ["contact", "demand", "solution", "quote", "signing", "won"]

export function OpportunityDetail({ id }: { id: string }) {
  const { getOpportunity, getCustomer, setOppStage, addOpportunityNote, contracts } = useCrm()
  const { canEdit } = useRole()
  const editable = canEdit("opportunities")
  const opp = getOpportunity(id)
  const [note, setNote] = useState("")
  const [lostOpen, setLostOpen] = useState(false)

  if (!opp) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">未找到该商机。</p>
        <Link href="/opportunities" className="mt-3 inline-block text-sm text-primary hover:underline">
          返回商机列表
        </Link>
      </div>
    )
  }

  const customer = getCustomer(opp.customerId)
  const linkedContract = contracts.find((c) => c.opportunityId === opp.id)
  const meta = OPP_STAGE_META[opp.stage]
  const isClosed = opp.stage === "won" || opp.stage === "lost"
  const currentIndex = FLOW.indexOf(opp.stage)
  const nextStage = currentIndex >= 0 && currentIndex < FLOW.length - 1 ? FLOW[currentIndex + 1] : null

  function advance() {
    if (!nextStage) return
    setOppStage(opp.id, nextStage)
    if (nextStage === "signing") {
      toast.success("已进入签署中，系统已自动生成待签订合同")
    } else if (nextStage === "won") {
      toast.success("商机已赢单")
    } else {
      toast.success(`已推进至「${OPP_STAGE_META[nextStage].label}」`)
    }
  }

  function submitNote() {
    if (!note.trim()) {
      toast.error("请输入跟进内容")
      return
    }
    addOpportunityNote(opp.id, note.trim())
    setNote("")
    toast.success("跟进记录已添加")
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回商机列表
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight">{opp.name}</h1>
            <Pill label={meta.label} tone={meta.tone} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {customer && (
              <Link href={`/customers/${customer.id}`} className="hover:text-foreground hover:underline">
                {customer.brandName || customer.companyName}
              </Link>
            )}
            {" · "}
            {opp.projectType} · 负责人：{opp.owner}
          </p>
        </div>
        {!isClosed && editable && (
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1.5 text-destructive" onClick={() => setLostOpen(true)}>
              <Ban className="size-4" />
              标记输单
            </Button>
            {nextStage && (
              <Button className="gap-1.5" onClick={advance}>
                <Check className="size-4" />
                推进至{OPP_STAGE_META[nextStage].label}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 阶段进度条 */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card p-5">
        <div className="flex min-w-max items-center gap-2">
          {FLOW.map((s, i) => {
            const done = opp.stage !== "lost" && FLOW.indexOf(opp.stage) >= i
            const isCurrent = opp.stage === s
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-secondary text-muted-foreground",
                  )}
                >
                  {done && !isCurrent && <Check className="size-3" />}
                  {OPP_STAGE_META[s].label}
                </div>
                {i < FLOW.length - 1 && <div className="h-px w-5 bg-border" />}
              </div>
            )
          })}
          {opp.stage === "lost" && <Pill label="已输单" tone="danger" className="ml-2" />}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">商机信息</h2>
            <dl className="mt-2">
              <InfoRow label="商机名称">{opp.name}</InfoRow>
              <InfoRow label="所属客户">{customer?.companyName || "—"}</InfoRow>
              <InfoRow label="品牌">{opp.brandName || "—"}</InfoRow>
              <InfoRow label="区域">{opp.region}</InfoRow>
              <InfoRow label="项目类型">{opp.projectType}</InfoRow>
              <InfoRow label="优化目标 / 平台">{goalOrPlatform(opp.goal, opp.platform)}</InfoRow>
              <InfoRow label="优化周期">{opp.period}</InfoRow>
              <InfoRow label="商机金额">
                <span className="font-semibold">{money(opp.amount)}</span>
              </InfoRow>
              <InfoRow label="成交概率">{opp.probability}%</InfoRow>
              <InfoRow label="预计签约日期">{opp.expectedSignDate || "—"}</InfoRow>
              <InfoRow label="创建日期">{opp.createdAt}</InfoRow>
              {opp.stage === "lost" && (
                <>
                  <InfoRow label="输单阶段">{opp.lostStage || "—"}</InfoRow>
                  <InfoRow label="竞争对手">{opp.competitor || "—"}</InfoRow>
                  <InfoRow label="输单原因">{opp.lostReason || "—"}</InfoRow>
                </>
              )}
            </dl>
            {linkedContract && (
              <div className="mt-4 rounded-xl bg-secondary/40 p-3">
                <p className="text-xs text-muted-foreground">关联合同</p>
                <Link
                  href={`/contracts/${linkedContract.id}`}
                  className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  {linkedContract.name}
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">跟进记录</h2>
            {!isClosed && editable && (
              <div className="mt-3 space-y-2.5 rounded-xl bg-secondary/40 p-3">
                <Textarea rows={3} placeholder="记录商机进展…" value={note} onChange={(e) => setNote(e.target.value)} />
                <Button size="sm" className="w-full gap-1.5" onClick={submitNote}>
                  <MessageSquarePlus className="size-4" />
                  添加记录
                </Button>
              </div>
            )}
            <div className="mt-4 space-y-3">
              {opp.notes.length === 0 ? (
                <EmptyState text="暂无跟进记录" />
              ) : (
                [...opp.notes].reverse().map((n) => (
                  <div key={n.id} className="border-l-2 border-primary/30 pl-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium">{n.author}</span>
                      <span className="text-[11px] text-muted-foreground">{n.date}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {lostOpen && <LostOpportunityDialog oppId={opp.id} open={lostOpen} onOpenChange={setLostOpen} />}
    </div>
  )
}
