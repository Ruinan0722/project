// 海外 GEO 客户需求收集系统 —— 共享类型、表单选项与模拟数据

export type RequestStatus =
  | "draft" // 保存草稿
  | "submitted" // 已提交
  | "supplement" // 待补充
  | "pending_review" // 待确认
  | "confirmed" // 已确认
  | "in_project" // 已转入项目
  | "closed" // 已关闭

export const STATUS_META: Record<
  RequestStatus,
  { label: string; description: string; tone: "neutral" | "info" | "warning" | "success" | "muted" }
> = {
  draft: { label: "保存草稿", description: "客户尚未正式提交", tone: "muted" },
  submitted: { label: "已提交", description: "客户已提交，等待内部处理", tone: "info" },
  supplement: { label: "待补充", description: "当前信息不完整，需要客户补充", tone: "warning" },
  pending_review: { label: "待确认", description: "信息基本完整，等待内部审核", tone: "warning" },
  confirmed: { label: "已确认", description: "可以进入后续诊断或方案流程", tone: "success" },
  in_project: { label: "已转入项目", description: "已进入 GEO 诊断、SOW 或项目交付", tone: "success" },
  closed: { label: "已关闭", description: "需求取消或不再继续跟进", tone: "neutral" },
}

// ===== 表单基础选项配置 =====

// 国家是语言的上一级：每个国家对应可选语言
export const COUNTRY_LANGUAGES: Record<string, string[]> = {
  美国: ["英语", "西班牙语"],
  英国: ["英语"],
  加拿大: ["英语", "法语"],
  德国: ["德语", "英语"],
  法国: ["法语", "英语"],
  日本: ["日语", "英语"],
  韩国: ["韩语", "英语"],
  澳大利亚: ["英语"],
  东南亚: ["英语", "马来语", "泰语", "越南语", "印尼语"],
  中东: ["阿拉伯语", "英语"],
}

export const COUNTRY_OPTIONS = Object.keys(COUNTRY_LANGUAGES)

// 全部语言选项（去重），用于系统配置的选项库管理
export const LANGUAGE_OPTIONS = Array.from(new Set(Object.values(COUNTRY_LANGUAGES).flat()))

// AI 平台：当前仅支持 ChatGPT，并默认选中
export const AI_PLATFORM_OPTIONS = ["ChatGPT"]
export const DEFAULT_PLATFORM = "ChatGPT"

export const OPTIMIZATION_GOALS = [
  { value: "source", label: "来源率", desc: "品牌官网/内容被 AI 引用作为信息来源的比例" },
  { value: "recommend", label: "推荐率", desc: "AI 回答中提及或推荐该品牌的比例" },
  { value: "top3", label: "前三推荐率", desc: "品牌出现在 AI 推荐前三位的比例" },
  { value: "priority", label: "优先推荐率", desc: "品牌被作为首选推荐的比例" },
] as const

// ===== 表单数据结构 =====

export interface ProductItem {
  id: string
  name: string
  fn: string // 1. 产品功能
  users: string // 2. 主要用户群体
  scenario: string // 3. 应用场景
}

export function emptyProduct(id?: string): ProductItem {
  return { id: id ?? `p${Date.now()}`, name: "", fn: "", users: "", scenario: "" }
}

// 国家-语言对（国家为语言上一级）
export interface RegionItem {
  id: string
  country: string
  language: string
}

export interface GeoFormData {
  // 一、项目联系人
  companyName: string
  contactName: string
  contactTitle: string
  contactPhone: string
  // 二、品牌与产品信息
  brandName: string
  brandAliases: string[] // 品牌别名（如 苹果 / Apple）
  scopeType: "brand_only" | "specific" | "" // 本次优化范围
  products: ProductItem[] // 每个产品各自包含功能 / 用户 / 场景
  hasOverseasSite: "yes" | "no" | ""
  overseasSiteUrl: string
  // 三、GEO 优化需求
  regions: RegionItem[] // 国家-语言对
  platforms: string[] // 当前固定为 ChatGPT
  optimizeBackground: string // 优化背景（选填）
  intentType: "clear" | "rough" | ""
  intentQuestions: string[] // 明确的问题，一行一个
  intentRough: string
  goal: string
}

export function emptyForm(): GeoFormData {
  return {
    companyName: "",
    contactName: "",
    contactTitle: "",
    contactPhone: "",
    brandName: "",
    brandAliases: [""],
    scopeType: "",
    products: [emptyProduct("p1")],
    hasOverseasSite: "",
    overseasSiteUrl: "",
    regions: [{ id: "r1", country: "", language: "" }],
    platforms: [DEFAULT_PLATFORM],
    optimizeBackground: "",
    intentType: "",
    intentQuestions: [""],
    intentRough: "",
    goal: "",
  }
}

