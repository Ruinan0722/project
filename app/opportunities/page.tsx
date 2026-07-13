import { PageHeader } from "@/components/crm/ui"
import { OpportunityBoard } from "@/components/crm/opportunity-board"

export default function OpportunitiesPage() {
  return (
    <div>
      <PageHeader title="商机管理" desc="以看板或列表推进销售机会，跟踪金额、概率与阶段流转。" />
      <div className="px-5 py-6 lg:px-8">
        <OpportunityBoard />
      </div>
    </div>
  )
}
