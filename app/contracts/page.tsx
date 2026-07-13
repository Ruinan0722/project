import { PageHeader } from "@/components/crm/ui"
import { ContractList } from "@/components/crm/contract-list"

export default function ContractsPage() {
  return (
    <div>
      <PageHeader title="合同管理" desc="管理合同签署、金额周期、项目状态与合同附件。" />
      <div className="px-5 py-6 lg:px-8">
        <ContractList />
      </div>
    </div>
  )
}
