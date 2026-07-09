exports.main = async (event, context) => {
  const { userId, currentSituation } = event
  
  if (!currentSituation) {
    return {
      code: 400,
      message: '请提供当前情况参数'
    }
  }
  
  try {
    const { age, education, major, interests, careerStage } = currentSituation
    
    // 首先尝试调用AI大模型生成智能化分析
    let aiAnalysis = null
    try {
      aiAnalysis = await callAIAnalysis(currentSituation)
    } catch (error) {
      console.error('AI分析调用失败，使用本地模拟:', error.message)
    }
    
    // 创建模拟路径
    const lifePath = {
      fiveYearPlan: [],
      tenYearPlan: [],
      aiAnalysis: aiAnalysis || '根据您的情况，我们为您定制了以下人生规划建议',
      personalInsight: generatePersonalInsight(currentSituation)
    }
    
    // 如果有AI分析结果，基于AI分析生成规划
    if (aiAnalysis) {
      lifePath.fiveYearPlan = generatePlanFromAI(aiAnalysis, 5)
      lifePath.tenYearPlan = generatePlanFromAI(aiAnalysis, 10)
    } else {
      // 使用本地模拟生成规划
      lifePath.fiveYearPlan = generateFiveYearPlan(currentSituation)
      lifePath.tenYearPlan = generateTenYearPlan(currentSituation)
    }
    
    return {
      code: 200,
      data: lifePath
    }
  } catch (error) {
    console.error('人生路径模拟失败:', error)
    return {
      code: 500,
      message: '人生路径模拟失败',
      error: error.message
    }
  }
}

// 调用AI大模型进行人生规划分析
async function callAIAnalysis(currentSituation) {
  const { age, education, major, interests, careerStage } = currentSituation
  
  const prompt = `
请你作为一位专业的人生规划顾问，基于以下用户信息进行详细的人生路径分析：

用户基本信息：
- 年龄：${age}岁
- 教育背景：${education}
- 专业：${major || '未填写'}
- 职业阶段：${careerStage}
- 兴趣爱好：${interests?.join('、') || '未填写'}

请按照以下结构输出分析结果：

1. 现状分析（Strengths/Weaknesses/Opportunities/Threats）
2. 短期目标建议（1-2年）
3. 中期发展规划（3-5年）
4. 长期愿景展望（5-10年）
5. 关键行动建议（具体可执行的步骤）

要求：
- 分析要结合用户的年龄、教育背景和职业阶段
- 考虑用户的兴趣爱好如何融入职业发展
- 提供具体、可操作的建议，避免空泛
- 使用简洁明了的语言，便于用户理解和执行
- 输出格式清晰，分点列出

请用中文回复，语气专业但亲切。
  `.trim()
  
  // 使用多个免费AI API作为备选
  const apis = [
    () => callSiliconFlowAPI(prompt),
    () => callGPT4Free(prompt)
  ]
  
  for (const apiCall of apis) {
    try {
      const result = await apiCall()
      if (result) {
        console.log('AI分析成功')
        return result
      }
    } catch (e) {
      console.error('API调用失败，尝试下一个:', e.message)
    }
  }
  
  return null
}

// 调用硅基流动API
async function callSiliconFlowAPI(prompt) {
  try {
    const apiKey = 'sk-ixfmbvxuhkneydzhqaqfouoopchmyoxkqorjuvpkopmgdbpr'
    
    if (!apiKey) {
      return null
    }
    
    const freeModels = [
      'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
      'deepseek-chat',
      'deepseek-r1-chat',
      'qwen-2-7b-chat',
      'qwen-2-14b-chat',
      'zephyr-7b-beta',
      'mistral-7b-instruct',
      'llama-3-8b-chat',
      'phi-3-mini-4k-instruct',
      'gemma-2-9b-it'
    ]
    
    for (const model of freeModels) {
      try {
        const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: '你是一位专业的人生规划顾问，擅长根据用户的年龄、教育背景、职业阶段和兴趣爱好，提供个性化的人生规划建议。请用中文回复，语气专业但亲切友好。'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 2000,
            temperature: 0.7
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            console.log(`成功使用模型: ${model}`)
            return data.choices[0].message.content.trim()
          }
        }
      } catch (e) {
        console.log(`模型 ${model} 失败，尝试下一个...`)
        continue
      }
    }
    
    return null
  } catch (error) {
    console.error('SiliconFlow API错误:', error)
    return null
  }
}

