/**
 * Lume 共享用户上下文
 *
 * 所有页面通过这里读写用户画像 / 人生规划结果 / 测评结果 / 每日计划 / 近期心情 / 聊天历史。
 * 存储使用 uni.storageSync（与项目现有风格一致，H5 端持久化到 localStorage）。
 */

export type Mood = 'positive' | 'negative' | 'anxious' | 'tired' | 'neutral'

export interface UserProfile {
  age: number
  education: string
  major: string
  careerStage: string
  interests: string[]
}

export interface PlanStage {
  year: string
  description: string
  keyActions: string[]
}

export interface PlanSummary {
  aiAnalysis: string
  personalInsight: string
  fiveYearPlan: PlanStage[]
  updatedAt: string
  /** 用户对路径模拟的确认状态：未沟通 / 已确认 / 用户自定 / 推荐方案 */
  userChoice?: 'pending' | 'confirmed' | 'userCustom' | 'recommended'
  /** 如果用户选择"有不同想法"，记录用户的自定义目标文字 */
  userCustomGoal?: string
}

/** 测评结果：来自 data/tests.ts 的 TestResult */
export interface TestResultEntry {
  testId: 'mbti' | 'holland' | 'intelligence' | 'value'
  type: string
  description: string
  career: string[]
  advice: string
  rawScores?: Record<string, number>
  topThree?: Array<{ name: string; score: number }>
  completedAt: string
}

export interface MoodEntry {
  mood: Mood
  snippet: string
  at: string
}

export interface ChatMessage {
  role: 'self' | 'lume'
  content: string
  time: string
}

export interface GoalItem {
  id: string
  name: string
  desc: string
  progress: number
  deadline: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  /** 是否手动完成（非子任务级联触发） */
  completedManually?: boolean
  createTime: string
  /** 关联的五年规划节点（可空） */
  planYear?: string
  /** 是否由 AI 生成（用户可手动加，标记来源） */
  fromAI?: boolean
}

export interface YearlyPlanItem {
  id: string
  goalId: string
  /** 年份，如 2026 */
  year: number
  /** 显示标签，如 "第1年" */
  label: string
  description: string
  progress: number
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  completedManually: boolean
  createTime: string
  fromAI?: boolean
}

export interface MonthlyPlanItem {
  id: string
  yearlyPlanId: string
  goalId: string
  year: number
  month: number
  /** 显示标签，如 "1月" */
  label: string
  focus: string
  progress: number
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  completedManually: boolean
  createTime: string
  fromAI?: boolean
  /** 每日完成率记录：key 为 YYYY-MM-DD，value 为 0-100 的完成率 */
  dailyCompletions?: Record<string, number>
}

export interface DailyTaskItem {
  id: string
  name: string
  time: string
  completed: boolean
  goalId?: string
  yearlyPlanId?: string
  monthlyPlanId?: string
}

export interface DailyTaskBundle {
  date: string  // YYYY-MM-DD
  tasks: DailyTaskItem[]
  updatedAt: string
}

export interface UserContext {
  profile: UserProfile | null
  planSummary: PlanSummary | null
  testResults: TestResultEntry[]
  goals: GoalItem[]
  yearlyPlans: YearlyPlanItem[]
  monthlyPlans: MonthlyPlanItem[]
  dailyTasks: DailyTaskBundle | null
  recentMoods: MoodEntry[]
  chatHistory: ChatMessage[]
  apiKey: string
}

const STORAGE_KEY = 'lume_user_context'

// 与原 companion.vue 一致的 key；保留以防外部已写入
const DEFAULT_API_KEY = 'sk-ixfmbvxuhkneydzhqaqfouoopchmyoxkqorjuvpkopmgdbpr'

function emptyContext(): UserContext {
  return {
    profile: null,
    planSummary: null,
    testResults: [],
    goals: [],
    yearlyPlans: [],
    monthlyPlans: [],
    dailyTasks: null,
    recentMoods: [],
    chatHistory: [],
    apiKey: DEFAULT_API_KEY
  }
}

