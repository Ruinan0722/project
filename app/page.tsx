import Link from "next/link"
import {
  ArrowRight,
  Clock,
  ShieldCheck,
  Sparkles,
  UserRound,
  Boxes,
  Target,
  FileCheck2,
  LayoutDashboard,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const MODULES = [
  {
    icon: UserRound,
    step: "01",
    title: "项目联系人",
    desc: "公司名称与项目对接人信息，便于后续沟通对接。",
  },
  {
    icon: Boxes,
    step: "02",
    title: "品牌与产品信息",
    desc: "希望优化的品牌、产品或服务介绍及海外官网。",
  },
  {
    icon: Target,
    step: "03",
    title: "GEO 优化需求",
    desc: "目标国家、语言、AI 平台、用户问题与优化目标。",
  },
]

const VALUES = [
  { icon: Clock, title: "3—5 分钟完成", desc: "只收集后续业务真正需要的基础信息，不要求填写专业执行方案。" },
  { icon: Sparkles, title: "通俗易懂有示例", desc: "避免专业术语，每个问题都配有填写说明与示例。" },
  { icon: ShieldCheck, title: "正式可信", desc: "数据安全保存，仅用于本次 GEO 项目的诊断与服务。" },
]

const FLOW = ["需求收集", "GEO 诊断", "意图挖掘", "SOW 确认", "解决方案", "项目交付"]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">海外 GEO 客户需求收集系统</span>
          </div>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <LayoutDashboard className="size-4" />
              内部管理后台
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground ring-1 ring-inset ring-accent-foreground/15">
              <Sparkles className="size-3.5" />
              进入海外 GEO 项目的第一步
            </span>
            <h1 className="mt-5 text-pretty text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              填写一次基础信息，
              <br className="hidden sm:block" />
              贯通诊断、SOW 与项目交付
            </h1>
            <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              我们将根据您提交的信息完成网站与 GEO 基础诊断、用户意图挖掘、优化范围与目标确认。
              全程通俗引导，预计只需 3—5 分钟。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/apply">
                <Button size="lg" className="gap-2">
                  开始填写需求
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/apply?draft=1">
                <Button size="lg" variant="outline">
                  继续填写草稿
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 三个模块 */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight">您需要填写三个模块</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            内容已由多个部门统一确认，仅保留后续业务真正需要的基础信息。
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {MODULES.map((m) => (
            <div
              key={m.title}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <m.icon className="size-5" />
                </div>
                <span className="font-mono text-sm font-medium text-muted-foreground/60">{m.step}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold">{m.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 价值点 */}
      <section className="border-y border-border/70 bg-secondary/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card text-primary ring-1 ring-inset ring-border">
                <v.icon className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{v.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 业务流程 */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex items-center gap-2">
          <FileCheck2 className="size-5 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight">您的信息将如何被使用</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {FLOW.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium shadow-sm">
                {step}
              </div>
              {i < FLOW.length - 1 && <ArrowRight className="size-4 text-muted-foreground/50" />}
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          提交后，项目团队将基于以上信息完成网站及 GEO 基础诊断、用户意图挖掘、优化范围确认、KPI 及服务周期确认与 SOW
          内容整理。最终目标及考核规则将以双方确认的 SOW 为准。
        </p>
        <div className="mt-8">
          <Link href="/apply">
            <Button size="lg" className="gap-2">
              开始填写需求
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>海外 GEO 客户需求收集系统 · 原型演示</span>
          <span>本页仅展示页面结构与核心交互，最终视觉以 UI 设计稿为准。</span>
        </div>
      </footer>
    </main>
  )
}
