export interface Question {
  id: number
  text: string
  options: string[]
}

export interface TestResult {
  /** 主要类型编码，如 "INFJ" / "SIA" / "LIS" / "Achieve-Bene" */
  type: string
  description: string
  career: string[]
  advice: string
  /** 完整维度分数（MBTI/霍兰德存各维度，多元智能/价值观存所有维度） */
  rawScores?: Record<string, number>
  /** 排名前三的维度（多元智能 / 价值观使用） */
  topThree?: Array<{ name: string; score: number }>
  completedAt: string
}

export interface TestData {
  id: string
  name: string
  desc: string
  questions: Question[]
  calculateResult: (answers: number[]) => TestResult
}

// ============================================================
// MBTI 人格测试 - 60 题
// ============================================================
// 每题 2 选 1：A 计 0（左侧维度字母），B 计 1（右侧维度字母）
// 维度映射：
//   Q1-15:  E(0) vs I(1)
//   Q16-30: S(0) vs N(1)
//   Q31-45: T(0) vs F(1)
//   Q46-60: J(0) vs P(1)

const E = 'E', I = 'I', S = 'S', N = 'N', T = 'T', F = 'F', J = 'J', P = 'P'

const mbtiQuestions: Question[] = [
  // E/I
  { id: 1, text: '在聚会中你更倾向：', options: ['与多人广泛交谈（包括陌生人）', '与少数熟悉的朋友深聊'] },
  { id: 2, text: '你的充电方式是：', options: ['外出活动、与朋友聚会', '独处、安静地休息'] },
  { id: 3, text: '日常工作中你更喜欢：', options: ['频繁的讨论与互动', '独立专注地完成'] },
  { id: 4, text: '注意力更易被：', options: ['外部环境与人吸引', '内心想法与思考'] },
  { id: 5, text: '表达想法时你习惯：', options: ['边想边说，实时反馈', '想清楚了再完整地说'] },
  { id: 6, text: '做重要决定前你会：', options: ['先和他人讨论', '先自己琢磨清楚'] },
  { id: 7, text: '你的朋友圈更像是：', options: ['广泛但不一定都深交', '少而精，互相了解很深'] },
  { id: 8, text: '工作中频繁被打断时：', options: ['没什么大问题', '会感到很不舒服'] },
  { id: 9, text: '业余时间你更喜欢：', options: ['参加集体活动、社交', '一个人看书、看剧'] },
  { id: 10, text: '第一次见面自我介绍时：', options: ['先说工作、身份等"硬信息"', '慢慢聊感受、建立连接'] },
  { id: 11, text: '接收到新信息时你第一反应是：', options: ['找人聊一聊来消化', '自己安静地消化'] },
  { id: 12, text: '在群体场合中你更常：', options: ['主动活跃气氛', '安静观察、倾听'] },
  { id: 13, text: '情绪表达方式：', options: ['外向、明显地表达', '内敛、含蓄地表达'] },
  { id: 14, text: '你更关注：', options: ['外界发生的事', '内心的想法与感受'] },
  { id: 15, text: '面对难题你更愿意：', options: ['找人讨论寻求帮助', '自己独立研究'] },
  // S/N
  { id: 16, text: '你更关注：', options: ['具体、现实的事情', '可能性、未来的事'] },
  { id: 17, text: '描述事物时你倾向：', options: ['注重事实和数据', '注重隐喻、联想'] },
  { id: 18, text: '学习新事物时你更喜欢：', options: ['实际动手操作', '先了解概念和理论'] },
  { id: 19, text: '工作中你更喜欢：', options: ['完成明确具体的任务', '探索新方向、可能'] },
  { id: 20, text: '回忆过去时：', options: ['按时间顺序梳理', '跳跃式地想起关联'] },
  { id: 21, text: '解决问题时你更相信：', options: ['过往经验', '直觉与灵感'] },
  { id: 22, text: '你更喜欢的书/影视：', options: ['纪实、现实题材', '奇幻、科幻、想象'] },
  { id: 23, text: '旅行时你更愿意：', options: ['按计划走景点', '随性探索、走到哪算哪'] },
  { id: 24, text: '决策时你更看重：', options: ['实际数据与证据', '整体愿景与方向'] },
  { id: 25, text: '你更关注：', options: ['当前的需求', '长远的目标'] },
  { id: 26, text: '描述方式上你更常用：', options: ['具体的例子', '抽象的概念'] },
  { id: 27, text: '看待"变化"：', options: ['需要谨慎评估', '感到兴奋想尝试'] },
  { id: 28, text: '工作风格：', options: ['脚踏实地一步步', '跳跃式、发散'] },
  { id: 29, text: '阅读时你更注意：', options: ['字面意思与事实', '言外之意、联想'] },
  { id: 30, text: '你更偏好：', options: ['确定的答案', '开放的可能性'] },
  // T/F
  { id: 31, text: '做决定时你更看重：', options: ['逻辑分析与事实', '他人感受与价值'] },
  { id: 32, text: '评价他人时你更倾向：', options: ['客观评价', '主观感受'] },
  { id: 33, text: '处理冲突时：', options: ['直接指出问题', '顾及对方情绪'] },
  { id: 34, text: '你在意：', options: ['公平', '仁慈'] },
  { id: 35, text: '你更喜欢：', options: ['有逻辑的辩论', '和谐的关系'] },
  { id: 36, text: '鼓励他人时你更倾向：', options: ['帮 ta 分析问题', '给 ta 表达支持'] },
  { id: 37, text: '反馈意见时：', options: ['直接、不绕弯', '委婉、考虑接受度'] },
  { id: 38, text: '受到批评时：', options: ['理性分析是否合理', '情绪波动较大'] },
  { id: 39, text: '选择工作时你更看重：', options: ['待遇、晋升', '价值感、意义'] },
  { id: 40, text: '对规则的态度：', options: ['需要合理解释', '需要考虑情境'] },
  { id: 41, text: '处理问题：', options: ['先分析再回应', '先共情再回应'] },
  { id: 42, text: '与人争执时：', options: ['坚持原则', '寻求共识'] },
  { id: 43, text: '朋友向你倾诉时：', options: ['帮 ta 分析建议', '陪伴、倾听'] },
  { id: 44, text: '你的决策权重：', options: ['逻辑 > 感受', '感受 > 逻辑'] },
  { id: 45, text: '在团队中你更重视：', options: ['任务完成效率', '团队氛围'] },
  // J/P
  { id: 46, text: '旅行前你会：', options: ['做好详细攻略', '到了再说、随性'] },
  { id: 47, text: '你的桌面/工作区：', options: ['整洁有序', '东西到处放但找得到'] },
  { id: 48, text: '工作方式：', options: ['按部就班推进', '灵活切换任务'] },
  { id: 49, text: '面对截止日期：', options: ['提前规划完成', '临近才赶工'] },
  { id: 50, text: '做决定的速度：', options: ['果断、敲定就执行', '保持开放、还会改'] },
  { id: 51, text: '面对"计划表"：', options: ['依赖它，安心', '觉得被束缚'] },
  { id: 52, text: '面对临时变化：', options: ['不太舒服', '能快速适应'] },
  { id: 53, text: '项目风格：', options: ['先计划再执行', '边做边调整'] },
  { id: 54, text: '面对多个选项：', options: ['限定几个做决定', '都想尝试、保持开放'] },
  { id: 55, text: '任务完成后：', options: ['及时归档收尾', '先放着以后再说'] },
  { id: 56, text: '假期你倾向：', options: ['排满活动', '留白、随遇而安'] },
  { id: 57, text: '任务管理：', options: ['用 todo 工具追踪', '记在脑子里'] },
  { id: 58, text: '做完一个决定后：', options: ['坚定执行', '还可能反悔'] },
  { id: 59, text: '长期目标：', options: ['拆解到每月/每年', '大致方向、不具体'] },
  { id: 60, text: '家里物品摆放：', options: ['分类清晰、有固定位置', '随手放、用时再找'] }
]