function readRaw(): UserContext {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (!raw) return emptyContext()
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return { ...emptyContext(), ...parsed }
  } catch (e) {
    console.warn('[userContext] read failed, using empty:', e)
    return emptyContext()
  }
}

function writeRaw(ctx: UserContext) {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(ctx))
  } catch (e) {
    console.warn('[userContext] write failed:', e)
  }
}

export function loadContext(): UserContext {
  return readRaw()
}

export function saveContext(patch: Partial<UserContext>): UserContext {
  const current = readRaw()
  const next: UserContext = { ...current, ...patch }
  writeRaw(next)
  return next
}

export function clearContext() {
  uni.removeStorageSync(STORAGE_KEY)
}

export function setProfile(profile: UserProfile | null): UserContext {
  return saveContext({ profile })
}

export function setPlanSummary(plan: Omit<PlanSummary, 'updatedAt'> | null): UserContext {
  if (plan === null) return saveContext({ planSummary: null })
  const planSummary: PlanSummary = { ...plan, updatedAt: new Date().toISOString() }
  return saveContext({ planSummary })
}

// ============================================================
// 测评结果
// ============================================================

export function setTestResult(result: TestResultEntry): UserContext {
  const current = readRaw()
  // 同 testId 的旧结果覆盖（只保留每个测试的最新一次）
  const filtered = current.testResults.filter(r => r.testId !== result.testId)
  return saveContext({ testResults: [...filtered, result] })
}

export function getTestResult(testId: TestResultEntry['testId']): TestResultEntry | null {
  return readRaw().testResults.find(r => r.testId === testId) || null
}

export function getAllTestResults(): TestResultEntry[] {
  return readRaw().testResults
}

// ============================================================
// 目标
// ============================================================

export function setGoals(goals: GoalItem[]): UserContext {
  return saveContext({ goals })
}

export function upsertGoal(goal: GoalItem): UserContext {
  const current = readRaw()
  const idx = current.goals.findIndex(g => g.id === goal.id)
  let goals: GoalItem[]
  if (idx >= 0) {
    goals = [...current.goals]
    goals[idx] = goal
  } else {
    goals = [goal, ...current.goals]
  }
  return saveContext({ goals })
}

export function removeGoal(goalId: string): UserContext {
  const current = readRaw()
  return saveContext({ goals: current.goals.filter(g => g.id !== goalId) })
}

// ============================================================
// 每年计划
// ============================================================

export function setYearlyPlans(plans: YearlyPlanItem[]): UserContext {
  return saveContext({ yearlyPlans: plans })
}

export function upsertYearlyPlan(plan: YearlyPlanItem): UserContext {
  const current = readRaw()
  const idx = current.yearlyPlans.findIndex(p => p.id === plan.id)
  let yearlyPlans: YearlyPlanItem[]
  if (idx >= 0) {
    yearlyPlans = [...current.yearlyPlans]
    yearlyPlans[idx] = plan
  } else {
    yearlyPlans = [plan, ...current.yearlyPlans]
  }
  return saveContext({ yearlyPlans })
}

export function removeYearlyPlan(planId: string): UserContext {
  const current = readRaw()
  return saveContext({ yearlyPlans: current.yearlyPlans.filter(p => p.id !== planId) })
}

export function getYearlyPlansByGoal(goalId: string): YearlyPlanItem[] {
  return readRaw().yearlyPlans.filter(p => p.goalId === goalId)
}

// ============================================================
// 每月计划
// ============================================================

export function setMonthlyPlans(plans: MonthlyPlanItem[]): UserContext {
  return saveContext({ monthlyPlans: plans })
}

