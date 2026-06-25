"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Building2,
  Download,
  FileSpreadsheet,
  Globe,
  MessageSquarePlus,
  Pencil,
  Printer,
  Target,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { useAdmin } from "./store"
import { EditDialog } from "./edit-dialog"
import {
  AI_PLATFORM_OPTIONS,
  STATUS_META,
  goalLabel,
  type RequestStatus,
} from "@/lib/geo-data"
import { exportCsv } from "@/lib/export"
import { toast } from "sonner"

const OWNERS = ["未分配", "李销售", "陈商务", "GEO运营", "解决方案", "交付团队"]
const STATUS_ORDER: RequestStatus[] = [
  "submitted",
  "supplement",
  "pending_review",
  "confirmed",
  "in_project",
  "closed",
]

export function RequestDetail({ id }: { id: string }) {
  const { getById, updateStatus, assignOwner, addNote } = useAdmin()
  const record = getById(id)
  const [note, setNote] = useState("")
  const [editOpen, setEditOpen] = useState(false)

  if (!record) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">未找到该需求记录</p>
        <Link href="/requests">
          <Button variant="outline">返回需求列表</Button>
        </Link>
      </div>
    )
  }

  const d = record.data
  const intent = d.intentType === "clear" ? d.intentClear : d.intentType === "rough" ? d.intentRough : ""

  function submitNote() {
    if (!note.trim()) return
    addNote(record!.id, note.trim())
    setNote("")
    toast.success("备注已添加")
  }

  return (
    <>
      {/* 顶部操作栏 */}
      <header className="border-b border-border bg-card/60 px-5 py-4 lg:px-8 print:hidden">
        <Link href="/requests" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          返回需求列表
        </Link>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-lg font-semibold">{record.code}</h1>
            <StatusBadge status={record.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              编辑信息
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                exportCsv([record], `${record.code}`)
                toast.success("已导出 Excel(CSV)")
              }}
            >
              <FileSpreadsheet className="size-4" />
              导出 Excel
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
              <Printer className="size-4" />
              下载 PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 px-5 py-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 主体信息 */}
          <div className="space-y-6 lg:col-span-2">
            <DetailSection icon={UserRound} title="项目联系人">
              <InfoGrid
                items={[
                  ["公司名称", d.companyName],
                  ["联系人姓名", d.contactName],
                  ["职位", d.contactTitle],
                  ["手机号", d.contactPhone],
                ]}
              />
            </DetailSection>

            <DetailSection icon={Building2} title="品牌与产品信息">
              <InfoGrid
                items={[
                  ["品牌名称", d.brandName],
                  ["产品或服务", d.products.map((p) => p.name).filter(Boolean).join(" / ") || "—"],
                ]}
              />
              <InfoRow label="产品介绍">
                <p className="whitespace-pre-line text-sm leading-relaxed">{d.productIntro || "—"}</p>
              </InfoRow>
              <InfoRow label="海外官网">
                {d.hasOverseasSite === "yes" && d.overseasSiteUrl ? (
                  <a
                    href={d.overseasSiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Globe className="size-3.5" />
                    {d.overseasSiteUrl}
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">暂无海外官网</span>
                )}
              </InfoRow>
            </DetailSection>

            <DetailSection icon={Target} title="GEO 优化需求">
              <InfoRow label="目标国家或地区">
                <TagList items={d.countries} />
              </InfoRow>
              <InfoRow label="目标语言">
                <TagList items={d.languages} />
              </InfoRow>
              <InfoRow label="AI 平台">
                <TagList items={d.platforms.length ? d.platforms : AI_PLATFORM_OPTIONS.slice(0, 0)} />
              </InfoRow>
              <InfoRow label="用户问题 / 业务方向">
                {intent ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed">{intent}</p>
                ) : (
                  <span className="text-sm text-muted-foreground">未填写，由项目团队协助挖掘</span>
                )}
              </InfoRow>
              <InfoRow label="具体优化目标">
                <span className="inline-flex rounded-lg bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                  {goalLabel(d.goal)}
                </span>
              </InfoRow>
            </DetailSection>
          </div>

          {/* 侧栏：状态 / 跟进人 / 备注 */}
          <div className="space-y-6 print:hidden">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">处理状态</h3>
              <div className="mt-3">
                <Select value={record.status} onValueChange={(v) => updateStatus(record.id, v as RequestStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{STATUS_META[record.status].label}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_META[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{STATUS_META[record.status].description}</p>
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-semibold">跟进人</h3>
                <Select value={record.owner} onValueChange={(v) => assignOwner(record.id, v)}>
                  <SelectTrigger className="mt-3 w-full">
                    <SelectValue>{record.owner}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {OWNERS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <dl className="mt-5 space-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <dt>提交时间</dt>
                  <dd className="text-foreground">{record.submittedAt}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>最近更新</dt>
                  <dd className="text-foreground">{record.updatedAt}</dd>
                </div>
              </dl>
            </div>

            {/* 内部备注 */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <MessageSquarePlus className="size-4" />
                内部备注
              </h3>
              <div className="mt-3 space-y-3">
                {record.notes.length === 0 && <p className="text-xs text-muted-foreground">暂无沟通记录</p>}
                {record.notes.map((n) => (
                  <div key={n.id} className="rounded-lg border border-border bg-secondary/40 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{n.author}</span>
                      <span className="text-muted-foreground">{n.createdAt}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed">{n.content}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                <Textarea
                  rows={3}
                  placeholder="记录与客户的沟通或处理信息…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button size="sm" className="w-full" onClick={submitNote} disabled={!note.trim()}>
                  添加备注
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 text-xs leading-relaxed text-muted-foreground">
              <Download className="mb-2 size-4 text-primary" />
              该需求数据可作为统一输入，复用于 GEO 诊断报告、用户意图挖掘、SOW 生成与竞标方案。
            </div>
          </div>
        </div>
      </div>

      <EditDialog open={editOpen} onOpenChange={setEditOpen} record={record} />
    </>
  )
}

function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-4" />
        </span>
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function InfoGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label}>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-sm font-medium">{value || "—"}</p>
        </div>
      ))}
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function TagList({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-sm text-muted-foreground">—</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <span key={it} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
          {it}
        </span>
      ))}
    </div>
  )
}
