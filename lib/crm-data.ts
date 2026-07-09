// GEO 客户经营与需求管理平台 —— CRM 数据层
// 线索(Lead) → 客户(Customer) + 联系人(Contact) → 商机(Opportunity) → 合同(Contract)
// 跟进记录(FollowUp) 贯穿线索/客户/商机

// ===== 通用选项 =====
export const REGIONS = ["华东区", "华南区", "华北区", "海外"] as const
export const LEAD_SOURCES = [
  "机构推荐",
  "渠道伙伴",
  "线上投放",
  "三方会议",
  "自办会议",
  "热线电话",
  "内容营销",
  "数据采买",
  "名单外呼",
  "landing page",
] as const

export const INDUSTRIES: Record<string, string[]> = {
  消费电子: ["3C数码配件", "智能硬件", "储能电源"],
  互联网: ["跨境电商", "游戏", "SaaS 工具"],
  时尚消费: ["服饰鞋包", "美妆个护", "家居"],
  企业服务: ["营销服务", "咨询服务"],
}
export const INDUSTRY_L1 = Object.keys(INDUSTRIES)

export const COMPANY_NATURES = ["有限责任公司", "股份有限公司", "外商投资企业", "个人独资企业"] as const

// ===== 线索 =====
export type LeadStatus = "untouched" | "touched" | "converted" | "invalid"
export const LEAD_STATUS_META: Record<LeadStatus, { label: string; tone: string }> = {
  untouched: { label: "未触达", tone: "muted" },
  touched: { label: "已触达", tone: "info" },
  converted: { label: "已转客户", tone: "success" },
  invalid: { label: "无效线索", tone: "neutral" },
}
export type LeadLevel = "A" | "B" | "C" | "D"
export type FollowState = "need" | "no_need"

export interface FollowUp {
  id: string
  author: string
  content: string
  date: string
  wechatAdded?: boolean // 是否加企微
}

export interface Lead {
  id: string
  firstContactDate: string // 首次触达日期
  transferDate: string // 转出日期
  source: string
  companyName: string
  city: string
  region: string
  contactName: string
  contactTitle: string
  email: string
  sdr: string
  sales: string
  level: LeadLevel
  followState: FollowState // 需要跟进 / 无需跟进
  status: LeadStatus
  invalidReason?: string
  notes: FollowUp[]
  convertedCustomerId?: string
}

// ===== 客户 =====
export type CustomerStatus = "potential" | "following" | "cooperating" | "lost"
export const CUSTOMER_STATUS_META: Record<CustomerStatus, { label: string; tone: string }> = {
  potential: { label: "潜在客户", tone: "muted" },
  following: { label: "跟进中", tone: "info" },
  cooperating: { label: "合作中", tone: "success" },
  lost: { label: "已流失", tone: "neutral" },
}

export interface Contact {
  id: string
  name: string
  title: string
  phone: string
  email: string
  isPrimary: boolean
  active: boolean
  wechatAdded: boolean
}

export interface Customer {
  id: string
  companyName: string
  brandName: string
  region: string
  city: string
  industryL1: string
  industryL2: string
  foundedDate: string // 成立时间
  creditCode: string // 统一社会信用代码
  registeredCapital: number // 注册资金（万）
  scale: string // 公司规模（人）
  nature: string // 企业性质
  status: CustomerStatus
  owner: string // 销售负责人
  sdrTransferDate: string
  lastFollowAt: string
  source: string
  isKey: boolean // 重点客户
  createdAt: string
  contacts: Contact[]
  notes: FollowUp[]
}

// ===== 商机 =====
export type OppStage =
  | "contact" // 初步接触
  | "demand" // 需求确认
  | "solution" // 方案沟通
  | "quote" // 报价谈判
  | "signing" // 签署中
  | "won" // 已签订
  | "lost" // 已输单
export const OPP_STAGES: OppStage[] = ["contact", "demand", "solution", "quote", "signing", "won", "lost"]
export const OPP_STAGE_META: Record<OppStage, { label: string; tone: string }> = {
  contact: { label: "初步接触", tone: "muted" },
  demand: { label: "需求确认", tone: "info" },
  solution: { label: "方案沟通", tone: "info" },
  quote: { label: "报价谈判", tone: "warning" },
  signing: { label: "签署中", tone: "warning" },
  won: { label: "已签订", tone: "success" },
  lost: { label: "已输单", tone: "neutral" },
}