const mbtiDescriptions: Record<string, Pick<TestResult, 'description' | 'career' | 'advice'>> = {
  'INTJ': { description: '富有想象力且果断，具有强大的分析能力和长远眼光，独立、有条理。', career: ['战略规划师', '系统架构师', '数据科学家', '投资分析师'], advice: '重视直觉的同时也要倾听他人；适当表达情感对长期关系有益。' },
  'INTP': { description: '聪慧、好奇，热衷于分析和解决复杂问题，独立思考者。', career: ['研究员', '软件工程师', '哲学家', '产品策划'], advice: '将想法付诸实践，建立外部反馈机制以避免过度内耗。' },
  'ENTJ': { description: '果断、坚定，天生的领导者，善于制定和执行长远计划。', career: ['管理者', '创业者', '咨询顾问', '律师'], advice: '学会倾听不同意见，注意团队成员的感受。' },
  'ENTP': { description: '机智、创新，善于发现新机会和挑战现状。', career: ['创业者', '营销专家', '产品经理', '投资顾问'], advice: '学会专注完成一件事，避免精力过度分散。' },
  'INFJ': { description: '富有洞察力和创造力，致力于帮助他人成长，理想主义者。', career: ['心理咨询师', '作家', '职业规划师', '社工'], advice: '建立边界，识别自己过度付出和内耗的信号。' },
  'INFP': { description: '理想主义者，富有同情心，追求内心和谐与意义。', career: ['作家', '艺术家', '心理咨询师', '教育者'], advice: '将理想落地为可执行的小步骤，提升自信。' },
  'ENFJ': { description: '热情、有魅力，善于激励和引导他人成长。', career: ['教师', '培训师', '管理者', 'HR 顾问'], advice: '注意照顾自己，避免被他人情绪消耗。' },
  'ENFP': { description: '充满活力和创造力，热爱探索新事物与人。', career: ['创意策划', '市场营销', '公关', '创业者'], advice: '提升执行力，给有趣的想法设定截止日。' },
  'ISTJ': { description: '可靠、务实，善于组织和执行，传统的"执行者"。', career: ['会计师', '审计师', '项目经理', '公务员'], advice: '适当接受不确定性，多尝试新鲜事物。' },
  'ISFJ': { description: '温暖、负责，善于照顾他人的需求。', career: ['护士', '教师', '行政人员', 'HR'], advice: '学会表达自己的需求，避免过度奉献。' },
  'ESTJ': { description: '务实、果断，善于管理和组织，传统的管理者。', career: ['管理者', '公务员', '律师', '运营经理'], advice: '注重团队多样性，倾听不同声音。' },
  'ESFJ': { description: '热情、友好，善于与人交往和协调。', career: ['销售', '客服', '教师', '活动策划'], advice: '学会拒绝与拒绝他人的愧疚。' },
  'ISTP': { description: '冷静、务实，善于解决实际问题，喜欢动手。', career: ['工程师', '技师', '运动员', '产品设计师'], advice: '学会表达情感，重视长期人脉。' },
  'ISFP': { description: '敏感、富有创造力，热爱美与和谐，活在当下。', career: ['艺术家', '设计师', '摄影师', '音乐人'], advice: '学会自我推销与时间规划。' },
  'ESTP': { description: '精力充沛、善于社交，享受冒险与挑战。', career: ['销售', '创业者', '运动员', '经纪人'], advice: '三思而后行，培养长远规划能力。' },
  'ESFP': { description: '热情、开朗，善于与人互动和娱乐。', career: ['演员', '主持人', '销售', '导游'], advice: '学会规划未来，培养长期目标。' }
}

