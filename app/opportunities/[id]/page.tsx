import { OpportunityDetail } from "@/components/crm/opportunity-detail"

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <OpportunityDetail id={id} />
}