export const PROJECT_TYPES = ["GEO 基础优化", "GEO 深度优化", "GEO 诊断咨询", "内容代运营"] as const
export const OPT_PERIODS = ["3 个月", "6 个月", "12 个月"] as const
export const LOST_STAGES = ["初步接触", "需求确认", "方案沟通", "报价谈判", "签署中"] as const

export interface Opportunity {
  id: string
  name: string // 商机名称
  customerId: string
  brandName: string
  region: string
  goal: string // 优化目标（复用 geo-data OPTIMIZATION_GOALS）
  platform: string
  period: string // 优化周期
  amount: number // 商机金额
  probability: number // 成交概率 %
  expectedSignDate: string
  stage: OppStage
  owner: string
  projectType: string
  primaryContactId: string
  requestIds: string[] // 关联需求单
  notes: FollowUp[]
  createdAt: string
  lastFollowAt: string
  // 输单信息
  lostStage?: string
  lostReason?: string
  competitor?: string
}

// ===== 合同 =====
export type ContractStatus = "pending" | "signing" | "signed" | "void" | "terminated"
export const CONTRACT_STATUS_META: Record<ContractStatus, { label: string; tone: string }> = {
  pending: { label: "待签订", tone: "muted" },
  signing: { label: "签署中", tone: "warning" },
  signed: { label: "已签订", tone: "success" },
  void: { label: "已作废", tone: "neutral" },
  terminated: { label: "已终止", tone: "neutral" },
}
export type ProjectStatus = "not_started" | "ongoing" | "completed" | "closed"
export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; tone: string }> = {
  not_started: { label: "未开始", tone: "muted" },
  ongoing: { label: "进行中", tone: "info" },
  completed: { label: "已完成", tone: "success" },
  closed: { label: "已关闭", tone: "neutral" },
}
export const CONTRACT_TYPES = ["新签", "续签", "增购"] as const
export const SIGN_TYPES = ["线上电子签", "线下纸质签"] as const

export interface Contract {
  id: string
  code: string // 合同编号
  name: string // 合同名称
  customerId: string
  company: string
  region: string
  city: string
  type: string // 合同类型
  signType: string // 签约类型
  status: ContractStatus
  projectStatus: ProjectStatus
  // 签约信息
  signSubject: string // 签约主体
  signer: string // 合同签订人
  owner: string // 销售负责人
  signerManager: string // 直属上级
  dept: string // 签约部门
  // 金额与周期
  amount: number
  effectiveDate: string
  dualSignDate: string
  validMonths: number
  endDate: string
  attachments: { id: string; name: string; kind: "contract" | "sow" }[]
  opportunityId: string
  createdAt: string
}

// ===== 工具 =====
export function money(n: number): string {
  if (!n) return "—"
  return `¥${n.toLocaleString("zh-CN")}`
}
export function wan(n: number): string {
  return `${(n / 10000).toLocaleString("zh-CN", { maximumFractionDigits: 1 })} 万`
}

const GOAL_LABELS: Record<string, string> = {
  source: "来源率",
  recommend: "推荐率",
  top3: "前三推荐率",
  priority: "优先推荐率",
}
export function goalOrPlatform(goal: string, platform: string): string {
  const g = GOAL_LABELS[goal] ?? goal
  return `${g} · ${platform}`
}