export function upsertMonthlyPlan(plan: MonthlyPlanItem): UserContext {
  const current = readRaw()
  const idx = current.monthlyPlans.findIndex(p => p.id === plan.id)
  let monthlyPlans: MonthlyPlanItem[]
  if (idx >= 0) {
    monthlyPlans = [...current.monthlyPlans]
    monthlyPlans[idx] = plan
  } else {
    monthlyPlans = [plan, ...current.monthlyPlans]
  }
  return saveContext({ monthlyPlans })
}

export function removeMonthlyPlan(planId: string): UserContext {
  const current = readRaw()
  return saveContext({ monthlyPlans: current.monthlyPlans.filter(p => p.id !== planId) })
}

export function getMonthlyPlansByYearlyPlan(yearlyPlanId: string): MonthlyPlanItem[] {
  return readRaw().monthlyPlans.filter(p => p.yearlyPlanId === yearlyPlanId)
}

// ============================================================
// 每日计划
// ============================================================

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getTodayTasks(): DailyTaskItem[] {
  const ctx = readRaw()
  if (!ctx.dailyTasks || ctx.dailyTasks.date !== todayStr()) return []
  return ctx.dailyTasks.tasks
}

export function getTodayProgress(): { done: number; total: number } {
  const tasks = getTodayTasks()
  const done = tasks.filter(t => t.completed).length
  return { done, total: tasks.length }
}

export function setTodayTasks(tasks: DailyTaskItem[]): UserContext {
  return saveContext({
    dailyTasks: {
      date: todayStr(),
      tasks,
      updatedAt: new Date().toISOString()
    }
  })
}

export function toggleTodayTask(taskId: string): UserContext {
  const ctx = readRaw()
  if (!ctx.dailyTasks || ctx.dailyTasks.date !== todayStr()) {
    return ctx
  }
  const tasks = ctx.dailyTasks.tasks.map(t =>
    t.id === taskId ? { ...t, completed: !t.completed } : t
  )
  return saveContext({
    dailyTasks: { ...ctx.dailyTasks, tasks, updatedAt: new Date().toISOString() }
  })
}

export function clearTodayTasks(): UserContext {
  return saveContext({ dailyTasks: null })
}

// ============================================================
// 心情 / 聊天 / API key
// ============================================================

const MAX_MOODS = 20

export function appendMood(mood: Mood, snippet: string): UserContext {
  const current = readRaw()
  const entry: MoodEntry = { mood, snippet, at: new Date().toISOString() }
  const recentMoods = [...current.recentMoods, entry].slice(-MAX_MOODS)
  return saveContext({ recentMoods })
}

const MAX_MESSAGES = 200

export function appendMessage(msg: ChatMessage): UserContext {
  const current = readRaw()
  const chatHistory = [...current.chatHistory, msg].slice(-MAX_MESSAGES)
  return saveContext({ chatHistory })
}

export function setApiKey(apiKey: string): UserContext {
  return saveContext({ apiKey })
}

/**
 * 简单关键词情绪识别。
 * 暴露给 aiService 和 companion 共用。
 */
export function detectMood(text: string): Mood {
  const t = text || ''
  if (/迷茫|焦虑|不安|担心|紧张|恐慌/.test(t)) return 'anxious'
  if (/难过|伤心|不开心|沮丧|失落|崩溃|哭|抑郁/.test(t)) return 'negative'
  if (/累|疲惫|困|没劲|没精神|倦怠/.test(t)) return 'tired'
  if (/开心|高兴|兴奋|顺利|成功|喜欢|棒|谢谢|感谢|太好了/.test(t)) return 'positive'
  return 'neutral'
}

/** 检测用户消息里是否提到"打卡/完成/做完了"等动作关键词 */
export function detectTaskAction(text: string): 'checkin' | 'complete' | 'none' {
  const t = text || ''
  if (/打卡|今日完成|今日打卡|今天完成|做完了|全部完成/.test(t)) return 'checkin'
  if (/完成任务|完成了|做完了|搞定/.test(t)) return 'complete'
  return 'none'
}
