import { cn } from "@/lib/utils"

const TONE_CLASSES: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground ring-border",
  muted: "bg-secondary text-secondary-foreground ring-border",
  info: "bg-accent text-accent-foreground ring-accent-foreground/15",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
}

// 通用状态徽章：传入标签与色调
export function Pill({ label, tone = "neutral", className }: { label: string; tone?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONE_CLASSES[tone] ?? TONE_CLASSES.neutral,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {label}
    </span>
  )
}

// 顶部数据卡片
export function StatCards({
  items,
  cols = 4,
}: {
  items: { label: string; value: string | number; tone?: string; hint?: string }[]
  cols?: 3 | 4 | 5 | 6
}) {
  const colClass = {
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  }[cols]
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3", colClass)}>
      {items.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{s.label}</p>
          <p className={cn("mt-1 text-2xl font-semibold tabular-nums", s.tone ?? "text-foreground")}>{s.value}</p>
          {s.hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{s.hint}</p>}
        </div>
      ))}
    </div>
  )
}

// 页面头部
export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <header className="border-b border-border bg-card/60 px-5 py-5 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  )
}

// 筛选胶囊组
export function FilterChips<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors",
            value === o.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-accent/40",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// 详情信息行
export function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-0 sm:flex-row sm:items-start sm:gap-4">
      <dt className="w-40 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="flex-1 text-sm">{children}</dd>
    </div>
  )
}

// 空状态
export function EmptyState({ text }: { text: string }) {
  return <div className="py-16 text-center text-sm text-muted-foreground">{text}</div>
}
