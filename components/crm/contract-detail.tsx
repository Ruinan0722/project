"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, Check, FileText, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  CONTRACT_STATUS_META,
  PROJECT_STATUS_META,
  money,
  type Contract,
  type ProjectStatus,
} from "@/lib/crm-data"

const PROJECT_OPTIONS: ProjectStatus[] = ["not_started", "ongoing", "completed", "closed"]

function genCode() {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  return `HT-${ymd}-${String(Math.floor(Math.random() * 900) + 100)}`
}

export function ContractDetail({ id }: { id: string }) {
  const { getContract, getCustomer, updateContract } = useCrm()
  const contract = getContract(id)
  const [signOpen, setSignOpen] = useState(false)

  if (!contract) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">未找到该合同。</p>
        <Link href="/contracts" className="mt-3 inline-block text-sm text-primary hover:underline">
          返回合同列表
        </Link>
      </div>
    )
  }

  const customer = getCustomer(contract.customerId)
  const meta = CONTRACT_STATUS_META[contract.status]

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
      <Link
        href="/contracts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回合同列表
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight">{contract.name}</h1>
            <Pill label={meta.label} tone={meta.tone} />
          </div>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{contract.code || "编号待生成"}</p>
        </div>
        <div className="flex items-center gap-2">
          {(contract.status === "pending" || contract.status === "signing") && (
            <Button className="gap-1.5" onClick={() => setSignOpen(true)}>
              <Check className="size-4" />
              完成签署
            </Button>
          )}
          {contract.status === "signed" && (
            <select
              value={contract.projectStatus}
              onChange={(e) => {
                updateContract(contract.id, { projectStatus: e.target.value as ProjectStatus })
                toast.success("项目状态已更新")
              }}
              className="h-9 rounded-lg border border-border bg-card px-3 text-sm"
            >
              {PROJECT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  项目：{PROJECT_STATUS_META[s].label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <Tabs defaultValue="basic" className="mt-6">
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="sign">签约信息</TabsTrigger>
          <TabsTrigger value="amount">金额与周期</TabsTrigger>
          <TabsTrigger value="files">附件 ({contract.attachments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <dl>
              <InfoRow label="合同名称">{contract.name}</InfoRow>
              <InfoRow label="合同编号">{contract.code || "编号待生成"}</InfoRow>
              <InfoRow label="客户">
                {customer ? (
                  <Link href={`/customers/${customer.id}`} className="text-primary hover:underline">
                    {contract.company}
                  </Link>
                ) : (
                  contract.company
                )}
              </InfoRow>
              <InfoRow label="所在地区">
                {contract.region} · {contract.city}
              </InfoRow>
              <InfoRow label="合同类型">{contract.type}</InfoRow>
              <InfoRow label="签约类型">{contract.signType}</InfoRow>
              <InfoRow label="合同状态">
                <Pill label={meta.label} tone={meta.tone} />
              </InfoRow>
              <InfoRow label="项目状态">
                <Pill
                  label={PROJECT_STATUS_META[contract.projectStatus].label}
                  tone={PROJECT_STATUS_META[contract.projectStatus].tone}
                />
              </InfoRow>
              <InfoRow label="关联商机">
                <Link href={`/opportunities/${contract.opportunityId}`} className="text-primary hover:underline">
                  查看商机
                </Link>
              </InfoRow>
            </dl>
          </div>
        </TabsContent>

        <TabsContent value="sign" className="mt-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <dl>
              <InfoRow label="签约主体">{contract.signSubject || "—"}</InfoRow>
              <InfoRow label="合同签订人">{contract.signer || "—"}</InfoRow>
              <InfoRow label="销售负责人">{contract.owner}</InfoRow>
              <InfoRow label="直属上级">{contract.signerManager || "—"}</InfoRow>
              <InfoRow label="签约部门">{contract.dept || "—"}</InfoRow>
              <InfoRow label="双方签署日期">{contract.dualSignDate || "—"}</InfoRow>
            </dl>
          </div>
        </TabsContent>

        <TabsContent value="amount" className="mt-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <dl>
              <InfoRow label="合同金额">
                <span className="text-base font-semibold">{money(contract.amount)}</span>
              </InfoRow>
              <InfoRow label="生效日期">{contract.effectiveDate || "—"}</InfoRow>
              <InfoRow label="有效期">{contract.validMonths ? `${contract.validMonths} 个月` : "—"}</InfoRow>
              <InfoRow label="到期日期">{contract.endDate || "—"}</InfoRow>
            </dl>
          </div>
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <div className="space-y-2.5">
            {contract.attachments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.kind === "contract" ? "合同文件" : "SOW 文档"}</p>
                  </div>
                </div>
                <Pill label={a.kind === "contract" ? "合同" : "SOW"} tone="info" />
              </div>
            ))}
            {contract.attachments.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-12 text-center">
                <Paperclip className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">暂无附件，签署完成后可上传合同与 SOW 文档</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {signOpen && (
        <SignContractDialog contract={contract} open={signOpen} onOpenChange={setSignOpen} onGenCode={genCode} />
      )}
    </div>
  )
}

