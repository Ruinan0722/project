"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Copy, Lock, RotateCcw, Save, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { DEFAULT_PLATFORM, OPTIMIZATION_GOALS, emptyForm, type GeoFormData } from "@/lib/geo-data"
import { ChoiceCard, Field, RegionEditor, RowList, SectionCard } from "@/components/apply/form-bits"

const DRAFT_KEY = "geo-form-draft"

type Errors = Partial<Record<string, string>>

const PHONE_RE = /^1[3-9]\d{9}$/
const URL_RE = /^https?:\/\/.+\..+/

export function IntakeForm() {
  const [form, setForm] = useState<GeoFormData>(emptyForm)
  const [errors, setErrors] = useState<Errors>({})
  const [hydrated, setHydrated] = useState(false)
  const [submittedCode, setSubmittedCode] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(DRAFT_KEY)
      if (raw) {
        try {
          setForm({ ...emptyForm(), ...JSON.parse(raw) })
        } catch {
          /* ignore */
        }
      }
    }
    setHydrated(true)
  }, [])

  function set<K extends keyof GeoFormData>(key: K, val: GeoFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const progress = useMemo(() => {
    const checks = [
      !!form.companyName,
      !!form.contactName && !!form.contactTitle && !!form.contactPhone,
      !!form.brandName,
      form.products.some((p) => p.name.trim()),
      !!form.productFunction && !!form.productUsers && !!form.productScenario,
      form.hasOverseasSite === "no" || (form.hasOverseasSite === "yes" && !!form.overseasSiteUrl),
      form.regions.some((r) => r.country && r.language),
      form.platforms.length > 0,
      !!form.goal,
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [form])

  function validate(): Errors {
    const e: Errors = {}
    if (!form.companyName.trim()) e.companyName = "请填写公司名称"
    if (!form.contactName.trim()) e.contactName = "请填写联系人姓名"
    if (!form.contactTitle.trim()) e.contactTitle = "请填写联系人职位"
    if (!form.contactPhone.trim()) e.contactPhone = "请填写手机号"
    else if (!PHONE_RE.test(form.contactPhone.trim())) e.contactPhone = "手机号格式不正确"
    if (!form.brandName.trim()) e.brandName = "请填写品牌名称"
    if (!form.products.some((p) => p.name.trim())) e.products = "请至少填写一个产品或服务"
    if (!form.productFunction.trim() || !form.productUsers.trim() || !form.productScenario.trim())
      e.productIntro = "请完整填写产品功能、用户群体与应用场景"
    if (!form.hasOverseasSite) e.hasOverseasSite = "请选择是否有海外官网"
    if (form.hasOverseasSite === "yes") {
      if (!form.overseasSiteUrl.trim()) e.overseasSiteUrl = "请填写海外官网地址"
      else if (!URL_RE.test(form.overseasSiteUrl.trim())) e.overseasSiteUrl = "请输入完整有效的网址（含 http/https）"
    }
    if (!form.regions.some((r) => r.country && r.language)) e.regions = "请至少添加一组完整的国家与语言"
    if (!form.goal) e.goal = "请选择具体优化目标"
    return e
  }

  function saveDraft() {
    if (typeof window !== "undefined") window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    toast.success("草稿已保存", { description: "您可以稍后回到此页面继续填写。" })
  }

  function submit() {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) {
      toast.error("还有必填信息未完成", { description: "请检查标红的项目后再提交。" })
      const firstKey = Object.keys(e)[0]
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    if (typeof window !== "undefined") window.localStorage.removeItem(DRAFT_KEY)
    const code = `GEO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000 + 1000)}`
    setSubmittedCode(code)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function resetForm() {
    setForm(emptyForm())
    setErrors({})
    setSubmittedCode(null)
  }

  function addProduct() {
    set("products", [...form.products, { id: `p${Date.now()}`, name: "" }])
  }
  function updateProduct(id: string, name: string) {
    set("products", form.products.map((p) => (p.id === id ? { ...p, name } : p)))
  }
  function removeProduct(id: string) {
    set("products", form.products.filter((p) => p.id !== id))
  }

  if (!hydrated) return null

  if (submittedCode) {
    return <SubmitSuccess code={submittedCode} onReset={resetForm} />
  }

  return (
    <div>
      {/* 页内顶栏：进度 + 保存草稿 */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-5">
          <div>
            <h1 className="text-base font-semibold tracking-tight">客户需求填报</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">海外 GEO 优化需求收集</p>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="hidden flex-1 items-center gap-2 sm:flex">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="w-9 text-right text-xs font-medium tabular-nums text-muted-foreground">{progress}%</span>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={saveDraft}>
              <Save className="size-4" />
              保存草稿
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 md:py-10">
        <div className="mb-7 rounded-2xl border border-border bg-card p-5 md:p-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
            <Sparkles className="size-3.5" />
            预计用时 3—5 分钟
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance">海外 GEO 优化需求收集</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            为了更准确地了解您的业务和优化需求，请填写以下基础信息。不确定的内容可以选择“暂不清楚”，后续由项目顾问协助确认。
          </p>
        </div>

        <div className="space-y-6">
          {/* 模块一 */}
          <SectionCard step="一" title="项目联系人" desc="收集公司及联系人信息">
            <div id="field-companyName">
              <Field label="1. 公司名称" required hint="请输入本次合作对应的公司主体。" example="字节跳动有限公司" error={errors.companyName}>
                <Input placeholder="请输入公司名称" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
              </Field>
            </div>
            <div id="field-contactName" className="grid gap-4 sm:grid-cols-3">
              <Field label="2. 联系人姓名" required error={errors.contactName}>
                <Input placeholder="张三" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
              </Field>
              <div id="field-contactTitle">
                <Field label="3. 职位" required error={errors.contactTitle}>
                  <Input placeholder="海外市场经理" value={form.contactTitle} onChange={(e) => set("contactTitle", e.target.value)} />
                </Field>
              </div>
              <div id="field-contactPhone">
                <Field label="4. 手机号" required error={errors.contactPhone}>
                  <Input inputMode="tel" placeholder="13800000000" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* 模块二 */}
          <SectionCard step="二" title="品牌与产品信息" desc="收集品牌、产品、介绍及官网信息">
            <div id="field-brandName">
              <Field
                label="5. 希望优化的品牌名称"
                required
                hint="请填写希望在 ChatGPT 中提升曝光和推荐表现的品牌。"
                error={errors.brandName}
              >
                <Input placeholder="例如：某出海消费电子品牌" value={form.brandName} onChange={(e) => set("brandName", e.target.value)} />
              </Field>
            </div>
            <div id="field-products">
              <Field
                label="6. 希望优化的产品或服务"
                required
                hint="请填写本次重点优化的产品、产品线或服务，可添加多个。"
                error={errors.products}
              >
                <RowList
                  value={form.products.map((p) => p.name)}
                  onChange={(names) =>
                    set(
                      "products",
                      names.map((name, i) => ({ id: form.products[i]?.id ?? `p${Date.now()}${i}`, name })),
                    )
                  }
                  placeholder={() => "例如：AI 图片生成工具、户外储能电源、跨境物流服务"}
                  addLabel="添加产品或服务"
                />
              </Field>
            </div>
            <div id="field-productIntro">
              <Field
                label="7. 请简单介绍该产品或服务"
                required
                hint="请分别填写以下三项，便于我们快速理解您的业务。"
                error={errors.productIntro}
              >
                <div className="space-y-2.5">
                  <Input
                    placeholder="1. 请简单说明产品功能"
                    value={form.productFunction}
                    onChange={(e) => set("productFunction", e.target.value)}
                  />
                  <Input
                    placeholder="2. 主要用户是哪些群体"
                    value={form.productUsers}
                    onChange={(e) => set("productUsers", e.target.value)}
                  />
                  <Input
                    placeholder="3. 应用场景"
                    value={form.productScenario}
                    onChange={(e) => set("productScenario", e.target.value)}
                  />
                </div>
              </Field>
            </div>
            <div id="field-hasOverseasSite">
              <Field label="8. 是否有海外官方网站？" required error={errors.hasOverseasSite}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ChoiceCard selected={form.hasOverseasSite === "yes"} onSelect={() => set("hasOverseasSite", "yes")} title="有海外官网" />
                  <ChoiceCard selected={form.hasOverseasSite === "no"} onSelect={() => set("hasOverseasSite", "no")} title="暂无海外官网" />
                </div>
              </Field>
            </div>
            {form.hasOverseasSite === "yes" && (
              <div id="field-overseasSiteUrl" className="rounded-xl border border-dashed border-primary/40 bg-accent/30 p-4">
                <Field
                  label="9. 海外官网地址"
                  required
                  hint="请输入完整的海外官网地址。"
                  error={errors.overseasSiteUrl}
                >
                  <Input inputMode="url" placeholder="https://" value={form.overseasSiteUrl} onChange={(e) => set("overseasSiteUrl", e.target.value)} />
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3.5 text-primary" />
                    出于品牌保密考虑，网址在系统中将以脱敏方式存储与展示。
                  </p>
                </Field>
              </div>
            )}
          </SectionCard>

          {/* 模块三 */}
          <SectionCard step="三" title="GEO 优化需求" desc="收集国家语言、平台、用户问题及优化目标">
            <div id="field-regions">
              <Field
                label="10. 希望重点优化的国家与语言"
                required
                hint="选择目标国家与语言，可添加多组，例如：美国-英语；英国-英语。"
                error={errors.regions}
              >
                <RegionEditor value={form.regions} onChange={(v) => set("regions", v)} />
              </Field>
            </div>
            <div id="field-platforms">
              <Field label="11. 希望优化的 AI 平台" required hint="当前仅支持 ChatGPT，已默认选中。">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-3.5 py-1.5 text-sm text-primary-foreground">
                  <CheckCircle2 className="size-3.5" />
                  {DEFAULT_PLATFORM}
                </div>
              </Field>
            </div>
            <Field label="12. 您希望用户搜索什么问题时看到您的品牌？" hint="此项选填，不清楚可以由项目团队协助挖掘。">
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <ChoiceCard selected={form.intentType === "clear"} onSelect={() => set("intentType", "clear")} title="我有明确的问题" desc="可填写多个，一个问题一行" />
                  <ChoiceCard
                    selected={form.intentType === "rough"}
                    onSelect={() => set("intentType", "rough")}
                    title="我只有大致业务方向"
                    desc="由项目团队协助挖掘"
                  />
                </div>
                {form.intentType === "clear" && (
                  <RowList
                    value={form.intentQuestions}
                    onChange={(v) => set("intentQuestions", v)}
                    placeholder={() => "例如：哪个 AI 工具适合制作海报？"}
                    addLabel="添加一个问题"
                  />
                )}
                {form.intentType === "rough" && (
                  <Textarea
                    rows={3}
                    placeholder="例如：希望用户询问 AI 海报设计、商品图制作或 AI 设计工具推荐时看到我们的品牌"
                    value={form.intentRough}
                    onChange={(e) => set("intentRough", e.target.value)}
                  />
                )}
              </div>
            </Field>
            <div id="field-goal">
              <Field
                label="13. 您的具体优化目标"
                required
                hint="请选择本次项目的核心考核指标，四选一。最终目标及考核规则将以双方确认的 SOW 为准。"
                error={errors.goal}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  {OPTIMIZATION_GOALS.map((g) => (
                    <ChoiceCard key={g.value} selected={form.goal === g.value} onSelect={() => set("goal", g.value)} title={g.label} desc={g.desc} />
                  ))}
                </div>
              </Field>
            </div>
          </SectionCard>

          <div className="rounded-2xl border border-border bg-secondary/40 p-5 text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">提交后，项目团队将基于以上信息完成：</p>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {["网站及 GEO 基础诊断", "用户意图挖掘", "优化范围确认", "KPI 及服务周期确认", "SOW 内容整理"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" size="lg" className="gap-1.5" onClick={saveDraft}>
              <Save className="size-4" />
              保存草稿
            </Button>
            <Button size="lg" className="gap-1.5" onClick={submit}>
              <Send className="size-4" />
              提交需求
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

function SubmitSuccess({ code, onReset }: { code: string; onReset: () => void }) {
  function copyCode() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code)
      toast.success("需求编号已复制")
    }
  }
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center px-5 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-accent text-primary">
        <CheckCircle2 className="size-9" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-balance">需求提交成功</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        感谢您的填写！项目团队会尽快与您联系，并基于这份需求开展 GEO 诊断、意图挖掘与方案准备。
      </p>
      <div className="mt-6 w-full rounded-2xl border border-border bg-card p-5">
        <p className="text-xs text-muted-foreground">您的需求编号</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="font-mono text-lg font-semibold">{code}</span>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={copyCode}>
            <Copy className="size-3.5" />
            复制
          </Button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">请保存此编号，以便后续与项目顾问沟通时核对。</p>
      </div>
      <Button variant="ghost" className="mt-6 gap-1.5" onClick={onReset}>
        <RotateCcw className="size-4" />
        再填写一份新的需求
      </Button>
    </main>
  )
}
