import Link from "next/link"
import { CheckCircle2, FileText, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CopyCode } from "@/components/apply/copy-code"

const NEXT_STEPS = [
  "网站及 GEO 基础诊断",
  "用户意图挖掘",
  "优化范围确认",
  "KPI 及服务周期确认",
  "SOW 内容整理",
]

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  const requestCode = code ?? "GEO-00000000-0000"

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border border-border bg-card p-7 text-center shadow-sm md:p-9">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
            <CheckCircle2 className="size-9" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">需求提交成功</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            感谢您的填写！请保存您的需求编号，便于后续沟通查询。
          </p>

          <div className="mt-6 rounded-xl border border-border bg-secondary/50 p-4">
            <p className="text-xs text-muted-foreground">您的需求编号</p>
            <div className="mt-1.5 flex items-center justify-center gap-2">
              <span className="font-mono text-lg font-semibold tracking-tight">{requestCode}</span>
              <CopyCode code={requestCode} />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border p-4 text-left">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="size-4 text-primary" />
              项目团队接下来将完成
            </div>
            <ul className="mt-3 space-y-2">
              {NEXT_STEPS.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="size-3" />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/">
              <Button variant="outline" className="w-full gap-1.5 sm:w-auto">
                <Home className="size-4" />
                返回首页
              </Button>
            </Link>
            <Link href="/admin">
              <Button className="w-full sm:w-auto">查看内部管理后台</Button>
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          最终目标及考核规则将以双方确认的 SOW 为准。
        </p>
      </div>
    </main>
  )
}
