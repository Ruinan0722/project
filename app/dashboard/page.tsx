import { PageHeader } from "@/components/crm/ui"
import { Dashboard } from "@/components/crm/dashboard"

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="数据看板" desc="线索、客户、商机与合同的经营数据全景。" />
      <div className="px-5 py-6 lg:px-8">
        <Dashboard />
      </div>
    </div>
  )
}
