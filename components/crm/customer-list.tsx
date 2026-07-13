"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCrm } from "./store"
import { CUSTOMER_STATUS_META, INDUSTRY_L1, type CustomerStatus } from "@/lib/crm-data"
import { Pill, StatCards, FilterChips, EmptyState } from "./ui"

export function CustomerList() {
  const { customers, opportunities, contracts } = useCrm()
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<CustomerStatus | "all">("all")
  const [industry, setIndustry] = useState<string>("all")

  const stats = useMemo(
    () => ({
      total: customers.length,
      cooperating: customers.filter((c) => c.status === "cooperating").length,
      following: customers.filter((c) => c.status === "following").length,
      key: customers.filter((c) => c.isKey).length,
    }),
    [customers],
  )

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return customers.filter((c) => {
      const ms = status === "all" || c.status === status
      const mi = industry === "all" || c.industryL1 === industry
      const mkw =
        !kw ||
        c.companyName.toLowerCase().includes(kw) ||
        c.brandName.toLowerCase().includes(kw) ||
        c.owner.toLowerCase().includes(kw)
      return ms && mi && mkw
    })
  }, [customers, keyword, status, industry])

  function countOpp(cid: string) {
    return opportunities.filter((o) => o.customerId === cid && o.stage !== "lost").length
  }
  function countContract(cid: string) {
    return contracts.filter((c) => c.customerId === cid).length
  }

  return (
    <div className="space-y-6">
      <StatCards
        items={[
          { label: "客户总数", value: stats.total },
          { label: "合作中", value: stats.cooperating, tone: "text-emerald-600" },
          { label: "跟进中", value: stats.following, tone: "text-primary" },
          { label: "重点客户", value: stats.key, tone: "text-amber-600" },
        ]}
      />

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="搜索公司、品牌或负责人"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm"
          >
            <option value="all">全部行业</option>
            {INDUSTRY_L1.map((s) => (
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
              { value: "potential", label: "潜在客户" },
              { value: "following", label: "跟进中" },
              { value: "cooperating", label: "合作中" },
              { value: "lost", label: "已流失" },
            ]}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">客户 / 品牌</th>
                <th className="px-4 py-3 font-medium">行业</th>
                <th className="px-4 py-3 font-medium">区域</th>
                <th className="px-4 py-3 font-medium">销售负责人</th>
                <th className="px-4 py-3 font-medium">商机 / 合同</th>
                <th className="px-4 py-3 font-medium">最近跟进</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 transition-colors hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1.5 font-medium">
                      {c.isKey && <Star className="size-3.5 fill-amber-400 text-amber-400" />}
                      {c.brandName || c.companyName}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.companyName}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.industryL1}
                    {c.industryL2 ? ` / ${c.industryL2}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.region}</td>
                  <td className="px-4 py-3">{c.owner}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {countOpp(c.id)} / {countContract(c.id)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{c.lastFollowAt}</td>
                  <td className="px-4 py-3">
                    <Pill label={CUSTOMER_STATUS_META[c.status].label} tone={CUSTOMER_STATUS_META[c.status].tone} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/customers/${c.id}`}>
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
        {filtered.length === 0 && <EmptyState text="没有符合条件的客户" />}
      </div>
      <p className="text-center text-xs text-muted-foreground">共 {filtered.length} 家客户</p>
    </div>
  )
}
