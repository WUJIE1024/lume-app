exports.main = async (event, context) => {
  const { userId, interests, education, goals } = event
  
  try {
    // 模拟智能推荐
    const recommendations = []
    
    // 根据兴趣推荐
    if (interests && interests.length > 0) {
      const interestMap = {
        '编程': [
          { type: '学习', title: 'Python入门课程', desc: '适合零基础学习编程' },
          { type: '职业', title: '软件工程师', desc: '适合喜欢编程和解决问题的你' }
        ],
        '设计': [
          { type: '学习', title: 'UI设计入门', desc: '学习界面设计基础' },
          { type: '职业', title: 'UI/UX设计师', desc: '创造美观且实用的产品体验' }
        ],
        '音乐': [
          { type: '学习', title: '音乐制作入门', desc: '学习音乐制作软件使用' },
          { type: '职业', title: '音乐制作人', desc: '用音乐表达创意' }
        ],
        '写作': [
          { type: '学习', title: '创意写作课程', desc: '提升写作技巧' },
          { type: '职业', title: '内容创作者', desc: '用文字传递价值' }
        ],
        '运动': [
          { type: '学习', title: '健身教练认证', desc: '成为专业健身教练' },
          { type: '职业', title: '体育教练', desc: '帮助他人健康生活' }
        ],
        '艺术': [
          { type: '学习', title: '绘画基础课程', desc: '从零开始学绘画' },
          { type: '职业', title: '自由艺术家', desc: '追求艺术梦想' }
        ],
        '商业': [
          { type: '学习', title: '商业分析课程', desc: '培养商业思维' },
          { type: '职业', title: '产品经理', desc: '打造用户喜爱的产品' }
        ],
        '教育': [
          { type: '学习', title: '教育学基础', desc: '了解教育原理' },
          { type: '职业', title: '教育工作者', desc: '影响下一代成长' }
        ]
      }
      
      interests.forEach(interest => {
        if (interestMap[interest]) {
          recommendations.push(...interestMap[interest])
        }
      })
    }
    
    // 根据教育背景推荐
    if (education) {
      const educationMap = {
        '高中': [
          { type: '规划', title: '大学专业选择指南', desc: '根据兴趣匹配适合的专业' },
          { type: '学习', title: '大学预科课程', desc: '提前适应大学生活' }
        ],
        '本科': [
          { type: '规划', title: '职业规划咨询', desc: '制定职业发展路径' },
          { type: '学习', title: '实习准备课程', desc: '提升求职竞争力' }
        ],
        '研究生': [
          { type: '规划', title: '学术/职业发展规划', desc: '明确未来方向' },
          { type: '学习', title: '科研方法课程', desc: '提升研究能力' }
        ]
      }
      
      if (educationMap[education]) {
        recommendations.push(...educationMap[education])
      }
    }
    
    // 如果没有足够的推荐，提供默认推荐
    if (recommendations.length === 0) {
      recommendations.push(
        { type: '学习', title: '职业测评', desc: '了解自己的职业倾向' },
        { type: '规划', title: '目标设定指南', desc: '学会制定有效的目标' },
        { type: '学习', title: '时间管理课程', desc: '提升时间管理能力' }
      )
    }
    
    return {
      code: 200,
      data: {
        recommendations: recommendations.slice(0, 5) // 最多返回5条推荐
      }
    }
  } catch (error) {
    return {
      code: 500,
      message: '获取推荐失败',
      error: error.message
    }
  }
}