const mbtiTest: TestData = {
  id: 'mbti',
  name: 'MBTI人格测试',
  desc: '基于 60 道强制选择题，评估你的 4 个核心性格维度，给出 16 型人格之一。',
  questions: mbtiQuestions,
  calculateResult: (answers: number[]) => {
    let eScore = 0, iScore = 0, sScore = 0, nScore = 0, tScore = 0, fScore = 0, jScore = 0, pScore = 0
    for (let i = 0; i < answers.length; i++) {
      const a = answers[i]
      if (i < 15) { a === 0 ? eScore++ : iScore++ }
      else if (i < 30) { a === 0 ? sScore++ : nScore++ }
      else if (i < 45) { a === 0 ? tScore++ : fScore++ }
      else { a === 0 ? jScore++ : pScore++ }
    }
    const e = eScore >= iScore ? E : I
    const s = sScore >= nScore ? S : N
    const t = tScore >= fScore ? T : F
    const j = jScore >= pScore ? J : P
    const type = e + s + t + j
    const info = mbtiDescriptions[type] || mbtiDescriptions['INFP']
    return {
      type: `${type} · ${typeLabel(type)}`,
      description: info.description,
      career: info.career,
      advice: info.advice,
      rawScores: { E: eScore, I: iScore, S: sScore, N: nScore, T: tScore, F: fScore, J: jScore, P: pScore },
      completedAt: new Date().toISOString()
    }
  }
}