// ===== Mock 数据 =====
// 客户 id 与需求记录（geo-data MOCK_REQUESTS）中的公司对应

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    companyName: "字节跳动有限公司",
    brandName: "Dreamina",
    region: "华北区",
    city: "北京",
    industryL1: "互联网",
    industryL2: "SaaS 工具",
    foundedDate: "2012-03-09",
    creditCode: "91110108MA01AB2C3D",
    registeredCapital: 500000,
    scale: "10000人以上",
    nature: "有限责任公司",
    status: "cooperating",
    owner: "李销售",
    sdrTransferDate: "2026-05-20",
    lastFollowAt: "2026-06-20 16:02",
    source: "机构推荐",
    isKey: true,
    createdAt: "2026-05-20",
    contacts: [
      { id: "ct1", name: "张三", title: "海外市场经理", phone: "13800000000", email: "zhang@bytedance.com", isPrimary: true, active: true, wechatAdded: true },
      { id: "ct2", name: "李梦", title: "增长负责人", phone: "13800000001", email: "limeng@bytedance.com", isPrimary: false, active: true, wechatAdded: false },
    ],
    notes: [
      { id: "f1", author: "李销售", content: "客户意向强，已安排品牌诊断。", date: "2026-06-13 09:10", wechatAdded: true },
      { id: "f2", author: "李销售", content: "官网诊断完成，进入意图挖掘。", date: "2026-06-18 14:30" },
    ],
  },
  {
    id: "c2",
    companyName: "安克创新科技股份有限公司",
    brandName: "Anker",
    region: "华南区",
    city: "深圳",
    industryL1: "消费电子",
    industryL2: "3C数码配件",
    foundedDate: "2011-10-18",
    creditCode: "91440300MA5D9K2E7F",
    registeredCapital: 40800,
    scale: "1000-9999人",
    nature: "股份有限公司",
    status: "following",
    owner: "陈商务",
    sdrTransferDate: "2026-06-01",
    lastFollowAt: "2026-06-15 15:40",
    source: "线上投放",
    isKey: true,
    createdAt: "2026-06-01",
    contacts: [
      { id: "ct3", name: "王丽", title: "品牌负责人", phone: "13911112222", email: "wangli@anker.com", isPrimary: true, active: true, wechatAdded: true },
    ],
    notes: [{ id: "f3", author: "陈商务", content: "已提交需求单，等待内部确认。", date: "2026-06-15 15:40" }],
  },
  {
    id: "c3",
    companyName: "正浩创新科技股份有限公司",
    brandName: "EcoFlow",
    region: "华南区",
    city: "深圳",
    industryL1: "消费电子",
    industryL2: "储能电源",
    foundedDate: "2017-06-20",
    creditCode: "91440300MA5F1G8H9J",
    registeredCapital: 12000,
    scale: "1000-9999人",
    nature: "股份有限公司",
    status: "following",
    owner: "陈商务",
    sdrTransferDate: "2026-06-10",
    lastFollowAt: "2026-06-19 11:20",
    source: "渠道伙伴",
    isKey: false,
    createdAt: "2026-06-10",
    contacts: [
      { id: "ct4", name: "刘强", title: "海外业务总监", phone: "13722223333", email: "liuqiang@ecoflow.com", isPrimary: true, active: true, wechatAdded: false },
    ],
    notes: [{ id: "f4", author: "陈商务", content: "缺少目标语言，已联系客户补充。", date: "2026-06-19 11:20" }],
  },
  {
    id: "c4",
    companyName: "希音电子商务有限公司",
    brandName: "SHEIN",
    region: "华南区",
    city: "广州",
    industryL1: "时尚消费",
    industryL2: "服饰鞋包",
    foundedDate: "2015-08-11",
    creditCode: "91440101MA9M5N6P7Q",
    registeredCapital: 30000,
    scale: "10000人以上",
    nature: "有限责任公司",
    status: "potential",
    owner: "李销售",
    sdrTransferDate: "2026-06-20",
    lastFollowAt: "2026-06-20 18:55",
    source: "内容营销",
    isKey: true,
    createdAt: "2026-06-20",
    contacts: [
      { id: "ct5", name: "赵敏", title: "增长营销经理", phone: "13633334444", email: "zhaomin@shein.com", isPrimary: true, active: true, wechatAdded: true },
    ],
    notes: [],
  },
  {
    id: "c5",
    companyName: "绿联科技股份有限公司",
    brandName: "UGREEN",
    region: "华南区",
    city: "深圳",
    industryL1: "消费电子",
    industryL2: "3C数码配件",
    foundedDate: "2012-03-26",
    creditCode: "91440300MA5EG3R2T1",
    registeredCapital: 41600,
    scale: "1000-9999人",
    nature: "股份有限公司",
    status: "cooperating",
    owner: "陈商务",
    sdrTransferDate: "2026-06-15",
    lastFollowAt: "2026-06-23 10:15",
    source: "三方会议",
    isKey: false,
    createdAt: "2026-06-15",
    contacts: [
      { id: "ct6", name: "吴芳", title: "海外市场总监", phone: "13366667777", email: "wufang@ugreen.com", isPrimary: true, active: true, wechatAdded: true },
    ],
    notes: [{ id: "f5", author: "陈商务", content: "信息完整，已确认进入诊断。", date: "2026-06-23 10:15" }],
  },
]