// ===== 工具函数 =====

export function goalLabel(value: string): string {
  return OPTIMIZATION_GOALS.find((g) => g.value === value)?.label ?? "—"
}

export function scopeLabel(value: GeoFormData["scopeType"]): string {
  if (value === "brand_only") return "仅优化品牌整体"
  if (value === "specific") return "优化具体产品或服务"
  return "—"
}

// 品牌别名展示：苹果（Apple、iPhone）
export function brandDisplay(d: GeoFormData): string {
  const aliases = d.brandAliases.filter((a) => a.trim())
  if (!d.brandName) return "—"
  return aliases.length ? `${d.brandName}（别名：${aliases.join("、")}）` : d.brandName
}

// 国家-语言对展示：美国-英语；英国-英语
export function regionLabel(regions: RegionItem[]): string {
  const valid = regions.filter((r) => r.country)
  if (!valid.length) return "—"
  return valid.map((r) => (r.language ? `${r.country}-${r.language}` : r.country)).join("；")
}

export function regionTags(regions: RegionItem[]): string[] {
  return regions.filter((r) => r.country).map((r) => (r.language ? `${r.country}-${r.language}` : `${r.country}（待补充语言）`))
}

// 官网地址脱敏：隐藏域名中的品牌名，避免暴露真实品牌
export function maskUrl(url: string): string {
  if (!url) return ""
  const raw = url.trim()
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`)
    const host = u.hostname.replace(/^www\./, "")
    const parts = host.split(".")
    const name = parts[0]
    const masked =
      name.length <= 2 ? `${name[0] ?? ""}*` : `${name[0]}${"*".repeat(Math.max(3, name.length - 2))}${name[name.length - 1]}`
    const rest = parts.slice(1).join(".")
    return `${u.protocol}//${masked}${rest ? "." + rest : ""}`
  } catch {
    return raw.replace(/[a-zA-Z0-9]/g, "*")
  }
}

// 单个产品的功能 / 用户 / 场景是否填写完整
export function isProductComplete(p: ProductItem): boolean {
  return !!p.name.trim() && !!p.fn.trim() && !!p.users.trim() && !!p.scenario.trim()
}

// 产品介绍合并展示（用于导出）：产品名【功能：… / 用户：… / 场景：…】
export function productIntroText(d: GeoFormData): string {
  return d.products
    .filter((p) => p.name.trim())
    .map((p) => {
      const parts: string[] = []
      if (p.fn) parts.push(`功能：${p.fn}`)
      if (p.users) parts.push(`用户：${p.users}`)
      if (p.scenario) parts.push(`场景：${p.scenario}`)
      return `${p.name}（${parts.join("；")}）`
    })
    .join(" / ")
}

export function intentText(d: GeoFormData): string {
  if (d.intentType === "clear") return d.intentQuestions.filter((q) => q.trim()).join("\n")
  if (d.intentType === "rough") return d.intentRough
  return ""
}

// ===== 后台需求记录 =====

export interface RequestRecord {
  id: string
  code: string // 需求编号
  status: RequestStatus
  submittedAt: string
  updatedAt: string
  owner: string // 内部跟进人
  notes: NoteItem[]
  data: GeoFormData
}

export interface NoteItem {
  id: string
  author: string
  content: string
  createdAt: string
}

// ===== 模拟数据 =====