function typeLabel(code: string): string {
  return ({
    INTJ: '建筑师', INTP: '逻辑学家', ENTJ: '指挥官', ENTP: '辩论家',
    INFJ: '提倡者', INFP: '调停者', ENFJ: '教育家', ENFP: '竞选者',
    ISTJ: '物流师', ISFJ: '守卫者', ESTJ: '总经理', ESFJ: '执政官',
    ISTP: '鉴赏家', ISFP: '探险家', ESTP: '企业家', ESFP: '表演者'
  } as Record<string, string>)[code] || '探索者'
}

// ============================================================
// 霍兰德职业兴趣测试 - 60 题 (5 点李克特)
// ============================================================
// 1=完全不喜欢 2=不太喜欢 3=中立 4=比较喜欢 5=非常喜欢
// 6 个类型 RIASEC，各 10 题：
//   R(0-9) I(10-19) A(20-29) S(30-39) E(40-49) C(50-59)

const likert = ['完全不喜欢', '不太喜欢', '中立', '比较喜欢', '非常喜欢']

const hollandQuestions: Question[] = [
  // R 现实型
  { id: 1, text: '修理家电、组装家具', options: likert },
  { id: 2, text: '户外体力活动（徒步、骑行、露营）', options: likert },
  { id: 3, text: '操作机器或工具完成具体任务', options: likert },
  { id: 4, text: '园艺、种植、照顾动植物', options: likert },
  { id: 5, text: '烹饪或做手工', options: likert },
  { id: 6, text: '了解汽车、机械的工作原理', options: likert },
  { id: 7, text: '木工、电工等动手建造', options: likert },
  { id: 8, text: '参加体育运动或竞技比赛', options: likert },
  { id: 9, text: '通过实际动手解决具体问题', options: likert },
  { id: 10, text: '在自然环境中工作或探索', options: likert },
  // I 研究型
  { id: 11, text: '阅读科普、学术、研究类文章', options: likert },
  { id: 12, text: '分析数据、设计实验', options: likert },
  { id: 13, text: '探索"为什么"背后的原理', options: likert },
  { id: 14, text: '深入研究自己感兴趣的话题', options: likert },
  { id: 15, text: '解决复杂的逻辑或数学问题', options: likert },
  { id: 16, text: '阅读科学类书籍或纪录片', options: likert },
  { id: 17, text: '做需要数学、统计的工作', options: likert },
  { id: 18, text: '独立完成研究类项目', options: likert },
  { id: 19, text: '观察、记录自然现象或实验结果', options: likert },
  { id: 20, text: '用科学方法验证假设', options: likert },
  // A 艺术型
  { id: 21, text: '绘画、设计、摄影等视觉创作', options: likert },
  { id: 22, text: '写作、创作故事或诗', options: likert },
  { id: 23, text: '演奏乐器、唱歌或作曲', options: likert },
  { id: 24, text: '参与戏剧、表演或舞蹈', options: likert },
  { id: 25, text: '做创意手工艺', options: likert },
  { id: 26, text: '参观艺术展览、看演出', options: likert },
  { id: 27, text: '自由表达情感与想法', options: likert },
  { id: 28, text: '尝试新的艺术形式或风格', options: likert },
  { id: 29, text: '装饰、美化空间', options: likert },
  { id: 30, text: '想象、构思原创作品', options: likert },
  // S 社会型
  { id: 31, text: '帮助他人解决实际问题', options: likert },
  { id: 32, text: '教导、培训或辅导他人', options: likert },
  { id: 33, text: '倾听朋友或家人的倾诉', options: likert },
  { id: 34, text: '参与志愿者或公益活动', options: likert },
  { id: 35, text: '协调团队合作', options: likert },
  { id: 36, text: '关注他人情绪与状态', options: likert },
  { id: 37, text: '组织社区或集体活动', options: likert },
  { id: 38, text: '提供心理咨询或情感支持', options: likert },
  { id: 39, text: '陪伴家人、朋友', options: likert },
  { id: 40, text: '为他人做贡献感到满足', options: likert },
  // E 企业型
  { id: 41, text: '领导团队达成目标', options: likert },
  { id: 42, text: '说服、影响他人观点', options: likert },
  { id: 43, text: '销售、谈判、签约', options: likert },
  { id: 44, text: '创业或经营自己的生意', options: likert },
  { id: 45, text: '竞争、追求卓越表现', options: likert },
  { id: 46, text: '公开发言、演讲', options: likert },
  { id: 47, text: '制定商业或运营策略', options: likert },
  { id: 48, text: '冒险、尝试新商业机会', options: likert },
  { id: 49, text: '管理、激励他人', options: likert },
  { id: 50, text: '达成业绩或销售目标', options: likert },
  // C 常规型
  { id: 51, text: '数据整理、归档工作', options: likert },
  { id: 52, text: '按流程和制度办事', options: likert },
  { id: 53, text: '财务、记账、预算管理', options: likert },
  { id: 54, text: '文字录入、文件处理', options: likert },
  { id: 55, text: '使用电子表格、数据库', options: likert },
  { id: 56, text: '保持事物有序整洁', options: likert },
  { id: 57, text: '遵守规则与制度', options: likert },
  { id: 58, text: '处理日常行政事务', options: likert },
  { id: 59, text: '为活动或项目做详细计划', options: likert },
  { id: 60, text: '做质量检查、数据审阅', options: likert }
]