function SignContractDialog({
  contract,
  open,
  onOpenChange,
  onGenCode,
}: {
  contract: Contract
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenCode: () => string
}) {
  const { updateContract, getCustomer } = useCrm()
  const customer = getCustomer(contract.customerId)
  const [form, setForm] = useState({
    signSubject: contract.signSubject || customer?.companyName || "",
    signer: contract.signer || customer?.contacts.find((c) => c.isPrimary)?.name || "",
    amount: contract.amount ? String(contract.amount) : "",
    effectiveDate: contract.effectiveDate || "",
    validMonths: contract.validMonths ? String(contract.validMonths) : "6",
    dualSignDate: contract.dualSignDate || new Date().toISOString().slice(0, 10),
  })

  function submit() {
    if (!form.signSubject.trim() || !form.amount || !form.effectiveDate) {
      toast.error("请填写签约主体、合同金额与生效日期")
      return
    }
    const months = Number(form.validMonths) || 6
    const eff = new Date(form.effectiveDate)
    const end = new Date(eff)
    end.setMonth(end.getMonth() + months)
    updateContract(contract.id, {
      code: contract.code || onGenCode(),
      status: "signed",
      projectStatus: "not_started",
      signSubject: form.signSubject.trim(),
      signer: form.signer.trim(),
      amount: Number(form.amount),
      effectiveDate: form.effectiveDate,
      validMonths: months,
      endDate: end.toISOString().slice(0, 10),
      dualSignDate: form.dualSignDate,
      attachments:
        contract.attachments.length > 0
          ? contract.attachments
          : [
              { id: `a${Date.now()}`, name: `${contract.name}.pdf`, kind: "contract" as const },
              { id: `a${Date.now() + 1}`, name: `${contract.name}-SOW.pdf`, kind: "sow" as const },
            ],
    })
    onOpenChange(false)
    toast.success("合同已签署完成")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>完成签署</DialogTitle>
          <DialogDescription>填写签约信息，确认后合同状态将更新为「已签订」并自动生成合同编号。</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">签约主体</label>
            <Input value={form.signSubject} onChange={(e) => setForm({ ...form, signSubject: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">合同签订人</label>
            <Input value={form.signer} onChange={(e) => setForm({ ...form, signer: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">合同金额（元）</label>
              <Input
                inputMode="numeric"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9]/g, "") })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">有效期（月）</label>
              <Input
                inputMode="numeric"
                value={form.validMonths}
                onChange={(e) => setForm({ ...form, validMonths: e.target.value.replace(/[^0-9]/g, "") })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">生效日期</label>
              <Input
                type="date"
                value={form.effectiveDate}
                onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">双方签署日期</label>
              <Input
                type="date"
                value={form.dualSignDate}
                onChange={(e) => setForm({ ...form, dualSignDate: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={submit}>确认签署</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