// 尝试调用GPT4Free服务
async function callGPT4Free(prompt) {
  try {
    const response = await fetch('https://api.chatanywhere.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer pk-this-is-a-real-free-private-key-for-everyone'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的人生规划顾问，擅长根据用户的年龄、教育背景、职业阶段和兴趣爱好，提供个性化的人生规划建议。请用中文回复，语气专业但亲切友好。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content.trim()
    }
    
    return null
  } catch (error) {
    console.error('GPT4Free错误:', error)
    return null
  }
}

// 生成个人洞察
function generatePersonalInsight(currentSituation) {
  const { age, education, careerStage, interests } = currentSituation
  
  let insight = ''
  
  // 年龄阶段分析
  if (age) {
    if (age < 22) {
      insight += `${age}岁正是学业成长的黄金时期，打好基础非常重要。`
    } else if (age < 28) {
      insight += `${age}岁处于职业积累阶段，建议多尝试、多探索，积累经验。`
    } else if (age < 35) {
      insight += `${age}岁是职业上升期，应该明确方向，深耕专业领域。`
    } else if (age < 45) {
      insight += `${age}岁已进入职业成熟期，可以考虑转型或创业。`
    } else {
      insight += `${age}岁是人生的黄金阶段，可以追求更高的人生价值。`
    }
  }
  
  // 教育背景分析
  if (education) {
    const eduMap = {
      '大专': '注重实践技能的培养和应用',
      '本科': '理论基础扎实，可选择的职业方向广泛',
      '硕士': '学术能力强，适合深入研究或专业领域发展',
      '博士': '科研能力突出，可成为行业权威或学术带头人'
    }
    if (eduMap[education]) {
      insight += ` ${education}学历${eduMap[education]}。`
    }
  }
  
  // 职业阶段分析
  if (careerStage) {
    const stageMap = {
      '学生': '建议多参加实践活动，积累经验',
      '应届毕业生': '把握校招机会，尽快适应职场',
      '职场新人': '打好基础，建立职业人脉',
      '经验人士': '深耕领域，争取晋升机会',
      '创业者': '整合资源，勇于尝试'
    }
    if (stageMap[careerStage]) {
      insight += ` 作为${careerStage}，${stageMap[careerStage]}。`
    }
  }
  
  // 兴趣分析
  if (interests && interests.length > 0) {
    insight += ` 你的兴趣爱好包括${interests.join('、')}，可以考虑将兴趣与职业发展结合起来。`
  }
  
  return insight
}

// 根据AI分析生成规划
function generatePlanFromAI(analysis, years) {
  const plan = []
  const stageMap = {
    5: ['探索期', '成长期', '突破期', '发展期', '收获期'],
    10: ['拓展期', '转型期', '突破期', '成熟期', '升华期']
  }
  const stages = stageMap[years] || stageMap[5]
  
  for (let i = 0; i < 5; i++) {
    const yearOffset = years === 5 ? 0 : 5
    plan.push({
      year: yearOffset + i + 1,
      stage: stages[i],
      title: `第${yearOffset + i + 1}年规划`,
      description: '根据AI分析制定的个性化规划',
      keyActions: ['参考AI分析建议执行']
    })
  }
  
  return plan
}

// 生成五年规划（本地模拟）
function generateFiveYearPlan(currentSituation) {
  const { education, interests, careerStage } = currentSituation
  
  const basePlan = [
    {
      year: 1,
      stage: '探索期',
      title: '自我认知与技能积累',
      description: generateYearDescription(careerStage, education, 1),
      keyActions: ['完成职业测评', '制定学习计划', '建立每日习惯']
    },
    {
      year: 2,
      stage: '成长期',
      title: '专业能力提升',
      description: generateYearDescription(careerStage, education, 2),
      keyActions: ['参与实习或项目', '拓展人脉', '建立个人作品集']
    },
    {
      year: 3,
      stage: '突破期',
      title: '职业定位',
      description: generateYearDescription(careerStage, education, 3),
      keyActions: ['确定目标行业', '提升核心竞争力', '寻找导师']
    },
    {
      year: 4,
      stage: '发展期',
      title: '稳步上升',
      description: generateYearDescription(careerStage, education, 4),
      keyActions: ['承担更重要的职责', '学习管理技能', '建立个人品牌']
    },
    {
      year: 5,
      stage: '收获期',
      title: '初步成果',
      description: generateYearDescription(careerStage, education, 5, interests),
      keyActions: ['评估成果', '设定新目标', '回馈社会']
    }
  ]
  
  return basePlan
}