const hollandTypeNames: Record<string, string> = {
  R: '现实型', I: '研究型', A: '艺术型', S: '社会型', E: '企业型', C: '常规型'
}

const hollandCareerMap: Record<string, string[]> = {
  R: ['工程师', '技术员', '运动员', '农业技术员', '建筑工人', '电工'],
  I: ['科学家', '研究员', '数据分析师', '医生', '程序员', '教授'],
  A: ['设计师', '艺术家', '作家', '音乐人', '导演', '摄影师'],
  S: ['教师', '心理咨询师', '社工', '护士', 'HR', '培训师'],
  E: ['创业者', '销售经理', '律师', '管理者', '营销总监', '投资经理'],
  C: ['会计师', '审计师', '行政人员', '银行柜员', '档案管理', '物流调度']
}

const hollandTest: TestData = {
  id: 'holland',
  name: '霍兰德职业兴趣测试',
  desc: '60 题李克特量表，评估 RIASEC 六型职业兴趣，给出 3 字母职业代码。',
  questions: hollandQuestions,
  calculateResult: (answers: number[]) => {
    const scores: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
    const types = ['R', 'I', 'A', 'S', 'E', 'C']
    for (let i = 0; i < answers.length; i++) {
      const typeIdx = Math.floor(i / 10)
      const v = answers[i] + 1  // 1-5
      scores[types[typeIdx]] += v
    }
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const code = sorted.slice(0, 3).map(s => s[0]).join('')
    const top1 = sorted[0][0]
    const careers = Array.from(new Set([...hollandCareerMap[top1], ...hollandCareerMap[sorted[1][0]].slice(0, 2)]))
    return {
      type: `${code} · ${sorted.slice(0, 3).map(s => hollandTypeNames[s[0]]).join('+')}`,
      description: `你的核心兴趣组合是 ${sorted.slice(0, 3).map(s => hollandTypeNames[s[0]]).join('、')}。在涉及这些领域的工作中你会更投入、更有成就感。`,
      career: careers.slice(0, 6),
      advice: `优先选择能同时发挥你前 2 项兴趣的工作；如果现实条件无法一步到位，可以把第 3 项作为副业或长期发展方向。`,
      rawScores: scores,
      topThree: sorted.slice(0, 3).map(([k, v]) => ({ name: hollandTypeNames[k], score: v })),
      completedAt: new Date().toISOString()
    }
  }
}

