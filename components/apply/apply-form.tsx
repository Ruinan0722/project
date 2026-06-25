"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Save, Send, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  AI_PLATFORM_OPTIONS,
  COUNTRY_OPTIONS,
  LANGUAGE_OPTIONS,
  OPTIMIZATION_GOALS,
  emptyForm,
  type GeoFormData,
} from "@/lib/geo-data"
import { ChipGroup, ChoiceCard, Field, SectionCard } from "./form-bits"

const DRAFT_KEY = "geo-form-draft"

type Errors = Partial<Record<string, string>>

const PHONE_RE = /^1[3-9]\d{9}$/
const URL_RE = /^https?:\/\/.+\..+/

export function ApplyForm({ resumeDraft = false }: { resumeDraft?: boolean }) {
  const router = useRouter()
  const [form, setForm] = useState<GeoFormData>(emptyForm)
  const [errors, setErrors] = useState<Errors>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (resumeDraft && typeof window !== "undefined") {
      const raw = window.localStorage.getItem(DRAFT_KEY)
      if (raw) {
        try {
          setForm({ ...emptyForm(), ...JSON.parse(raw) })
          toast.info("已载入上次保存的草稿")
        } catch {
          /* ignore */
        }
      }
    }
    setHydrated(true)
  }, [resumeDraft])

  function set<K extends keyof GeoFormData>(key: K, val: GeoFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  // 完成度
  const progress = useMemo(() => {
    const checks = [
      !!form.companyName,
      !!form.contactName && !!form.contactTitle && !!form.contactPhone,
      !!form.brandName,
      form.products.some((p) => p.name.trim()),
      !!form.productIntro,
      form.hasOverseasSite === "no" || (form.hasOverseasSite === "yes" && !!form.overseasSiteUrl),
      form.countries.length > 0,
      form.languages.length > 0,
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
    if (!form.productIntro.trim()) e.productIntro = "请简单介绍该产品或服务"
    if (!form.hasOverseasSite) e.hasOverseasSite = "请选择是否有海外官网"
    if (form.hasOverseasSite === "yes") {
      if (!form.overseasSiteUrl.trim()) e.overseasSiteUrl = "请填写海外官网地址"
      else if (!URL_RE.test(form.overseasSiteUrl.trim())) e.overseasSiteUrl = "请输入完整有效的网址（含 http/https）"
    }
    if (form.countries.length === 0) e.countries = "请选择目标国家或地区"
    if (form.languages.length === 0) e.languages = "请选择目标语言"
    if (form.platforms.length === 0) e.platforms = "请选择至少一个 AI 平台"
    if (!form.goal) e.goal = "请选择具体优化目标"
    return e
  }

  function saveDraft() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    }
    toast.success("草稿已保存", { description: "您可以稍后通过链接继续填写。" })
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
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_KEY)
    }
    const code = `GEO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000 + 1000)}`
    router.push(`/apply/success?code=${code}`)
  }

  // 产品列表操作
  function addProduct() {
    set("products", [...form.products, { id: `p${Date.now()}`, name: "" }])
  }
  function updateProduct(id: string, name: string) {
    set(
      "products",
      form.products.map((p) => (p.id === id ? { ...p, name } : p)),
    )
  }
  function removeProduct(id: string) {
    set(
      "products",
      form.products.filter((p) => p.id !== id),
    )
  }

  if (!hydrated) return null

  return (
    <div className="min-h-screen">
      {/* 顶栏 */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-5">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            返回首页
          </Link>
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
        {/* 引导说明 */}
        <div className="mb-7 rounded-2xl border border-border bg-card p-5 md:p-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
            <Sparkles className="size-3.5" />
            预计用时 3—5 分钟
          </span>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">海外 GEO 优化需求收集</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            为了更准确地了解您的业务和优化需求，请填写以下基础信息。不确定的内容可以选择“暂不清楚”，后续由项目顾问协助确认。
          </p>
        </div>

        <div className="space-y-6">
          {/* 模块一 */}
          <SectionCard step="一" title="项目联系人" desc="收集公司及联系人信息">
            <div id="field-companyName">
              <Field
                label="公司名称"
                required
                hint="请输入本次合作对应的公司主体。"
                example="字节跳动有限公司"
                error={errors.companyName}
              >
                <Input
                  placeholder="请输入公司名称"
                  value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                />
              </Field>
            </div>

            <div id="field-contactName" className="grid gap-4 sm:grid-cols-3">
              <Field label="联系人姓名" required error={errors.contactName}>
                <Input placeholder="张三" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
              </Field>
              <div id="field-contactTitle">
                <Field label="职位" required error={errors.contactTitle}>
                  <Input
                    placeholder="海外市场经理"
                    value={form.contactTitle}
                    onChange={(e) => set("contactTitle", e.target.value)}
                  />
                </Field>
              </div>
              <div id="field-contactPhone">
                <Field label="手机号" required error={errors.contactPhone}>
                  <Input
                    inputMode="tel"
                    placeholder="13800000000"
                    value={form.contactPhone}
                    onChange={(e) => set("contactPhone", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* 模块二 */}
          <SectionCard step="二" title="品牌与产品信息" desc="收集品牌、产品、介绍及官网信息">
            <div id="field-brandName">
              <Field
                label="希望优化的品牌名称"
                required
                hint="请填写希望在 ChatGPT 等 AI 平台中提升曝光和推荐表现的品牌。"
                example="Dreamina、Anker、EcoFlow"
                error={errors.brandName}
              >
                <Input
                  placeholder="请输入品牌名称"
                  value={form.brandName}
                  onChange={(e) => set("brandName", e.target.value)}
                />
              </Field>
            </div>

            <div id="field-products">
              <Field
                label="希望优化的产品或服务"
                required
                hint="请填写本次重点优化的产品、产品线或服务，可添加多个。"
                example="AI 图片生成工具、户外储能电源、跨境物流服务"
                error={errors.products}
              >
                <div className="space-y-2">
                  {form.products.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <Input
                        placeholder={`例如：AI 图片生成工具`}
                        value={p.name}
                        onChange={(e) => updateProduct(p.id, e.target.value)}
                      />
                      {form.products.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground"
                          onClick={() => removeProduct(p.id)}
                          aria-label={`删除第 ${i + 1} 个产品`}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addProduct}>
                    <Plus className="size-4" />
                    添加产品或服务
                  </Button>
                </div>
              </Field>
            </div>

            <div id="field-productIntro">
              <Field
                label="请简单介绍该产品或服务"
                required
                hint="建议用一句话说明产品做什么、主要面向哪些用户，以及主要应用场景。"
                example={
                  <span>
                    Dreamina 是一款面向设计师、内容创作者和营销人员的 AI 设计工具；设计师、产品经理等；可用于图片生成、海报设计、商品图制作。
                  </span>
                }
                error={errors.productIntro}
              >
                <Textarea
                  rows={3}
                  placeholder={"1. 请简单说明产品功能\n2. 主要用户是哪些群体\n3. 应用场景"}
                  value={form.productIntro}
                  onChange={(e) => set("productIntro", e.target.value)}
                />
              </Field>
            </div>

            <div id="field-hasOverseasSite">
              <Field label="是否有海外官方网站？" required error={errors.hasOverseasSite}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ChoiceCard
                    selected={form.hasOverseasSite === "yes"}
                    onSelect={() => set("hasOverseasSite", "yes")}
                    title="有海外官网"
                  />
                  <ChoiceCard
                    selected={form.hasOverseasSite === "no"}
                    onSelect={() => set("hasOverseasSite", "no")}
                    title="暂无海外官网"
                  />
                </div>
              </Field>
            </div>

            {/* 条件展示 */}
            {form.hasOverseasSite === "yes" && (
              <div id="field-overseasSiteUrl" className="rounded-xl border border-dashed border-primary/40 bg-accent/30 p-4">
                <Field
                  label="海外官网地址"
                  required
                  hint="请输入完整的海外官网地址。"
                  example="https://dreamina.capcut.com/"
                  error={errors.overseasSiteUrl}
                >
                  <Input
                    inputMode="url"
                    placeholder="https://"
                    value={form.overseasSiteUrl}
                    onChange={(e) => set("overseasSiteUrl", e.target.value)}
                  />
                </Field>
              </div>
            )}
          </SectionCard>

          {/* 模块三 */}
          <SectionCard step="三" title="GEO 优化需求" desc="收集国家、语言、平台、用户问题及优化目标">
            <div id="field-countries">
              <Field
                label="希望重点优化的国家或地区"
                required
                hint="支持多选。"
                error={errors.countries}
              >
                <ChipGroup options={COUNTRY_OPTIONS} value={form.countries} onChange={(v) => set("countries", v)} />
              </Field>
            </div>

            <div id="field-languages">
              <Field
                label="希望重点优化的语言"
                required
                hint={
                  form.countries.length === 0
                    ? "请先选择目标国家或地区，再选择目标语言。国家和语言需要分开填写。"
                    : "支持多选，国家和语言需要分开填写。"
                }
                error={errors.languages}
              >
                {form.countries.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    选择目标国家后可在此选择目标语言
                  </div>
                ) : (
                  <ChipGroup options={LANGUAGE_OPTIONS} value={form.languages} onChange={(v) => set("languages", v)} />
                )}
              </Field>
            </div>

            <div id="field-platforms">
              <Field
                label="希望优化的 AI 平台"
                required
                hint="支持多选，默认已选择 ChatGPT。"
                error={errors.platforms}
              >
                <ChipGroup options={AI_PLATFORM_OPTIONS} value={form.platforms} onChange={(v) => set("platforms", v)} />
              </Field>
            </div>

            <Field
              label="您希望用户搜索什么问题时看到您的品牌？"
              hint="此项选填，不清楚可以由项目团队协助挖掘。"
            >
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <ChoiceCard
                    selected={form.intentType === "clear"}
                    onSelect={() => set("intentType", "clear")}
                    title="我有明确的问题"
                  />
                  <ChoiceCard
                    selected={form.intentType === "rough"}
                    onSelect={() => set("intentType", "rough")}
                    title="我只有大致业务方向"
                    desc="由项目团队协助挖掘"
                  />
                </div>
                {form.intentType === "clear" && (
                  <Textarea
                    rows={4}
                    placeholder={"请填写 1—5 个用户可能会在 AI 平台中提出的问题\n例如：哪个 AI 工具适合制作海报？"}
                    value={form.intentClear}
                    onChange={(e) => set("intentClear", e.target.value)}
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
                label="您的具体优化目标"
                required
                hint="请选择本次项目的核心考核指标，四选一。最终目标及考核规则将以双方确认的 SOW 为准。"
                error={errors.goal}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  {OPTIMIZATION_GOALS.map((g) => (
                    <ChoiceCard
                      key={g.value}
                      selected={form.goal === g.value}
                      onSelect={() => set("goal", g.value)}
                      title={g.label}
                      desc={g.desc}
                    />
                  ))}
                </div>
              </Field>
            </div>
          </SectionCard>

          {/* 提交说明 */}
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

          {/* 操作按钮 */}
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
