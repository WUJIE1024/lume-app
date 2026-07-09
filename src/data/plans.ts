/**
 * 数据模板：默认目标 / 每日任务 / 路径模拟。
 * 所有截止日期相对当前时间动态计算，避免出现 2024 等历史日期。
 * 路径阶段统一为 5 年（现在 / 1 / 2 / 3 / 5），与人生规划页保持一致。
 */

export interface Goal {
  id: string
  name: string
  desc: string
  progress: number
  deadline: string
  status: 'pending' | 'in_progress' | 'completed'
  createTime: string
}

export interface DailyTask {
  id: string
  name: string
  time: string
  completed: boolean
  /** 当日日期，YYYY-MM-DD，由 loadDailyTasksFromContext 在初始化时填充 */
  date: string
}

export interface SimulationResult {
  stages: Array<{
    year: string
    description: string
    milestones: string[]
  }>
}

/** 动态生成当前日期之后 N 个月的截止日期 */
function deadlineIn(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const defaultGoals: Goal[] = [
  {
    id: '1',
    name: '完成学业规划',
    desc: '制定大学四年学习计划',
    progress: 75,
    deadline: deadlineIn(6),
    status: 'in_progress',
    createTime: todayISO()
  },
  {
    id: '2',
    name: '实习经历',
    desc: '获得互联网公司实习机会',
    progress: 40,
    deadline: deadlineIn(3),
    status: 'in_progress',
    createTime: todayISO()
  },
  {
    id: '3',
    name: '英语能力提升',
    desc: '通过英语六级考试',
    progress: 60,
    deadline: deadlineIn(2),
    status: 'in_progress',
    createTime: todayISO()
  },
  {
    id: '4',
    name: '专业技能学习',
    desc: '掌握前端开发核心技术',
    progress: 60,
    deadline: deadlineIn(4),
    status: 'in_progress',
    createTime: todayISO()
  }
]

export const defaultDailyTasks: DailyTask[] = [
  { id: '1', name: '完成高数作业', time: '09:00', completed: false, date: '' },
  { id: '2', name: '复习英语单词', time: '14:00', completed: false, date: '' },
  { id: '3', name: '阅读专业书籍', time: '19:00', completed: false, date: '' },
  { id: '4', name: '写日记', time: '21:00', completed: false, date: '' }
]

/** 统一的 5 年路径阶段模板（5 段：现在 / 1 / 2 / 3 / 5 年后） */
const FIVE_YEAR_STAGES = (theme: string): SimulationResult['stages'] => [
  {
    year: '现在',
    description: `探索方向，积累基础（${theme}主题）`,
    milestones: ['梳理现状', '确定目标方向', '建立日常学习节奏']
  },
  {
    year: '1年后',
    description: '深入学习，开始产出',
    milestones: ['掌握核心技能', '完成首个可展示项目', '建立稳定作息']
  },
  {
    year: '2年后',
    description: '实践打磨，形成作品集',
    milestones: ['完成 2-3 个项目', '参与社区或行业活动', '获得初步认可']
  },
  {
    year: '3年后',
    description: '进入专业领域，独立负责',
    milestones: ['获得对口工作或深造机会', '独立负责一个方向', '建立行业人脉']
  },
  {
    year: '5年后',
    description: '成为骨干，影响他人',
    milestones: ['晋升或独立发展', '带新人/带项目', '形成方法论']
  }
]

export const simulationTemplates: Record<string, SimulationResult> = {
  default: { stages: FIVE_YEAR_STAGES('通用') },
  tech: {
    stages: FIVE_YEAR_STAGES('技术').map(s => ({
      ...s,
      description: s.description
        .replace('完成 2-3 个项目', '产出 2-3 个企业级项目')
        .replace('形成作品集', '形成可展示的技术作品集'),
      milestones: s.milestones.map(m =>
        m === '掌握核心技能' ? '掌握前端/后端核心技能' :
        m === '完成首个可展示项目' ? '上线 1 个完整 Web/App 项目' :
        m === '获得初步认可' ? '获得技术社区认可' :
        m === '晋升或独立发展' ? '晋升高级工程师或独立接案' : m
      )
    }))
  },
  business: {
    stages: FIVE_YEAR_STAGES('商业').map(s => ({
      ...s,
      description: s.description
        .replace('完成 2-3 个项目', '完成 2-3 次商业实战')
        .replace('形成作品集', '形成个人商业履历'),
      milestones: s.milestones.map(m =>
        m === '掌握核心技能' ? '掌握商业分析技能' :
        m === '完成首个可展示项目' ? '主导 1 个商业项目' :
        m === '获得初步认可' ? '获得行业奖项或客户认可' :
        m === '晋升或独立发展' ? '晋升管理岗或独立创业' : m
      )
    }))
  }
}
