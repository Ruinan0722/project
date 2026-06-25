import { RequestDetail } from "@/components/admin/request-detail"

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="flex min-h-screen flex-col">
      <RequestDetail id={id} />
    </div>
  )
}
