"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  MessageSquarePlus,
  Plus,
  Star,
  Target,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pill, InfoRow, EmptyState } from "./ui"
import { useCrm } from "./store"
import { useRole } from "@/components/app/role-context"
import { useAdmin } from "@/components/admin/store"
import { CUSTOMER_STATUS_META, money, type Contact, type CustomerStatus } from "@/lib/crm-data"
import { OPP_STAGE_META } from "@/lib/crm-data"
import { CONTRACT_STATUS_META } from "@/lib/crm-data"
import { STATUS_META, brandDisplay } from "@/lib/geo-data"
import { CreateOpportunityDialog } from "./opportunity-actions"

const STATUS_OPTIONS: CustomerStatus[] = ["potential", "following", "cooperating", "lost"]

export function CustomerDetail({ id }: { id: string }) {
  const router = useRouter()
  const {
    getCustomer,
    opportunities,
    contracts,
    updateCustomer,
    addCustomerNote,
    addContact,
    setPrimaryContact,
    updateContact,
  } = useCrm()
  const { requests } = useAdmin()
  const { canEdit } = useRole()
  const canEditCustomer = canEdit("customers")
  const canEditOpp = canEdit("opportunities")
  const customer = getCustomer(id)

  const [note, setNote] = useState("")
  const [contactOpen, setContactOpen] = useState(false)
  const [oppOpen, setOppOpen] = useState(false)
  const [newContact, setNewContact] = useState({ name: "", title: "", phone: "", email: "", wechatAdded: false })

  const linkedRequests = useMemo(
    () => (customer ? requests.filter((r) => r.data.companyName === customer.companyName) : []),
    [requests, customer],
  )
  const linkedOpps = useMemo(
    () => (customer ? opportunities.filter((o) => o.customerId === customer.id) : []),
    [opportunities, customer],
  )
  const linkedContracts = useMemo(
    () => (customer ? contracts.filter((c) => c.customerId === customer.id) : []),
    [contracts, customer],
  )

  if (!customer) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">未找到该客户。</p>
        <Link href="/customers" className="mt-3 inline-block text-sm text-primary hover:underline">
          返回客户列表
        </Link>
      </div>
    )
  }

  const meta = CUSTOMER_STATUS_META[customer.status]

  function submitNote() {
    if (!note.trim()) {
      toast.error("请输入跟进内容")
      return
    }
    addCustomerNote(customer.id, note.trim())
    setNote("")
    toast.success("跟进记录已添加")
  }

  function submitContact() {
    if (!newContact.name.trim()) {
      toast.error("请输入联系人姓名")
      return
    }
    addContact(customer.id, { ...newContact, isPrimary: false, active: true })
    setNewContact({ name: "", title: "", phone: "", email: "", wechatAdded: false })
    setContactOpen(false)
    toast.success("联系人已添加")
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回客户列表
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="flex items-center gap-1.5 text-xl font-semibold tracking-tight">
              {customer.isKey && <Star className="size-5 fill-amber-400 text-amber-400" />}
              {customer.brandName || customer.companyName}
            </h1>
            <Pill label={meta.label} tone={meta.tone} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {customer.companyName} · {customer.region} · 负责人：{customer.owner}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEditCustomer ? (
            <select
              value={customer.status}
              onChange={(e) => {
                updateCustomer(customer.id, { status: e.target.value as CustomerStatus })
                toast.success("客户状态已更新")
              }}
              className="h-9 rounded-lg border border-border bg-card px-3 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {CUSTOMER_STATUS_META[s].label}
                </option>
              ))}
            </select>
          ) : (
            <Pill label={meta.label} tone={meta.tone} />
          )}
          {canEditOpp && (
            <Button className="gap-1.5" onClick={() => setOppOpen(true)}>
              <Target className="size-4" />
              创建商机
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="info" className="mt-6">
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="info">基本信息</TabsTrigger>
          <TabsTrigger value="contacts">联系人 ({customer.contacts.length})</TabsTrigger>
          <TabsTrigger value="opps">商机 ({linkedOpps.length})</TabsTrigger>
          <TabsTrigger value="requests">需求单 ({linkedRequests.length})</TabsTrigger>
          <TabsTrigger value="follow">跟进记录 ({customer.notes.length})</TabsTrigger>
          <TabsTrigger value="contracts">合同 ({linkedContracts.length})</TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="info" className="mt-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <dl>
              <InfoRow label="公司名称">{customer.companyName}</InfoRow>
              <InfoRow label="品牌名称">{customer.brandName || "—"}</InfoRow>
              <InfoRow label="所属行业">
                {customer.industryL1}
                {customer.industryL2 ? ` / ${customer.industryL2}` : ""}
              </InfoRow>
              <InfoRow label="所在地区">
                {customer.region} · {customer.city}
              </InfoRow>
              <InfoRow label="成立时间">{customer.foundedDate || "—"}</InfoRow>
              <InfoRow label="统一社会信用代码">{customer.creditCode || "—"}</InfoRow>
              <InfoRow label="注册资金">{customer.registeredCapital ? `${customer.registeredCapital} 万元` : "—"}</InfoRow>
              <InfoRow label="公司规模">{customer.scale || "—"}</InfoRow>
              <InfoRow label="企业性质">{customer.nature || "—"}</InfoRow>
              <InfoRow label="客户来源">{customer.source}</InfoRow>
              <InfoRow label="销售负责人">{customer.owner}</InfoRow>
              <InfoRow label="SDR 转出日期">{customer.sdrTransferDate || "—"}</InfoRow>
              <InfoRow label="重点客户">{customer.isKey ? "是" : "否"}</InfoRow>
            </dl>
          </div>
        </TabsContent>

        {/* 联系人 */}
        <TabsContent value="contacts" className="mt-4">
          {canEditCustomer && (
            <div className="mb-3 flex justify-end">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setContactOpen(true)}>
                <UserPlus className="size-4" />
                添加联系人
              </Button>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {customer.contacts.map((ct) => (
              <ContactCard
                key={ct.id}
                contact={ct}
                editable={canEditCustomer}
                onSetPrimary={() => {
                  setPrimaryContact(customer.id, ct.id)
                  toast.success(`已将 ${ct.name} 设为主联系人`)
                }}
                onToggleActive={() => updateContact(customer.id, ct.id, { active: !ct.active })}
              />
            ))}
          </div>
          {customer.contacts.length === 0 && <EmptyState text="暂无联系人" />}
        </TabsContent>

        {/* 商机 */}
        <TabsContent value="opps" className="mt-4">
          <div className="space-y-2.5">
            {linkedOpps.map((o) => (
              <Link
                key={o.id}
                href={`/opportunities/${o.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/30"
              >
                <div>
                  <p className="font-medium">{o.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.projectTypes.join(" / ")} · 预计签约 {o.expectedSignDate || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums">{money(o.amount)}</span>
                  <Pill label={OPP_STAGE_META[o.stage].label} tone={OPP_STAGE_META[o.stage].tone} />
                </div>
              </Link>
            ))}
          </div>
          {linkedOpps.length === 0 && <EmptyState text="暂无商机，点击右上角「创建商机」" />}
        </TabsContent>

        {/* 需求单 */}
        <TabsContent value="requests" className="mt-4">
          <div className="space-y-2.5">
            {linkedRequests.map((r) => (
              <Link
                key={r.id}
                href={`/requests/${r.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/30"
              >
                <div>
                  <p className="font-medium">{brandDisplay(r.data)}</p>
                  <p className="font-mono text-xs text-muted-foreground">{r.code}</p>
                </div>
                <Pill label={STATUS_META[r.status].label} tone={STATUS_META[r.status].tone} />
              </Link>
            ))}
          </div>
          {linkedRequests.length === 0 && <EmptyState text="暂无关联需求单" />}
        </TabsContent>

        {/* 跟进记录 */}
        <TabsContent value="follow" className="mt-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            {canEditCustomer && (
              <div className="flex flex-col gap-2.5 rounded-xl bg-secondary/40 p-3 sm:flex-row sm:items-end">
                <Textarea
                  rows={2}
                  placeholder="记录本次与客户的沟通…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="flex-1"
                />
                <Button className="gap-1.5" onClick={submitNote}>
                  <MessageSquarePlus className="size-4" />
                  添加
                </Button>
              </div>
            )}
            <div className="mt-4 space-y-3">
              {customer.notes.length === 0 ? (
                <EmptyState text="暂无跟进记录" />
              ) : (
                [...customer.notes].reverse().map((n) => (
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
        </TabsContent>

        {/* 合同 */}
        <TabsContent value="contracts" className="mt-4">
          <div className="space-y-2.5">
            {linkedContracts.map((c) => (
              <Link
                key={c.id}
                href={`/contracts/${c.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/30"
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{c.code || "编号待生成"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums">{money(c.amount)}</span>
                  <Pill label={CONTRACT_STATUS_META[c.status].label} tone={CONTRACT_STATUS_META[c.status].tone} />
                </div>
              </Link>
            ))}
          </div>
          {linkedContracts.length === 0 && <EmptyState text="暂无合同" />}
        </TabsContent>
      </Tabs>

      {/* 添加联系人弹窗 */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加联系人</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="姓名"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            />
            <Input
              placeholder="职位"
              value={newContact.title}
              onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
            />
            <Input
              placeholder="手机号"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            />
            <Input
              placeholder="邮箱"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={newContact.wechatAdded}
                onCheckedChange={(v) => setNewContact({ ...newContact, wechatAdded: v === true })}
              />
              已添加企业微信
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactOpen(false)}>
              取消
            </Button>
            <Button onClick={submitContact}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {oppOpen && (
        <CreateOpportunityDialog
          customerId={customer.id}
          open={oppOpen}
          onOpenChange={setOppOpen}
          onCreated={(oid) => router.push(`/opportunities/${oid}`)}
        />
      )}
    </div>
  )
}

function ContactCard({
  contact,
  editable,
  onSetPrimary,
  onToggleActive,
}: {
  contact: Contact
  editable: boolean
  onSetPrimary: () => void
  onToggleActive: () => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 font-medium">
            {contact.name}
            {contact.isPrimary && <Pill label="主联系人" tone="info" />}
            {!contact.active && <Pill label="已离职" tone="neutral" />}
          </p>
          <p className="text-xs text-muted-foreground">{contact.title || "—"}</p>
        </div>
        {contact.wechatAdded && <Pill label="已加企微" tone="success" />}
      </div>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="w-12 shrink-0 text-muted-foreground">电话</dt>
          <dd>{contact.phone || "—"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-12 shrink-0 text-muted-foreground">邮箱</dt>
          <dd className="truncate">{contact.email || "—"}</dd>
        </div>
      </dl>
      {editable && (
        <div className="mt-3 flex gap-2">
          {!contact.isPrimary && contact.active && (
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={onSetPrimary}>
              <Star className="size-3" />
              设为主联系人
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={onToggleActive}>
            {contact.active ? "标记离职" : "恢复在职"}
          </Button>
        </div>
      )}
    </div>
  )
}
