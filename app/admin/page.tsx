import { RequestList } from "@/components/admin/request-list"

export default function AdminListPage() {
  return (
    <>
      <header className="border-b border-border bg-card/60 px-5 py-5 lg:px-8">
        <h1 className="text-xl font-semibold tracking-tight">需求管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">查看、筛选并管理全部客户提交的 GEO 优化需求。</p>
      </header>
      <div className="flex-1 px-5 py-6 lg:px-8">
        <RequestList />
      </div>
    </>
  )
}