// ============================================================
// 多元智能评估 - 48 题 (5 点李克特, 8 类各 6 题)
// ============================================================

const intelligenceNames: Record<string, string> = {
  linguistic: '语言智能', logical: '逻辑数学智能', spatial: '空间智能', kinesthetic: '身体动觉智能',
  musical: '音乐智能', interpersonal: '人际智能', intrapersonal: '内省智能', naturalistic: '自然智能'
}

const intelligenceCareerMap: Record<string, string[]> = {
  linguistic: ['作家', '记者', '律师', '教师', '编辑', '主持人'],
  logical: ['科学家', '工程师', '程序员', '金融分析师', '数学家', '审计师'],
  spatial: ['设计师', '建筑师', '摄影师', '画家', '城市规划师', 'UI 设计师'],
  kinesthetic: ['运动员', '舞蹈家', '演员', '外科医生', '手工艺人', '教练'],
  musical: ['音乐家', '歌手', '作曲家', '音响师', '音乐教师', '指挥家'],
  interpersonal: ['教师', '心理咨询师', '销售', 'HR', '管理者', '社工'],
  intrapersonal: ['心理咨询师', '作家', '研究员', '职业规划师', '顾问', '哲学家'],
  naturalistic: ['生物学家', '环保工作者', '园艺师', '地质学家', '农业技术员', '动物保护']
}

const intelligenceQuestions: Question[] = [
  // linguistic
  { id: 1, text: '我喜欢阅读各类书籍', options: likert },
  { id: 2, text: '我擅长用文字表达想法', options: likert },
  { id: 3, text: '我喜欢玩文字游戏（猜字、填词）', options: likert },
  { id: 4, text: '我善于讲故事或生动地描述事物', options: likert },
  { id: 5, text: '我喜欢学习新词汇并尝试使用', options: likert },
  { id: 6, text: '我写作文、文章时很流畅', options: likert },
  // logical
  { id: 7, text: '我喜欢数学或逻辑推理题', options: likert },
  { id: 8, text: '我善于找出问题背后的规律', options: likert },
  { id: 9, text: '我喜欢下棋、策略类游戏', options: likert },
  { id: 10, text: '我会主动分析事情的前因后果', options: likert },
  { id: 11, text: '我对数字敏感、心算快', options: likert },
  { id: 12, text: '我喜欢做实验、验证假设', options: likert },
  // spatial
  { id: 13, text: '我对地图、方向感很好', options: likert },
  { id: 14, text: '我能轻松想象出立体图形', options: likert },
  { id: 15, text: '我喜欢绘画、设计相关的事', options: likert },
  { id: 16, text: '我能识别物体的细节差异', options: likert },
  { id: 17, text: '我擅长拼图、迷宫类游戏', options: likert },
  { id: 18, text: '我对色彩、构图敏感', options: likert },
  // kinesthetic
  { id: 19, text: '我喜欢动手做东西', options: likert },
  { id: 20, text: '我身体协调性好，擅长运动', options: likert },
  { id: 21, text: '我常用肢体语言辅助表达', options: likert },
  { id: 22, text: '我喜欢跳舞、表演类活动', options: likert },
  { id: 23, text: '我做手工时又快又准', options: likert },
  { id: 24, text: '我坐不住，喜欢活动', options: likert },
  // musical
  { id: 25, text: '我对旋律和节奏敏感', options: likert },
  { id: 26, text: '我能轻松记住歌曲', options: likert },
  { id: 27, text: '我喜欢唱歌或演奏乐器', options: likert },
  { id: 28, text: '我能识别不同乐器的声音', options: likert },
  { id: 29, text: '听音乐会让我沉浸其中', options: likert },
  { id: 30, text: '我尝试创作过音乐或歌词', options: likert },
  // interpersonal
  { id: 31, text: '我善于理解他人情绪', options: likert },
  { id: 32, text: '我朋友很多', options: likert },
  { id: 33, text: '我喜欢组织团队活动', options: likert },
  { id: 34, text: '我能察觉群体中的氛围变化', options: likert },
  { id: 35, text: '我善于调解冲突', options: likert },
  { id: 36, text: '我和陌生人也能很快聊起来', options: likert },
  // intrapersonal
  { id: 37, text: '我清楚自己的优缺点', options: likert },
  { id: 38, text: '我喜欢独处思考', options: likert },
  { id: 39, text: '我有自己稳定的价值观体系', options: likert },
  { id: 40, text: '我常反思自己的行为与动机', options: likert },
  { id: 41, text: '我对未来有清晰的方向感', options: likert },
  { id: 42, text: '我善于调节自己的情绪', options: likert },
  // naturalistic
  { id: 43, text: '我喜欢户外、亲近自然', options: likert },
  { id: 44, text: '我能识别多种动植物', options: likert },
  { id: 45, text: '我关注环保、可持续发展话题', options: likert },
  { id: 46, text: '我对天气、季节变化敏感', options: likert },
  { id: 47, text: '我喜欢观察星空、自然现象', options: likert },
  { id: 48, text: '我愿意参与自然保护活动', options: likert }
]

