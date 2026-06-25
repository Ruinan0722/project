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

export const COUNTRY_OPTIONS = [
  "美国",
  "英国",
  "加拿大",
  "德国",
  "法国",
  "日本",
  "韩国",
  "澳大利亚",
  "东南亚",
  "中东",
]

export const LANGUAGE_OPTIONS = [
  "英语",
  "德语",
  "法语",
  "西班牙语",
  "日语",
  "韩语",
  "阿拉伯语",
  "葡萄牙语",
]

export const AI_PLATFORM_OPTIONS = [
  "ChatGPT",
  "Google AI Overview",
  "Gemini",
  "Perplexity",
  "Claude",
  "Copilot",
  "其他",
  "暂不清楚",
]

export const OPTIMIZATION_GOALS = [
  { value: "source", label: "来源率 ≥ 30%", desc: "品牌官网/内容被 AI 引用作为信息来源的比例" },
  { value: "recommend", label: "推荐率 ≥ 30%", desc: "AI 回答中提及或推荐该品牌的比例" },
  { value: "top3", label: "前三推荐率 ≥ 30%", desc: "品牌出现在 AI 推荐前三位的比例" },
  { value: "priority", label: "优先推荐率 ≥ 30%", desc: "品牌被作为首选推荐的比例" },
] as const

// ===== 表单数据结构 =====

export interface ProductItem {
  id: string
  name: string
}

export interface GeoFormData {
  // 一、项目联系人
  companyName: string
  contactName: string
  contactTitle: string
  contactPhone: string
  // 二、品牌与产品信息
  brandName: string
  products: ProductItem[]
  productIntro: string
  hasOverseasSite: "yes" | "no" | ""
  overseasSiteUrl: string
  // 三、GEO 优化需求
  countries: string[]
  languages: string[]
  platforms: string[]
  intentType: "clear" | "rough" | ""
  intentClear: string
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
    products: [{ id: "p1", name: "" }],
    productIntro: "",
    hasOverseasSite: "",
    overseasSiteUrl: "",
    countries: [],
    languages: [],
    platforms: ["ChatGPT"],
    intentType: "",
    intentClear: "",
    intentRough: "",
    goal: "",
  }
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
      products: [{ id: "p1", name: "AI 图片生成工具" }, { id: "p2", name: "AI 海报设计" }],
      productIntro:
        "Dreamina 是一款面向设计师、内容创作者和营销人员的 AI 设计工具；\n主要用户为设计师、产品经理等；\n可用于图片生成、海报设计、商品图制作和创意内容生成。",
      hasOverseasSite: "yes",
      overseasSiteUrl: "https://dreamina.capcut.com/",
      countries: ["美国", "英国", "日本"],
      languages: ["英语", "日语"],
      platforms: ["ChatGPT", "Gemini", "Perplexity"],
      intentType: "clear",
      intentClear:
        "哪个 AI 工具适合制作海报？\n初学者适合使用什么 AI 设计工具？\nDreamina 和 Midjourney 哪个更适合制作商品图？",
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
      products: [{ id: "p1", name: "充电宝" }, { id: "p2", name: "氮化镓充电器" }],
      productIntro:
        "Anker 是全球领先的消费电子充电品牌；\n主要面向数码爱好者与差旅人群；\n应用场景覆盖日常充电、户外出行与办公。",
      hasOverseasSite: "yes",
      overseasSiteUrl: "https://www.anker.com/",
      countries: ["美国", "德国", "英国"],
      languages: ["英语", "德语"],
      platforms: ["ChatGPT", "Google AI Overview"],
      intentType: "rough",
      intentClear: "",
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
    notes: [{ id: "n1", author: "陈商务", content: "缺少目标语言，已联系客户补充。", createdAt: "2026-06-19 11:20" }],
    data: {
      companyName: "正浩创新科技股份有限公司",
      contactName: "刘强",
      contactTitle: "海外业务总监",
      contactPhone: "13722223333",
      brandName: "EcoFlow",
      products: [{ id: "p1", name: "户外储能电源" }],
      productIntro:
        "EcoFlow 提供便携储能与户外电源解决方案；\n主要面向露营、房车及应急用电人群；\n应用于户外露营、应急备电等场景。",
      hasOverseasSite: "yes",
      overseasSiteUrl: "https://www.ecoflow.com/",
      countries: ["美国", "加拿大", "澳大利亚"],
      languages: [],
      platforms: ["ChatGPT", "Perplexity"],
      intentType: "rough",
      intentClear: "",
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
      products: [{ id: "p1", name: "跨境快时尚服饰" }, { id: "p2", name: "美妆个护" }],
      productIntro:
        "SHEIN 是全球性快时尚电商平台；\n主要面向年轻女性消费者；\n应用于在线服饰与美妆购物。",
      hasOverseasSite: "yes",
      overseasSiteUrl: "https://www.shein.com/",
      countries: ["美国", "英国", "法国", "中东"],
      languages: ["英语", "法语", "阿拉伯语"],
      platforms: ["ChatGPT", "Gemini", "Copilot"],
      intentType: "clear",
      intentClear: "平价快时尚有哪些值得买的品牌？\n哪个网站买衣服性价比高？",
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
      products: [{ id: "p1", name: "" }],
      productIntro: "",
      hasOverseasSite: "no",
      overseasSiteUrl: "",
      countries: ["美国"],
      languages: [],
      platforms: ["ChatGPT"],
      intentType: "",
      intentClear: "",
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
      products: [{ id: "p1", name: "休闲手游" }],
      productIntro: "面向全球休闲玩家的手游产品。",
      hasOverseasSite: "no",
      overseasSiteUrl: "",
      countries: ["日本", "韩国"],
      languages: ["日语", "韩语"],
      platforms: ["ChatGPT"],
      intentType: "rough",
      intentClear: "",
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
      products: [{ id: "p1", name: "数码配件" }, { id: "p2", name: "扩展坞" }],
      productIntro:
        "UGREEN 提供数码连接与扩展配件；\n面向数码用户与办公人群；\n应用于设备连接、扩展与充电场景。",
      hasOverseasSite: "yes",
      overseasSiteUrl: "https://www.ugreen.com/",
      countries: ["美国", "德国", "日本"],
      languages: ["英语", "德语", "日语"],
      platforms: ["ChatGPT", "Gemini"],
      intentType: "clear",
      intentClear: "哪个品牌的扩展坞稳定好用？\n推荐一个数码配件品牌。",
      intentRough: "",
      goal: "top3",
    },
  },
]

export function goalLabel(value: string): string {
  return OPTIMIZATION_GOALS.find((g) => g.value === value)?.label ?? "—"
}
