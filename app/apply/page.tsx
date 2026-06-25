import { ApplyForm } from "@/components/apply/apply-form"

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>
}) {
  const { draft } = await searchParams
  return <ApplyForm resumeDraft={draft === "1"} />
}
