"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCrm } from "./store"

export function ConvertLeadDialog({
  leadId,
  open,
  onOpenChange,
}: {
  leadId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const { getLead, convertLeadToCustomer } = useCrm()
  const lead = getLead(leadId)
  if (!lead) return null

  function convert() {
    const cid = convertLeadToCustomer(leadId)
    onOpenChange(false)
    if (cid) {
      toast.success("已生成客户档案")
      router.push(`/customers/${cid}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>生成客户</DialogTitle>
          <DialogDescription>
            确认将线索「{lead.companyName}」转为正式客户？系统会自动创建客户档案并带入首个联系人，线索状态将更新为「已转客户」。
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl bg-secondary/40 p-4 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">公司名称</span>
            <span className="font-medium">{lead.companyName}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">联系人</span>
            <span className="font-medium">
              {lead.contactName}（{lead.contactTitle}）
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">所在地区</span>
            <span className="font-medium">
              {lead.region} · {lead.city}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">承接销售</span>
            <span className="font-medium">{lead.sales !== "未分配" ? lead.sales : "待分配"}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={convert}>确认生成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
