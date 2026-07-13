"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { KanbanSquare, List, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCrm } from "./store"
import { OPP_STAGES, OPP_STAGE_META, money, wan, type OppStage } from "@/lib/crm-data"
import { Pill, StatCards, EmptyState } from "./ui"

// 看板展示的阶段（输单单独列，不占看板列）
const BOARD_STAGES: OppStage[] = ["contact", "demand", "solution", "quote", "signing", "won"]

export function OpportunityBoard() {
  const { opportunities, customers } = useCrm()
  const [view, setView] = useState<"board" | "list">("board")
  const [keyword, setKeyword] = useState("")

  function custName(id: string) {
    const c = customers.find((x) => x.id === id)
    return c?.brandName || c?.companyName || "—"
  }

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return opportunities
    return opportunities.filter(
      (o) => o.name.toLowerCase().includes(kw) || custName(o.customerId).toLowerCase().includes(kw),
    )
  }, [opportunities, keyword])

  const stats = useMemo(() => {
    const active = opportunities.filter((o) => o.stage !== "lost" && o.stage !== "won")
    const won = opportunities.filter((o) => o.stage === "won")
    const pipeline = active.reduce((s, o) => s + o.amount, 0)
    const wonAmount = won.reduce((s, o) => s + o.amount, 0)
    const settled = opportunities.filter((o) => o.stage === "won" || o.stage === "lost")
    const winRate = settled.length ? Math.round((won.length / settled.length) * 100) : 0
    return { count: active.length, pipeline, wonAmount, winRate }
  }, [opportunities])

  return (
    <div className="space-y-6">
      <StatCards
        items={[
          { label: "进行中商机", value: stats.count },
          { label: "商机金额（Pipeline）", value: wan(stats.pipeline), tone: "text-primary" },
          { label: "已赢单金额", value: wan(stats.wonAmount), tone: "text-emerald-600" },
          { label: "赢单率", value: `${stats.winRate}%`, tone: "text-amber-600" },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="搜索商机或客户" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <div className="inline-flex items-center rounded-lg border border-border bg-card p-0.5">
          <button
            onClick={() => setView("board")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
              view === "board" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            <KanbanSquare className="size-4" />
            看板
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
              view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            <List className="size-4" />
            列表
          </button>
        </div>
      </div>

      {view === "board" ? (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3" style={{ minWidth: "max-content" }}>
            {BOARD_STAGES.map((stage) => {
              const items = filtered.filter((o) => o.stage === stage)
              const total = items.reduce((s, o) => s + o.amount, 0)
              return (
                <div key={stage} className="w-72 shrink-0">
                  <div className="mb-2 flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {OPP_STAGE_META[stage].label}
                      <span className="rounded-full bg-background px-1.5 text-xs text-muted-foreground">
                        {items.length}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">{wan(total)}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((o) => (
                      <Link
                        key={o.id}
                        href={`/opportunities/${o.id}`}
                        className="block rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent/30"
                      >
                        <p className="text-sm font-medium leading-snug">{o.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{custName(o.customerId)}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-semibold tabular-nums">{money(o.amount)}</span>
                          <span className="text-xs text-muted-foreground">{o.probability}%</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{o.owner}</span>
                          <span>预计 {o.expectedSignDate || "—"}</span>
                        </div>
                      </Link>
                    ))}
                    {items.length === 0 && (
                      <div className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                        暂无
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">商机名称</th>
                  <th className="px-4 py-3 font-medium">客户</th>
                  <th className="px-4 py-3 font-medium">金额</th>
                  <th className="px-4 py-3 font-medium">概率</th>
                  <th className="px-4 py-3 font-medium">负责人</th>
                  <th className="px-4 py-3 font-medium">预计签约</th>
                  <th className="px-4 py-3 font-medium">阶段</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 transition-colors hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium">{o.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{custName(o.customerId)}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{money(o.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.probability}%</td>
                    <td className="px-4 py-3">{o.owner}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {o.expectedSignDate || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Pill label={OPP_STAGE_META[o.stage].label} tone={OPP_STAGE_META[o.stage].tone} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/opportunities/${o.id}`}>
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
          {filtered.length === 0 && <EmptyState text="没有符合条件的商机" />}
        </div>
      )}
    </div>
  )
}