const intelligenceKeys = ['linguistic', 'logical', 'spatial', 'kinesthetic', 'musical', 'interpersonal', 'intrapersonal', 'naturalistic']

const intelligenceTest: TestData = {
  id: 'intelligence',
  name: '多元智能评估',
  desc: '48 题李克特量表，评估加德纳 8 项多元智能，输出你最强的 3 项智能组合。',
  questions: intelligenceQuestions,
  calculateResult: (answers: number[]) => {
    const scores: Record<string, number> = {}
    intelligenceKeys.forEach(k => { scores[k] = 0 })
    for (let i = 0; i < answers.length; i++) {
      const k = intelligenceKeys[Math.floor(i / 6)]
      scores[k] += answers[i] + 1
    }
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const top3 = sorted.slice(0, 3).map(([k]) => intelligenceNames[k])
    const topKey = sorted[0][0]
    const careers = Array.from(new Set([
      ...intelligenceCareerMap[topKey],
      ...intelligenceCareerMap[sorted[1][0]].slice(0, 2)
    ]))
    return {
      type: `${top3.join(' + ')}`,
      description: `你最强的 3 项智能是：${top3.join('、')}。这意味着你在相关领域的学习和工作会更有优势，可以重点发展。`,
      career: careers.slice(0, 6),
      advice: '发展优势智能的同时，留意较弱智能。多元发展会让你有更广的适应力。',
      rawScores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [intelligenceNames[k], v])),
      topThree: sorted.slice(0, 3).map(([k, v]) => ({ name: intelligenceNames[k], score: v })),
      completedAt: new Date().toISOString()
    }
  }
}

// ============================================================
// 价值观测试 - 30 题 (5 点李克特, 10 类各 3 题)
// Schwartz 10 项基本价值观

const valueNames: Record<string, string> = {
  achievement: '成就', benevolence: '仁爱', conformity: '顺从', hedonism: '享乐', power: '权力',
  security: '安全', selfDirection: '自我导向', stimulation: '刺激', tradition: '传统', universalism: '普遍主义'
}

const valueAdvice: Record<string, string> = {
  achievement: '你渴望被认可为有能力的、成功的。寻找能让你发挥专长、获得正向反馈的工作。',
  benevolence: '你重视身边人的幸福。考虑教育、社工、医疗、HR 等能直接帮助他人的领域。',
  conformity: '你希望符合社会规范与他人期待。稳定、规则清晰的环境会让你更舒适。',
  hedonism: '你追求快乐与享受。避免过度严苛的环境，给生活留出享受的空间。',
  power: '你渴望影响力和地位。可以考虑管理、领导、创业等能调动资源的角色。',
  security: '你重视稳定与安全。考虑公务员、国企、医生、会计师等稳定性强的职业。',
  selfDirection: '你重视独立与自由。创业、自由职业、研究类工作会更适合你。',
  stimulation: '你追求新鲜感与挑战。避免过于重复的工作，选择有变化的领域。',
  tradition: '你尊重传统与文化。在能传承文化、连接家庭的工作中你会更有归属感。',
  universalism: '你关心所有人的福祉。可考虑公益、环保、教育、社会公平类工作。'
}