export const MOCK_LEADS: Lead[] = [
  {
    id: "l1",
    firstContactDate: "2026-06-22",
    transferDate: "",
    source: "线上投放",
    companyName: "深圳市影石创新科技股份有限公司",
    city: "深圳",
    region: "华南区",
    contactName: "陈锐",
    contactTitle: "海外市场经理",
    email: "chenrui@insta360.com",
    sdr: "周 SDR",
    sales: "未分配",
    level: "A",
    followState: "need",
    status: "touched",
    notes: [
      { id: "ln1", author: "周 SDR", content: "首次电话沟通，对 GEO 有兴趣，已加企微。", date: "2026-06-22 10:30", wechatAdded: true },
    ],
  },
  {
    id: "l2",
    firstContactDate: "2026-06-23",
    transferDate: "",
    source: "landing page",
    companyName: "杭州某跨境电商有限公司",
    city: "杭州",
    region: "华东区",
    contactName: "林悦",
    contactTitle: "品牌总监",
    email: "linyue@example.com",
    sdr: "周 SDR",
    sales: "未分配",
    level: "B",
    followState: "need",
    status: "untouched",
    notes: [],
  },
  {
    id: "l3",
    firstContactDate: "2026-06-18",
    transferDate: "",
    source: "名单外呼",
    companyName: "某传统外贸工厂",
    city: "宁波",
    region: "华东区",
    contactName: "黄经理",
    contactTitle: "总经理",
    email: "",
    sdr: "吴 SDR",
    sales: "未分配",
    level: "D",
    followState: "no_need",
    status: "invalid",
    invalidReason: "无海外品牌建设需求，暂不匹配",
    notes: [{ id: "ln2", author: "吴 SDR", content: "客户主营代工，无品牌诉求。", date: "2026-06-18 15:00" }],
  },
  {
    id: "l4",
    firstContactDate: "2026-06-05",
    transferDate: "2026-06-15",
    source: "三方会议",
    companyName: "绿联科技股份有限公司",
    city: "深圳",
    region: "华南区",
    contactName: "吴芳",
    contactTitle: "海外市场总监",
    email: "wufang@ugreen.com",
    sdr: "吴 SDR",
    sales: "陈商务",
    level: "A",
    followState: "no_need",
    status: "converted",
    convertedCustomerId: "c5",
    notes: [{ id: "ln3", author: "吴 SDR", content: "意向明确，已转出给销售陈商务。", date: "2026-06-15 09:00", wechatAdded: true }],
  },
]

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "o1",
    name: "Dreamina GEO 深度优化项目",
    customerId: "c1",
    brandName: "Dreamina",
    region: "华北区",
    goal: "recommend",
    platform: "ChatGPT",
    period: "6 个月",
    amount: 480000,
    probability: 90,
    expectedSignDate: "2026-07-10",
    stage: "signing",
    owner: "李销售",
    projectType: "GEO 深度优化",
    primaryContactId: "ct1",
    requestIds: ["1"],
    createdAt: "2026-06-13",
    lastFollowAt: "2026-06-20 16:02",
    notes: [{ id: "of1", author: "李销售", content: "合同条款基本确认，进入签署。", date: "2026-06-20 16:02" }],
  },
  {
    id: "o2",
    name: "Anker 品牌 GEO 优化",
    customerId: "c2",
    brandName: "Anker",
    region: "华南区",
    goal: "top3",
    platform: "ChatGPT",
    period: "6 个月",
    amount: 260000,
    probability: 60,
    expectedSignDate: "2026-07-25",
    stage: "solution",
    owner: "陈商务",
    projectType: "GEO 基础优化",
    primaryContactId: "ct3",
    requestIds: ["2"],
    createdAt: "2026-06-15",
    lastFollowAt: "2026-06-15 15:40",
    notes: [{ id: "of2", author: "陈商务", content: "已发送初版方案，等待客户反馈。", date: "2026-06-15 15:40" }],
  },
  {
    id: "o3",
    name: "EcoFlow 户外电源 GEO",
    customerId: "c3",
    brandName: "EcoFlow",
    region: "华南区",
    goal: "source",
    platform: "ChatGPT",
    period: "3 个月",
    amount: 180000,
    probability: 40,
    expectedSignDate: "2026-08-05",
    stage: "demand",
    owner: "陈商务",
    projectType: "GEO 诊断咨询",
    primaryContactId: "ct4",
    requestIds: ["3"],
    createdAt: "2026-06-18",
    lastFollowAt: "2026-06-19 11:20",
    notes: [{ id: "of3", author: "陈商务", content: "需求待补充目标语言。", date: "2026-06-19 11:20" }],
  },
  {
    id: "o4",
    name: "SHEIN 大促 GEO 放量",
    customerId: "c4",
    brandName: "SHEIN",
    region: "华南区",
    goal: "priority",
    platform: "ChatGPT",
    period: "12 个月",
    amount: 720000,
    probability: 30,
    expectedSignDate: "2026-08-20",
    stage: "contact",
    owner: "李销售",
    projectType: "GEO 深度优化",
    primaryContactId: "ct5",
    requestIds: ["4"],
    createdAt: "2026-06-20",
    lastFollowAt: "2026-06-20 18:55",
    notes: [],
  },
  {
    id: "o5",
    name: "UGREEN 数码配件 GEO",
    customerId: "c5",
    brandName: "UGREEN",
    region: "华南区",
    goal: "top3",
    platform: "ChatGPT",
    period: "6 个月",
    amount: 320000,
    probability: 100,
    expectedSignDate: "2026-06-30",
    stage: "won",
    owner: "陈商务",
    projectType: "GEO 基础优化",
    primaryContactId: "ct6",
    requestIds: ["7"],
    createdAt: "2026-06-15",
    lastFollowAt: "2026-06-23 10:15",
    notes: [{ id: "of4", author: "陈商务", content: "合同已签订，进入交付。", date: "2026-06-23 10:15" }],
  },
  {
    id: "o6",
    name: "某游戏工作室 GEO 项目",
    customerId: "c4",
    brandName: "PlayX",
    region: "海外",
    goal: "recommend",
    platform: "ChatGPT",
    period: "3 个月",
    amount: 120000,
    probability: 0,
    expectedSignDate: "2026-06-14",
    stage: "lost",
    owner: "李销售",
    projectType: "GEO 诊断咨询",
    primaryContactId: "ct5",
    requestIds: [],
    createdAt: "2026-06-01",
    lastFollowAt: "2026-06-14 17:45",
    notes: [{ id: "of5", author: "李销售", content: "客户预算调整，本期暂不推进。", date: "2026-06-14 17:45" }],
    lostStage: "报价谈判",
    lostReason: "预算不足，本年度无排期",
    competitor: "竞品 A",
  },
]

