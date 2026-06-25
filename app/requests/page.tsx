import { RequestList } from "@/components/admin/request-list"

export default function RequestsPage() {
  return (
    <div>
      <header className="border-b border-border bg-card/60 px-5 py-5 lg:px-8">
        <h1 className="text-xl font-semibold tracking-tight">客户需求管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          查看全部客户需求，支持搜索、状态筛选，并可导出 Excel 表格或下载 PDF。
        </p>
      </header>
      <div className="px-5 py-6 lg:px-8">
        <RequestList />
      </div>
    </div>
  )
}
