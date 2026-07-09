import { Workbench } from "@/components/crm/workbench"
import { PageHeader } from "@/components/crm/ui"

export default function HomePage() {
  return (
    <div>
      <PageHeader title="首页工作台" desc="快速查看待办事项与关键经营数据。" />
      <div className="px-5 py-6 lg:px-8">
        <Workbench />
      </div>
    </div>
  )
}
