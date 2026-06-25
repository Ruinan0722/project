"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    toast.success("需求编号已复制")
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" onClick={copy} aria-label="复制需求编号">
      {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
    </Button>
  )
}
