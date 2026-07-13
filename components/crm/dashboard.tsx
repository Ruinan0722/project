"use client"

import { useMemo } from "react"
import { useCrm } from "./store"
import { useAdmin } from "@/components/admin/store"
import {
  LEAD_SOURCES,
  OPP_STAGE_META,
  money,
  wan,
  type OppStage,
} from "@/lib/crm-data"
import { StatCards } from "./ui"
import { cn } from "@/lib/utils"

const FUNNEL: OppStage[] = ["contact", "demand", "solution", "quote", "signing", "won"]

export function Dashboard() {
  const { leads, customers, opportunities, contracts } = useCrm()
  const { requests } = useAdmin()

  const kpi = useMemo(() => {
    const won = opportunities.filter((o) => o.stage === "won")
    const lost = opportunities.filter((o) => o.stage === "lost")
    const settled = won.length + lost.length
    const signedContracts = contracts.filter((c) => c.status === "signed")
    return {
      leads: leads.length,
      customers: customers.length,
      pipeline: opportunities
        .filter((o) => o.stage !== "won" && o.stage !== "lost")
        .reduce((s, o) => s + o.amount, 0),
      signedAmount: signedContracts.reduce((s, c) => s + c.amount, 0),
      winRate: settled ? Math.round((won.length / settled) * 100) : 0,
      convRate: leads.length ? Math.round((leads.filter((l) => l.status === "converted").length / leads.length) * 100) : 0,
    }
  }, [leads, customers, opportunities, contracts])

  // 商机漏斗
  const funnel = useMemo(
    () =>
      FUNNEL.map((stage) => {
        const items = opportunities.filter((o) => o.stage === stage)
        return { stage, count: items.length, amount: items.reduce((s, o) => s + o.amount, 0) }
      }),
    [opportunities],
  )
  const funnelMax = Math.max(...funnel.map((f) => f.count), 1)

  // 线索来源分布
  const sourceDist = useMemo(() => {
    const map = new Map<string, number>()
    leads.forEach((l) => map.set(l.source, (map.get(l.source) ?? 0) + 1))
    return LEAD_SOURCES.map((s) => ({ source: s, count: map.get(s) ?? 0 }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [leads])
  const sourceMax = Math.max(...sourceDist.map((s) => s.count), 1)

  // 销售业绩排行（按赢单金额）
  const ranking = useMemo(() => {
    const map = new Map<string, { won: number; pipeline: number }>()
    opportunities.forEach((o) => {
      const cur = map.get(o.owner) ?? { won: 0, pipeline: 0 }
      if (o.stage === "won") cur.won += o.amount
      else if (o.stage !== "lost") cur.pipeline += o.amount
      map.set(o.owner, cur)
    })
    return Array.from(map.entries())
      .map(([owner, v]) => ({ owner, ...v }))
      .sort((a, b) => b.won - a.won)
  }, [opportunities])
  const rankMax = Math.max(...ranking.map((r) => r.won + r.pipeline), 1)

  return (
    <div className="space-y-6">
      <StatCards
        cols={6}
        items={[
          { label: "线索总数", value: kpi.leads },
          { label: "客户总数", value: kpi.customers },
          { label: "需求单", value: requests.length },
          { label: "商机金额", value: wan(kpi.pipeline), tone: "text-primary" },
          { label: "已签约金额", value: wan(kpi.signedAmount), tone: "text-emerald-600" },
          { label: "赢单率", value: `${kpi.winRate}%`, tone: "text-amber-600" },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 商机漏斗 */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">商机阶段漏斗</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">各阶段商机数量与金额分布</p>
          <div className="mt-4 space-y-2.5">
            {funnel.map((f) => (
              <div key={f.stage}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{OPP_STAGE_META[f.stage].label}</span>
                  <span className="tabular-nums">
                    {f.count} 个 · {wan(f.amount)}
                  </span>
                </div>
                <div className="h-6 overflow-hidden rounded-md bg-secondary">
                  <div
                    className="flex h-full items-center justify-end rounded-md bg-primary px-2 text-[11px] font-medium text-primary-foreground transition-all"
                    style={{ width: `${Math.max((f.count / funnelMax) * 100, 6)}%` }}
                  >
                    {f.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 线索来源分布 */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">线索来源分布</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">按渠道统计线索数量</p>
          <div className="mt-4 space-y-2.5">
            {sourceDist.map((s) => (
              <div key={s.source} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-xs text-muted-foreground">{s.source}</span>
                <div className="h-5 flex-1 overflow-hidden rounded bg-secondary">
                  <div
                    className="h-full rounded bg-accent-foreground/70"
                    style={{ width: `${Math.max((s.count / sourceMax) * 100, 4)}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs tabular-nums">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 销售业绩排行 */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">销售业绩排行</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">按赢单金额排序，浅色为进行中 Pipeline</p>
        <div className="mt-4 space-y-3">
          {ranking.map((r, i) => (
            <div key={r.owner} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  i === 0 ? "bg-amber-100 text-amber-700" : "bg-secondary text-muted-foreground",
                )}
              >
                {i + 1}
              </span>
              <span className="w-20 shrink-0 truncate text-sm">{r.owner}</span>
              <div className="flex h-6 flex-1 overflow-hidden rounded bg-secondary">
                <div className="h-full bg-emerald-500" style={{ width: `${(r.won / rankMax) * 100}%` }} />
                <div className="h-full bg-primary/30" style={{ width: `${(r.pipeline / rankMax) * 100}%` }} />
              </div>
              <span className="w-24 shrink-0 text-right text-xs tabular-nums">
                赢 {wan(r.won)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 客户状态 & 转化 */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="线索转化率" value={`${kpi.convRate}%`} desc="线索 → 客户" />
        <MiniStat label="平均商机金额" value={wan(opportunities.length ? opportunities.reduce((s, o) => s + o.amount, 0) / opportunities.length : 0)} desc="全部商机均值" />
        <MiniStat label="合作中客户" value={customers.filter((c) => c.status === "cooperating").length} desc="状态为合作中" />
        <MiniStat label="已签合同" value={contracts.filter((c) => c.status === "signed").length} desc="累计签订份数" />
      </div>
    </div>
  )
}

function MiniStat({ label, value, desc }: { label: string; value: string | number; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>
    </div>
  )
}