export const MOCK_CONTRACTS: Contract[] = [
  {
    id: "ct-1",
    code: "HT-20260623-001",
    name: "UGREEN 数码配件 GEO 基础优化服务合同",
    customerId: "c5",
    company: "绿联科技股份有限公司",
    region: "华南区",
    city: "深圳",
    type: "新签",
    signType: "线上电子签",
    status: "signed",
    projectStatus: "ongoing",
    signSubject: "绿联科技股份有限公司",
    signer: "吴芳",
    owner: "陈商务",
    signerManager: "王总监",
    dept: "海外事业部",
    amount: 320000,
    effectiveDate: "2026-07-01",
    dualSignDate: "2026-06-28",
    validMonths: 6,
    endDate: "2026-12-31",
    attachments: [
      { id: "a1", name: "UGREEN服务合同.pdf", kind: "contract" },
      { id: "a2", name: "UGREEN-SOW.pdf", kind: "sow" },
    ],
    opportunityId: "o5",
    createdAt: "2026-06-23",
  },
  {
    id: "ct-2",
    code: "",
    name: "Dreamina GEO 深度优化服务合同",
    customerId: "c1",
    company: "字节跳动有限公司",
    region: "华北区",
    city: "北京",
    type: "新签",
    signType: "线上电子签",
    status: "pending",
    projectStatus: "not_started",
    signSubject: "",
    signer: "",
    owner: "李销售",
    signerManager: "",
    dept: "",
    amount: 0,
    effectiveDate: "",
    dualSignDate: "",
    validMonths: 0,
    endDate: "",
    attachments: [],
    opportunityId: "o1",
    createdAt: "2026-06-20",
  },
]
