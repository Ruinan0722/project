"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Download, FileSpreadsheet, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/status-badge"
import { useAdmin } from "./store"
import { STATUS_META, goalLabel, type RequestStatus } from "@/lib/geo-data"
import { exportCsv } from "@/lib/export"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const STATUS_FILTERS: { value: RequestStatus | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "submitted", label: "已提交" },
  { value: "supplement", label: "待补充" },
  { value: "pending_review", label: "待确认" },
  { value: "confirmed", label: "已确认" },
  { value: "in_project", label: "已转入项目" },
  { value: "draft", label: "草稿" },
  { value: "closed", label: "已关闭" },
]

export function RequestList() {
  const { requests } = useAdmin()
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<RequestStatus | "all">("all")

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return requests.filter((r) => {
      const matchStatus = status === "all" || r.status === status
      const matchKw =
        !kw ||
        r.code.toLowerCase().includes(kw) ||
        r.data.companyName.toLowerCase().includes(kw) ||
        r.data.brandName.toLowerCase().includes(kw)
      return matchStatus && matchKw
    })
  }, [requests, keyword, status])

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => ["submitted", "pending_review"].includes(r.status)).length,
      supplement: requests.filter((r) => r.status === "supplement").length,
      inProject: requests.filter((r) => r.status === "in_project").length,
    }
  }, [requests])

  function handleExport() {
    exportCsv(filtered, `GEO客户需求_${new Date().toISOString().slice(0, 10)}`)
    toast.success("已导出 Excel(CSV)", { description: `共 ${filtered.length} 条记录` })
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "需求总数", value: stats.total, tone: "text-foreground" },
          { label: "待处理", value: stats.pending, tone: "text-primary" },
          { label: "待补充", value: stats.supplement, tone: "text-amber-600" },
          { label: "已转入项目", value: stats.inProject, tone: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("mt-1 text-2xl font-semibold tabular-nums", s.tone)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 工具栏 */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="搜索公司、品牌或需求编号"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 self-start lg:self-auto" onClick={handleExport}>
            <FileSpreadsheet className="size-4" />
            导出 Excel
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors",
                status === f.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent/40",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 列表 */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* 桌面表格 */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">需求编号</th>
                <th className="px-4 py-3 font-medium">公司 / 品牌</th>
                <th className="px-4 py-3 font-medium">目标国家</th>
                <th className="px-4 py-3 font-medium">优化目标</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">跟进人</th>
                <th className="px-4 py-3 font-medium">提交时间</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 transition-colors hover:bg-accent/30">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{r.code}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.data.companyName}</p>
                    <p className="text-xs text-muted-foreground">{r.data.brandName}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.data.countries.join("、") || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{goalLabel(r.data.goal)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.owner}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{r.submittedAt}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/${r.id}`}>
                      <Button variant="ghost" size="sm">
                        查看
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 移动端卡片 */}
        <div className="divide-y divide-border md:hidden">
          {filtered.map((r) => (
            <Link key={r.id} href={`/admin/${r.id}`} className="block p-4 transition-colors hover:bg-accent/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{r.data.companyName}</p>
                  <p className="text-xs text-muted-foreground">{r.data.brandName}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">{r.code}</span>
                <span>{r.submittedAt}</span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">没有符合条件的需求记录</div>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        共 {filtered.length} 条记录{status !== "all" && `（已按「${STATUS_META[status].label}」筛选）`}
      </p>
    </div>
  )
}
