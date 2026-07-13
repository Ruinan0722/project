import { PageHeader } from "@/components/crm/ui"
import { CustomerList } from "@/components/crm/customer-list"

export default function CustomersPage() {
  return (
    <div>
      <PageHeader title="客户管理" desc="维护客户档案、联系人、商机、需求与合同的完整视图。" />
      <div className="px-5 py-6 lg:px-8">
        <CustomerList />
      </div>
    </div>
  )
}
