import { CustomerDetail } from "@/components/crm/customer-detail"

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CustomerDetail id={id} />
}