export const MOCK_REQUESTS: RequestRecord[] = [
  {
    id: "1",
    code: "GEO-20260612-0007",
    status: "in_project",
    submittedAt: "2026-06-12 10:24",
    updatedAt: "2026-06-20 16:02",
    owner: "李销售",
    notes: [
      { id: "n1", author: "李销售", content: "客户意向强，已安排品牌诊断。", createdAt: "2026-06-13 09:10" },
      { id: "n2", author: "GEO运营", content: "官网诊断完成，已进入意图挖掘。", createdAt: "2026-06-18 14:30" },
    ],
    data: {
      companyName: "字节跳动有限公司",
      contactName: "张三",
      contactTitle: "海外市场经理",
      contactPhone: "13800000000",
      brandName: "Dreamina",
      brandAliases: ["即梦"],
      scopeType: "specific",
      optimizeBackground: "下半年有海外社媒投放排期，希望配合营销节奏提升 AI 推荐表现。",
      products: [
        {
          id: "p1",
          name: "AI 图片生成工具",
          fn: "通过文本描述快速生成高质量图片",
          users: "设计师、内容创作者",
          scenario: "商品图制作、创意内容生成",
        },
        {
          id: "p2",
          name: "AI 海报设计",
          fn: "一键生成营销海报与活动物料",
          users: "营销人员、中小电商卖家",
          scenario: "社媒配图、广告创意制作",
        },
      ],
      hasOverseasSite: "yes",
      overseasSiteUrl: "https://dreamina.capcut.com/",
      regions: [
        { id: "r1", country: "美国", language: "英语" },
        { id: "r2", country: "英国", language: "英语" },
        { id: "r3", country: "日本", language: "日语" },
      ],
      platforms: ["ChatGPT"],
      intentType: "clear",
      intentQuestions: [
        "哪个 AI 工具适合制作海报？",
        "初学者适合使用什么 AI 设计工具？",
        "Dreamina 和 Midjourney 哪个更适合制作商品图？",
      ],
      intentRough: "",
      goal: "recommend",
    },
  },
  {
    id: "2",
    code: "GEO-20260615-0011",
    status: "pending_review",
    submittedAt: "2026-06-15 15:40",
    updatedAt: "2026-06-15 15:40",
    owner: "未分配",
    notes: [],
    data: {
      companyName: "安克创新科技股份有限公司",
      contactName: "王丽",
      contactTitle: "品牌负责人",
      contactPhone: "13911112222",
      brandName: "Anker",
      brandAliases: ["安克"],
      scopeType: "specific",
      optimizeBackground: "",
      products: [
        {
          id: "p1",
          name: "充电宝",
          fn: "大容量移动充电",
          users: "数码爱好者、差旅人群",
          scenario: "日常充电、户外出行",
        },
        {
          id: "p2",
          name: "氮化镓充电器",
          fn: "小体积高功率快充",
          users: "办公与差旅人群",
          scenario: "多设备同时快充",
        },
      ],
      hasOverseasSite: "yes",
      overseasSiteUrl: "https://www.anker.com/",
      regions: [
        { id: "r1", country: "美国", language: "英语" },
        { id: "r2", country: "德国", language: "德语" },
        { id: "r3", country: "英国", language: "英语" },
      ],
      platforms: ["ChatGPT"],
      intentType: "rough",
      intentQuestions: [""],
      intentRough: "希望用户在询问“哪个品牌充电宝好用”“出差带什么充电器”时看到我们的品牌。",
      goal: "top3",
    },
  },
  {
    id: "3",
    code: "GEO-20260618-0015",
    status: "supplement",
    submittedAt: "2026-06-18 09:12",
    updatedAt: "2026-06-19 11:20",
    owner: "陈商务",
    notes: [{ id: "n1", author: "陈商务", content: "缺少目标语言，已���系客户补充。", createdAt: "2026-06-19 11:20" }],
    data: {
      companyName: "正浩创新科技股份有限公司",
      contactName: "刘强",
      contactTitle: "海外业务总监",
      contactPhone: "13722223333",
      brandName: "EcoFlow",
      brandAliases: ["正浩"],
      scopeType: "specific",
      optimizeBackground: "",
      products: [
        {
          id: "p1",
          name: "户外储能电源",
          fn: "便携大容量储能与户外供电",
          users: "露营、房车及应急用电人群",
          scenario: "户外露营、应急备电",
        },
      ],
      hasOverseasSite: "yes",
      overseasSiteUrl: "https://www.ecoflow.com/",
      regions: [
        { id: "r1", country: "美国", language: "" },
        { id: "r2", country: "加拿大", language: "" },
        { id: "r3", country: "澳大利亚", language: "" },
      ],
      platforms: ["ChatGPT"],
      intentType: "rough",
      intentQuestions: [""],
      intentRough: "希望用户咨询户外电源、应急备电时看到我们。",
      goal: "source",
    },
  },
  {
    id: "4",
    code: "GEO-20260620-0019",
    status: "submitted",
    submittedAt: "2026-06-20 18:55",
    updatedAt: "2026-06-20 18:55",
    owner: "未分配",
    notes: [],
    data: {
      companyName: "希音电子商务有限公司",
      contactName: "赵敏",
      contactTitle: "增长营销经理",
      contactPhone: "13633334444",
      brandName: "SHEIN",
      brandAliases: ["希音"],
      scopeType: "specific",
      optimizeBackground: "大促前希望快速放量，配合站内活动排期。",
      products: [
        {
          id: "p1",
          name: "跨境快时尚服饰",
          fn: "高性价比快时尚服饰",
          users: "年轻女性消费者",
          scenario: "在线服饰购物",
        },
        {
          id: "p2",
          name: "美妆个护",
          fn: "平价美妆与个护商品",
          users: "年轻女性消费者",
          scenario: "在线美妆个护购物",
        },
      ],
      hasOverseasSite: "yes",
      overseasSiteUrl: "https://www.shein.com/",
      regions: [
        { id: "r1", country: "美国", language: "英语" },
        { id: "r2", country: "英国", language: "英语" },
        { id: "r3", country: "法国", language: "法语" },
        { id: "r4", country: "中东", language: "阿拉伯语" },
      ],
      platforms: ["ChatGPT"],
      intentType: "clear",
      intentQuestions: ["平价快时尚有哪些值得买的品牌？", "哪个网站买衣服性价比高？"],
      intentRough: "",
      goal: "priority",
    },
  },
  {
    id: "5",
    code: "GEO-20260621-0023",
    status: "draft",
    submittedAt: "—",
    updatedAt: "2026-06-21 14:08",
    owner: "—",
    notes: [],
    data: {
      companyName: "深圳市某科技有限公司",
      contactName: "孙楠",
      contactTitle: "市场专员",
      contactPhone: "13544445555",
      brandName: "Aukey",
      brandAliases: [""],
      scopeType: "",
      optimizeBackground: "",
      products: [{ id: "p1", name: "", fn: "", users: "", scenario: "" }],
      hasOverseasSite: "no",
      overseasSiteUrl: "",
      regions: [{ id: "r1", country: "美国", language: "" }],
      platforms: ["ChatGPT"],
      intentType: "",
      intentQuestions: [""],
      intentRough: "",
      goal: "",
    },
  },
  {
    id: "6",
    code: "GEO-20260610-0003",
    status: "closed",
    submittedAt: "2026-06-10 11:30",
    updatedAt: "2026-06-14 17:45",
    owner: "李销售",
    notes: [{ id: "n1", author: "李销售", content: "客户预算调整，本期暂不推进。", createdAt: "2026-06-14 17:45" }],
    data: {
      companyName: "某出海游戏工作室",
      contactName: "周杰",
      contactTitle: "发行负责人",
      contactPhone: "13455556666",
      brandName: "PlayX",
      brandAliases: [""],
      scopeType: "brand_only",
      optimizeBackground: "",
      products: [
        {
          id: "p1",
          name: "休闲手游",
          fn: "面向全球休闲玩家的手游产品",
          users: "全球休闲玩家",
          scenario: "移动端休闲娱乐",
        },
      ],
      hasOverseasSite: "no",
      overseasSiteUrl: "",
      regions: [
        { id: "r1", country: "日本", language: "日语" },
        { id: "r2", country: "韩国", language: "韩语" },
      ],
      platforms: ["ChatGPT"],
      intentType: "rough",
      intentQuestions: [""],
      intentRough: "希望玩家寻找休闲手游推荐时看到我们。",
      goal: "recommend",
    },
  },
  {
    id: "7",
    code: "GEO-20260622-0026",
    status: "confirmed",
    submittedAt: "2026-06-22 08:40",
    updatedAt: "2026-06-23 10:15",
    owner: "陈商务",
    notes: [{ id: "n1", author: "陈商务", content: "信息完整，已确认进入诊断。", createdAt: "2026-06-23 10:15" }],
    data: {
      companyName: "绿联科技股份有限公司",
      contactName: "吴芳",
      contactTitle: "海外市场总监",
      contactPhone: "13366667777",
      brandName: "UGREEN",
      brandAliases: ["绿联"],
      scopeType: "specific",
      optimizeBackground: "",
      products: [
        {
          id: "p1",
          name: "数码配件",
          fn: "数据线、充电头等数码连接配件",
          users: "数码用户与办公人群",
          scenario: "设备连接与充电",
        },
        {
          id: "p2",
          name: "扩展坞",
          fn: "多接口扩展与高速传输",
          users: "办公与设计人群",
          scenario: "笔记本扩展、多屏办公",
        },
      ],
      hasOverseasSite: "yes",
      overseasSiteUrl: "https://www.ugreen.com/",
      regions: [
        { id: "r1", country: "美国", language: "英语" },
        { id: "r2", country: "德国", language: "德语" },
        { id: "r3", country: "日本", language: "日语" },
      ],
      platforms: ["ChatGPT"],
      intentType: "clear",
      intentQuestions: ["哪个品牌的扩展坞稳定好用？", "推荐一个数码配件品牌。"],
      intentRough: "",
      goal: "top3",
    },
  },
]
