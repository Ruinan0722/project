"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, UserCheck, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCrm } from "./store"
import { LEAD_STATUS_META, LEAD_SOURCES, type LeadStatus } from "@/lib/crm-data"
import { Pill, StatCards, FilterChips, EmptyState } from "./ui"
import { ConvertLeadDialog } from "./lead-actions"
import { toast } from "sonner"

const LEVEL_TONE: Record<string, string> = { A: "success", B: "info", C: "warning", D: "neutral" }

export function LeadList() {
  const { leads } = useCrm()
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<LeadStatus | "all">("all")
  const [source, setSource] = useState<string>("all")
  const [convertId, setConvertId] = useState<string | null>(null)

  const stats = useMemo(
    () => ({
      total: leads.length,
      today: leads.filter((l) => l.firstContactDate >= "2026-06-22").length,
      untouched: leads.filter((l) => l.status === "untouched").length,
      touched: leads.filter((l) => l.status === "touched").length,
      converted: leads.filter((l) => l.status === "converted").length,
      invalid: leads.filter((l) => l.status === "invalid").length,
    }),
    [leads],
  )

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return leads.filter((l) => {
      const ms = status === "all" || l.status === status
      const msrc = source === "all" || l.source === source
      const mkw = !kw || l.companyName.toLowerCase().includes(kw) || l.contactName.toLowerCase().includes(kw)
      return ms && msrc && mkw
    })
  }, [leads, keyword, status, source])

  return (
    <div className="space-y-6">
      <StatCards
        cols={6}
        items={[
          { label: "线索总数", value: stats.total },
          { label: "今日新增", value: stats.today, tone: "text-primary" },
          { label: "未触达", value: stats.untouched, tone: "text-amber-600" },
          { label: "已触达", value: stats.touched },
          { label: "已转客户", value: stats.converted, tone: "text-emerald-600" },
          { label: "无效线索", value: stats.invalid },
        ]}
      />

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="搜索公司或联系人" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm"
          >
            <option value="all">全部来源</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <FilterChips
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "全部" },
              { value: "untouched", label: "未触达" },
              { value: "touched", label: "已触达" },
              { value: "converted", label: "已转客户" },
              { value: "invalid", label: "无效线索" },
            ]}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">首次触达</th>
                <th className="px-4 py-3 font-medium">公司 / 联系人</th>
                <th className="px-4 py-3 font-medium">区域 / 城市</th>
                <th className="px-4 py-3 font-medium">来源</th>
                <th className="px-4 py-3 font-medium">等级</th>
                <th className="px-4 py-3 font-medium">SDR / 销售</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0 transition-colors hover:bg-accent/30">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{l.firstContactDate}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{l.companyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.contactName} · {l.contactTitle}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {l.region} / {l.city}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                  <td className="px-4 py-3">
                    <Pill label={l.level} tone={LEVEL_TONE[l.level]} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {l.sdr}
                    <br />
                    {l.sales}
                  </td>
                  <td className="px-4 py-3">
                    <Pill label={LEAD_STATUS_META[l.status].label} tone={LEAD_STATUS_META[l.status].tone} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {l.status !== "converted" && l.status !== "invalid" && (
                        <Button size="sm" className="gap-1" onClick={() => setConvertId(l.id)}>
                          <UserCheck className="size-3.5" />
                          生成客户
                        </Button>
                      )}
                      {l.status === "converted" && l.convertedCustomerId && (
                        <Link href={`/customers/${l.convertedCustomerId}`}>
                          <Button variant="outline" size="sm">
                            查看客户
                          </Button>
                        </Link>
                      )}
                      <Link href={`/leads/${l.id}`}>
                        <Button variant="ghost" size="sm">
                          查看
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState text="没有符合条件的线索" />}
      </div>
      <p className="text-center text-xs text-muted-foreground">共 {filtered.length} 条线索</p>

      {convertId && (
        <ConvertLeadDialog
          leadId={convertId}
          open={!!convertId}
          onOpenChange={(o) => !o && setConvertId(null)}
        />
      )}
    </div>
  )
}
