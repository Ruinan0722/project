"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCrm } from "./store"
import { CONTRACT_STATUS_META, PROJECT_STATUS_META, money, type ContractStatus } from "@/lib/crm-data"
import { Pill, StatCards, FilterChips, EmptyState } from "./ui"

export function ContractList() {
  const { contracts } = useCrm()
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<ContractStatus | "all">("all")

  const stats = useMemo(() => {
    const signed = contracts.filter((c) => c.status === "signed")
    return {
      total: contracts.length,
      signed: signed.length,
      pending: contracts.filter((c) => c.status === "pending" || c.status === "signing").length,
      amount: signed.reduce((s, c) => s + c.amount, 0),
    }
  }, [contracts])

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return contracts.filter((c) => {
      const ms = status === "all" || c.status === status
      const mkw =
        !kw ||
        c.name.toLowerCase().includes(kw) ||
        c.company.toLowerCase().includes(kw) ||
        c.code.toLowerCase().includes(kw)
      return ms && mkw
    })
  }, [contracts, keyword, status])

  return (
    <div className="space-y-6">
      <StatCards
        items={[
          { label: "合同总数", value: stats.total },
          { label: "已签订", value: stats.signed, tone: "text-emerald-600" },
          { label: "待签 / 签署中", value: stats.pending, tone: "text-amber-600" },
          { label: "已签约金额", value: money(stats.amount), tone: "text-primary" },
        ]}
      />

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="搜索合同名称、客户或编号"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <div className="mt-3">
          <FilterChips
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "全部" },
              { value: "pending", label: "待签订" },
              { value: "signing", label: "签署中" },
              { value: "signed", label: "已签订" },
              { value: "void", label: "已作废" },
              { value: "terminated", label: "已终止" },
            ]}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">合同编号 / 名称</th>
                <th className="px-4 py-3 font-medium">客户</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">金额</th>
                <th className="px-4 py-3 font-medium">负责人</th>
                <th className="px-4 py-3 font-medium">项目状态</th>
                <th className="px-4 py-3 font-medium">合同状态</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 transition-colors hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-muted-foreground">{c.code || "编号待生成"}</p>
                    <p className="font-medium">{c.name}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.company}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.type}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{money(c.amount)}</td>
                  <td className="px-4 py-3">{c.owner}</td>
                  <td className="px-4 py-3">
                    <Pill
                      label={PROJECT_STATUS_META[c.projectStatus].label}
                      tone={PROJECT_STATUS_META[c.projectStatus].tone}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Pill label={CONTRACT_STATUS_META[c.status].label} tone={CONTRACT_STATUS_META[c.status].tone} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/contracts/${c.id}`}>
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
        {filtered.length === 0 && <EmptyState text="没有符合条件的合同" />}
      </div>
      <p className="text-center text-xs text-muted-foreground">共 {filtered.length} 份合同</p>
    </div>
  )
}