// 生成十年规划（本地模拟）
function generateTenYearPlan(currentSituation) {
  const { interests } = currentSituation
  
  const basePlan = [
    {
      year: 6,
      stage: '拓展期',
      title: '领域深耕',
      description: '成为所在领域的专家',
      keyActions: ['持续学习', '行业影响力建设', '培养团队']
    },
    {
      year: 7,
      stage: '转型期',
      title: '探索新可能',
      description: '尝试跨界或创业',
      keyActions: ['探索副业', '积累创业资源', '拓展视野']
    },
    {
      year: 8,
      stage: '突破期',
      title: '实现飞跃',
      description: '在事业上取得重大突破',
      keyActions: ['抓住关键机会', '承担更大责任', '实现财务目标']
    },
    {
      year: 9,
      stage: '成熟期',
      title: '平衡与传承',
      description: '平衡工作与生活，开始回馈',
      keyActions: ['培养下一代', '分享经验', '建立影响力']
    },
    {
      year: 10,
      stage: '升华期',
      title: '实现价值',
      description: generateTenYearDescription(interests),
      keyActions: ['回顾历程', '设定新的人生愿景', '享受成果']
    }
  ]
  
  return basePlan
}

// 生成年度描述
function generateYearDescription(careerStage, education, year, interests) {
  const descriptions = {
    '学生': {
      1: '通过测评了解自己的优势和兴趣，开始规划未来方向',
      2: '积极参与社团活动和实习，积累实践经验',
      3: '明确职业目标，开始针对性学习和准备',
      4: '完成学业，准备进入职场',
      5: '顺利转型，开启职业生涯新篇章'
    },
    '应届毕业生': {
      1: '制作精美简历，积极参加校招',
      2: '适应职场环境，学习公司文化',
      3: '掌握工作技能，成为团队骨干',
      4: '积累项目经验，准备晋升',
      5: '明确职业发展方向，制定中长期规划'
    },
    '职场新人': {
      1: '夯实基础技能，建立职业自信',
      2: '拓展人脉，学习职场规则',
      3: '争取重要项目，展现能力',
      4: '准备晋升或转型机会',
      5: '成为领域内的专业人才'
    },
    '经验人士': {
      1: '深化专业能力，成为领域专家',
      2: '培养管理能力，带领团队',
      3: '拓展行业影响力',
      4: '考虑创业或转型机会',
      5: '实现职业目标，开始回馈社会'
    },
    '创业者': {
      1: '市场调研，验证商业模式',
      2: '组建团队，启动项目',
      3: '产品上线，获取第一批用户',
      4: '融资扩张，扩大规模',
      5: '实现盈利，打造品牌'
    }
  }
  
  const stageDesc = descriptions[careerStage]
  if (stageDesc && stageDesc[year]) {
    let desc = stageDesc[year]
    
    // 根据教育背景调整
    if (education === '大专') {
      desc += '，注重实践技能的培养'
    } else if (education === '本科') {
      desc += '，发挥理论基础优势'
    } else if (education === '硕士') {
      desc += '，深入研究专业领域'
    } else if (education === '博士') {
      desc += '，发挥科研能力优势'
    }
    
    // 根据兴趣调整
    if (year === 5 && interests && interests.length > 0) {
      desc += `，结合${interests.join('、')}等兴趣发展`
    }
    
    return desc
  }
  
  return '持续学习，稳步发展'
}

// 生成十年期描述
function generateTenYearDescription(interests) {
  const interestMap = {
    '编程': '达成人生重要目标，可能成为技术领导者或创业者',
    '设计': '打造个人品牌，影响更多人',
    '音乐': '成为职业音乐人，实现艺术梦想',
    '写作': '建立内容创作团队，传递思想价值',
    '商业': '打造成功的产品或企业，实现商业价值',
    '运动': '可能成为专业运动员或体育领域从业者',
    '摄影': '成为知名摄影师，用镜头记录世界',
    '烹饪': '成为美食家或餐饮创业者',
    '旅行': '可能从事旅游相关行业或成为旅行博主',
    '阅读': '成为作家或知识分享者'
  }
  
  if (interests && interests.length > 0) {
    const mainInterest = interests[0]
    if (interestMap[mainInterest]) {
      return interestMap[mainInterest]
    }
  }
  
  return '达成人生重要目标，实现自我价值'
}