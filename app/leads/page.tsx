import { PageHeader } from "@/components/crm/ui"
import { LeadList } from "@/components/crm/lead-list"

export default function LeadsPage() {
  return (
    <div>
      <PageHeader title="线索管理" desc="承接、跟进并转化市场与 SDR 产生的销售线索。" />
      <div className="px-5 py-6 lg:px-8">
        <LeadList />
      </div>
    </div>
  )
}
