import { STATUS_META, goalLabel, type RequestRecord } from "./geo-data"

const HEADERS = [
  "需求编号",
  "状态",
  "公司名称",
  "联系人",
  "职位",
  "手机号",
  "品牌名称",
  "产品或服务",
  "产品介绍",
  "海外官网",
  "目标国家",
  "目标语言",
  "AI 平台",
  "用户问题/方向",
  "优化目标",
  "跟进人",
  "提交时间",
]

function rowOf(r: RequestRecord): string[] {
  const d = r.data
  const intent = d.intentType === "clear" ? d.intentClear : d.intentType === "rough" ? d.intentRough : ""
  return [
    r.code,
    STATUS_META[r.status].label,
    d.companyName,
    d.contactName,
    d.contactTitle,
    d.contactPhone,
    d.brandName,
    d.products.map((p) => p.name).filter(Boolean).join(" / "),
    d.productIntro.replace(/\n/g, " "),
    d.hasOverseasSite === "yes" ? d.overseasSiteUrl : "无",
    d.countries.join("、"),
    d.languages.join("、"),
    d.platforms.join("、"),
    intent.replace(/\n/g, " "),
    goalLabel(d.goal),
    r.owner,
    r.submittedAt,
  ]
}

function escapeCsv(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

export function exportCsv(records: RequestRecord[], filename: string) {
  const lines = [HEADERS, ...records.map(rowOf)].map((cols) => cols.map(escapeCsv).join(","))
  // 加 BOM，保证 Excel 正确识别中文
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
  triggerDownload(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`)
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