const valueQuestions: Question[] = [
  // achievement
  { id: 1, text: '事业上的成功对我非常重要', options: likert },
  { id: 2, text: '我希望被他人认可为有能力的', options: likert },
  { id: 3, text: '我追求卓越的表现', options: likert },
  // benevolence
  { id: 4, text: '身边人的幸福对我很重要', options: likert },
  { id: 5, text: '我愿意为他人牺牲一些个人利益', options: likert },
  { id: 6, text: '我重视与亲近的人的互相帮助', options: likert },
  // conformity
  { id: 7, text: '我尽量不做让身边人不舒服的事', options: likert },
  { id: 8, text: '我遵守社会规范与礼仪', options: likert },
  { id: 9, text: '我不愿违背长辈的期待', options: likert },
  // hedonism
  { id: 10, text: '我追求快乐和享受', options: likert },
  { id: 11, text: '我喜欢尝试新鲜有趣的事', options: likert },
  { id: 12, text: '我不愿过苦行僧式的生活', options: likert },
  // power
  { id: 13, text: '我希望影响他人的决定', options: likert },
  { id: 14, text: '我追求社会地位与影响力', options: likert },
  { id: 15, text: '我在意能否掌控资源', options: likert },
  // security
  { id: 16, text: '我追求稳定安全的生活', options: likert },
  { id: 17, text: '我希望财务有保障', options: likert },
  { id: 18, text: '我重视健康和社会的安定', options: likert },
  // selfDirection
  { id: 19, text: '我重视独立思考与自由', options: likert },
  { id: 20, text: '我喜欢自己决定方向', options: likert },
  { id: 21, text: '我不愿被他人安排', options: likert },
  // stimulation
  { id: 22, text: '我喜欢挑战和冒险', options: likert },
  { id: 23, text: '我追求生活中的刺激', options: likert },
  { id: 24, text: '我不愿过平淡无奇的日子', options: likert },
  // tradition
  { id: 25, text: '我重视传统文化与家庭观念', options: likert },
  { id: 26, text: '我尊重宗教与习俗', options: likert },
  { id: 27, text: '我愿意传承家族的价值观', options: likert },
  // universalism
  { id: 28, text: '我关心所有人的福祉', options: likert },
  { id: 29, text: '我重视社会公平与正义', options: likert },
  { id: 30, text: '我愿意保护环境、维护和平', options: likert }
]

const valueKeys = ['achievement', 'benevolence', 'conformity', 'hedonism', 'power', 'security', 'selfDirection', 'stimulation', 'tradition', 'universalism']

const valueTest: TestData = {
  id: 'value',
  name: '价值观测试',
  desc: '30 题李克特量表，基于 Schwartz 价值观理论评估你最核心的 3 项价值观。',
  questions: valueQuestions,
  calculateResult: (answers: number[]) => {
    const scores: Record<string, number> = {}
    valueKeys.forEach(k => { scores[k] = 0 })
    for (let i = 0; i < answers.length; i++) {
      const k = valueKeys[Math.floor(i / 3)]
      scores[k] += answers[i] + 1
    }
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const top3 = sorted.slice(0, 3).map(([k]) => valueNames[k])
    return {
      type: `${top3.join(' + ')} 型`,
      description: `你最核心的 3 项价值观是：${top3.join('、')}。在做职业与人生选择时，这些价值观会强烈影响你的满意度。`,
      career: [
        `契合「${top3[0]}」的典型职业：${valueAdvice[sorted[0][0]].slice(0, 60)}`,
        `契合「${top3[1]}」的方向：${valueAdvice[sorted[1][0]].slice(0, 60)}`,
        `契合「${top3[2]}」的方向：${valueAdvice[sorted[2][0]].slice(0, 60)}`
      ],
      advice: sorted.slice(0, 3).map(([k]) => valueAdvice[k]).join('；'),
      rawScores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [valueNames[k], v])),
      topThree: sorted.slice(0, 3).map(([k, v]) => ({ name: valueNames[k], score: v })),
      completedAt: new Date().toISOString()
    }
  }
}

export const testMap: Record<string, TestData> = {
  mbti: mbtiTest,
  holland: hollandTest,
  intelligence: intelligenceTest,
  value: valueTest
}
