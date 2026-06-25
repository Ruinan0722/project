"use client"

import type { ReactNode } from "react"
import { AlertCircle, Check, Lightbulb, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COUNTRY_OPTIONS, LANGUAGE_OPTIONS, type RegionItem } from "@/lib/geo-data"

export function SectionCard({
  step,
  title,
  desc,
  children,
}: {
  step: string
  title: string
  desc?: string
  children: ReactNode
}) {
  return (
    <section className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-7">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
          {step}
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {desc && <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>}
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

export function Field({
  label,
  required,
  hint,
  example,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  example?: ReactNode
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium">
        {label}
        {required ? (
          <span className="text-destructive">*</span>
        ) : (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-normal text-muted-foreground">选填</span>
        )}
      </label>
      {hint && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      <div className="mt-2.5">{children}</div>
      {example && (
        <div className="mt-2 flex gap-1.5 rounded-lg bg-secondary/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
          <div className="min-w-0">
            <span className="font-medium text-foreground/70">示例：</span>
            {example}
          </div>
        </div>
      )}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive">
          <AlertCircle className="size-3.5" />
          {error}
        </p>
      )}
    </div>
  )
}

export function ChipGroup({
  options,
  value,
  onChange,
  multiple = true,
  columns,
}: {
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
  multiple?: boolean
  columns?: boolean
}) {
  function toggle(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt))
    } else {
      onChange(multiple ? [...value, opt] : [opt])
    }
  }
  return (
    <div className={cn("flex flex-wrap gap-2", columns && "grid grid-cols-2 sm:grid-cols-3")}>
      {options.map((opt) => {
        const active = value.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/40",
              columns && "justify-center",
            )}
            aria-pressed={active}
          >
            {active && <Check className="size-3.5" />}
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// 国家-语言级联编辑器：国家为语言上一级，切换国家后语言重置
export function RegionEditor({
  value,
  onChange,
}: {
  value: RegionItem[]
  onChange: (next: RegionItem[]) => void
}) {
  function update(id: string, patch: Partial<RegionItem>) {
    onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }
  function add() {
    onChange([...value, { id: `r${Date.now()}`, country: "", language: "" }])
  }
  function remove(id: string) {
    onChange(value.filter((r) => r.id !== id))
  }
  return (
    <div className="space-y-2.5">
      {value.map((r, i) => {
        return (
          <div key={r.id} className="flex items-center gap-2">
            <Select value={r.country} onValueChange={(v) => update(r.id, { country: v })}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="选择国家或地区">{r.country || "选择国家或地区"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="shrink-0 text-sm text-muted-foreground">-</span>
            <Select value={r.language} onValueChange={(v) => update(r.id, { language: v })}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="选择语言">{r.language || "选择语言"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {value.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
                onClick={() => remove(r.id)}
                aria-label={`删除第 ${i + 1} 个国家语言`}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        )
      })}
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={add}>
        <Plus className="size-4" />
        添加国家 / 语言
      </Button>
    </div>
  )
}

// 动态多行文本编辑器：一行一个，可添加 / 删除
export function RowList({
  value,
  onChange,
  placeholder,
  addLabel = "添加一行",
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: (index: number) => string
  addLabel?: string
}) {
  function update(i: number, val: string) {
    onChange(value.map((v, idx) => (idx === i ? val : v)))
  }
  function add() {
    onChange([...value, ""])
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }
  return (
    <div className="space-y-2">
      {value.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-5 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{i + 1}.</span>
          <Input placeholder={placeholder?.(i)} value={v} onChange={(e) => update(i, e.target.value)} />
          {value.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground"
              onClick={() => remove(i)}
              aria-label={`删除第 ${i + 1} 行`}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={add}>
        <Plus className="size-4" />
        {addLabel}
      </Button>
    </div>
  )
}

export function ChoiceCard({
  selected,
  onSelect,
  title,
  desc,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  desc?: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
        selected ? "border-primary bg-accent/50 ring-1 ring-inset ring-primary/30" : "border-border bg-card hover:bg-accent/30",
      )}
      aria-pressed={selected}
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
        )}
      >
        {selected && <Check className="size-3" />}
      </span>
      <span>
        <span className="block text-sm font-medium">{title}</span>
        {desc && <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{desc}</span>}
      </span>
    </button>
  )
}
