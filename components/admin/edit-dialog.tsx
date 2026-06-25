"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChipGroup, ChoiceCard, Field } from "@/components/apply/form-bits"
import { useAdmin } from "./store"
import {
  AI_PLATFORM_OPTIONS,
  COUNTRY_OPTIONS,
  LANGUAGE_OPTIONS,
  OPTIMIZATION_GOALS,
  type GeoFormData,
  type RequestRecord,
} from "@/lib/geo-data"
import { toast } from "sonner"

export function EditDialog({
  open,
  onOpenChange,
  record,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  record: RequestRecord
}) {
  const { updateData } = useAdmin()
  const [draft, setDraft] = useState<GeoFormData>(record.data)

  useEffect(() => {
    if (open) setDraft(record.data)
  }, [open, record.data])

  function set<K extends keyof GeoFormData>(key: K, val: GeoFormData[K]) {
    setDraft((d) => ({ ...d, [key]: val }))
  }

  function save() {
    updateData(record.id, draft)
    onOpenChange(false)
    toast.success("客户信息已更新")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑客户信息</DialogTitle>
          <DialogDescription>内部人员可补充或修正客户提交的信息，保存后将更新需求记录。</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="公司名称" required>
              <Input value={draft.companyName} onChange={(e) => set("companyName", e.target.value)} />
            </Field>
            <Field label="品牌名称" required>
              <Input value={draft.brandName} onChange={(e) => set("brandName", e.target.value)} />
            </Field>
            <Field label="联系人姓名" required>
              <Input value={draft.contactName} onChange={(e) => set("contactName", e.target.value)} />
            </Field>
            <Field label="职位" required>
              <Input value={draft.contactTitle} onChange={(e) => set("contactTitle", e.target.value)} />
            </Field>
            <Field label="手机号" required>
              <Input value={draft.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
            </Field>
          </div>

          <Field label="产品介绍" required>
            <Textarea rows={3} value={draft.productIntro} onChange={(e) => set("productIntro", e.target.value)} />
          </Field>

          <Field label="是否有海外官网" required>
            <div className="grid gap-2 sm:grid-cols-2">
              <ChoiceCard selected={draft.hasOverseasSite === "yes"} onSelect={() => set("hasOverseasSite", "yes")} title="有海外官网" />
              <ChoiceCard selected={draft.hasOverseasSite === "no"} onSelect={() => set("hasOverseasSite", "no")} title="暂无海外官网" />
            </div>
          </Field>
          {draft.hasOverseasSite === "yes" && (
            <Field label="海外官网地址" required>
              <Input value={draft.overseasSiteUrl} onChange={(e) => set("overseasSiteUrl", e.target.value)} />
            </Field>
          )}

          <Field label="目标国家或地区" required>
            <ChipGroup options={COUNTRY_OPTIONS} value={draft.countries} onChange={(v) => set("countries", v)} />
          </Field>
          <Field label="目标语言" required>
            <ChipGroup options={LANGUAGE_OPTIONS} value={draft.languages} onChange={(v) => set("languages", v)} />
          </Field>
          <Field label="AI 平台" required>
            <ChipGroup options={AI_PLATFORM_OPTIONS} value={draft.platforms} onChange={(v) => set("platforms", v)} />
          </Field>
          <Field label="具体优化目标" required>
            <div className="grid gap-2 sm:grid-cols-2">
              {OPTIMIZATION_GOALS.map((g) => (
                <ChoiceCard key={g.value} selected={draft.goal === g.value} onSelect={() => set("goal", g.value)} title={g.label} />
              ))}
            </div>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={save}>保存修改</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
