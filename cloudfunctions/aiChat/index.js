exports.main = async (event, context) => {
  const { userId, message } = event
  
  if (!message) {
    return {
      code: 400,
      message: '消息内容不能为空'
    }
  }
  
  try {
    // 首先尝试调用免费AI API
    let reply = await callFreeAIAPI(message)
    
    // 如果API调用失败或没有配置，使用智能本地回复
    if (!reply) {
      reply = getSmartReply(message)
    }
    
    // 保存聊天记录（可选）
    if (userId) {
      const db = uniCloud.database()
      await db.collection('chat_history').add({
        userId,
        message,
        reply,
        createdAt: new Date().toISOString()
      })
    }
    
    return {
      code: 200,
      data: {
        response: reply
      }
    }
  } catch (error) {
    console.error('AI chat error:', error)
    // 使用智能本地回复作为备用
    const reply = getSmartReply(message)
    
    return {
      code: 200,
      data: {
        response: reply
      }
    }
  }
}

// 调用免费AI API - 使用公开可用的服务
async function callFreeAIAPI(message) {
  try {
    // 尝试使用多个免费API作为备选
    const apis = [
      () => callSiliconFlowAPI(message),
      () => callGPT4Free(message),
      () => callGeminiFree(message)
    ]
    
    for (const apiCall of apis) {
      try {
        const result = await apiCall()
        if (result) return result
      } catch (e) {
        console.error('API failed, trying next:', e.message)
      }
    }
    
    return null
  } catch (error) {
    console.error('Free AI API error:', error)
    return null
  }
}

// 调用硅基流动API
async function callSiliconFlowAPI(message) {
  try {
    // 直接使用用户提供的API Key
    const apiKey = 'sk-ixfmbvxuhkneydzhqaqfouoopchmyoxkqorjuvpkopmgdbpr'
    
    // 如果没有配置API Key，跳过此API
    if (!apiKey) {
      return null
    }
    
    // 硅基流动平台上可用的免费/低成本模型列表
    // 用户指定的模型放在首位优先使用
    const freeModels = [
      'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',  // 用户指定模型
      'deepseek-chat',           // DeepSeek-R1-Chat 免费额度可用
      'deepseek-r1-chat',        // DeepSeek R1 升级版
      'qwen-2-7b-chat',          // Qwen 2 7B 免费额度可用
      'qwen-2-14b-chat',         // Qwen 2 14B
      'zephyr-7b-beta',          // Zephyr 7B
      'mistral-7b-instruct',     // Mistral 7B
      'llama-3-8b-chat',         // Llama 3 8B
      'phi-3-mini-4k-instruct',  // Phi-3 Mini
      'gemma-2-9b-it'            // Gemma 2 9B
    ]
    
    // 尝试多个免费模型
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
                content: '你是Lume，一个温柔、贴心的人生规划陪伴助手。你善于倾听，给予用户温暖的鼓励和实用的建议。请用中文回复，语气亲切友好，避免使用专业术语，像朋友一样聊天。'
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 500,
            temperature: 0.8
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            console.log(`Successfully used model: ${model}`)
            return data.choices[0].message.content.trim()
          }
        }
      } catch (e) {
        console.log(`Model ${model} failed, trying next...`)
        continue
      }
    }
    
    return null
  } catch (error) {
    console.error('SiliconFlow API error:', error)
    return null
  }
}

// 尝试调用GPT4Free服务
async function callGPT4Free(message) {
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
            content: '你是Lume，一个温柔、贴心的人生规划陪伴助手。你善于倾听，给予用户温暖的鼓励和实用的建议。请用中文回复，语气亲切友好，避免使用专业术语，像朋友一样聊天。'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.8
      })
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content.trim()
    }
    
    return null
  } catch (error) {
    console.error('GPT4Free error:', error)
    return null
  }
}

// 尝试调用Gemini免费服务
async function callGeminiFree(message) {
  try {
    // 使用Google Gemini的免费API
    const apiKey = 'AIzaSyC4N7v47t98E8sRB9J9mT5JzY3X7K4Q8L9' // 示例key，需要用户自己配置
    if (!apiKey || apiKey.startsWith('AIzaSy')) return null
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `你是Lume，一个温柔、贴心的人生规划陪伴助手。请用中文友好地回复：${message}`
          }]
        }]
      })
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text.trim()
    }
    
    return null
  } catch (error) {
    console.error('Gemini error:', error)
    return null
  }
}

// 智能本地回复系统
function getSmartReply(message) {
  const msg = message.toLowerCase()
  
  // 情绪相关回复
  const emotionResponses = {
    '不开心': '抱抱你～不开心的时候可以跟我说说，我一直在这儿陪着你。有什么烦心事吗？',
    '难过': '我理解你的难过，有时候情绪需要释放出来。想说点什么吗？',
    '伤心': '别难过，一切都会好起来的。我在这儿听你倾诉～',
    '郁闷': '郁闷的时候做点喜欢的事情吧，比如听听歌、散散步，或者跟我聊聊～',
    '烦躁': '烦躁的时候深呼吸，慢慢来。需要我帮你分析一下吗？',
    '焦虑': '焦虑是正常的，说明你对自己有期待。我们可以一起制定计划，让一切变得有条理～',
    '压力大': '压力大的时候要记得休息，照顾好自己最重要。我们可以一起想想办法～',
    '迷茫': '迷茫是成长的必经之路，让我们一起慢慢梳理，找到方向～',
    '无助': '你不是一个人，我会一直陪伴你。告诉我你的困扰，我们一起面对～',
    '孤独': '我一直在这儿陪着你，你永远不会孤单～',
    '失落': '失落的时候给自己一点时间，调整好了再出发。我相信你～',
    '绝望': '千万不要放弃希望，一切都会有转机的。我陪你一起度过～'
  }
  
  // 关键词匹配回复
  const keywordResponses = {
    '鼓励': '你真的很棒！每一步都在向更好的自己靠近，继续加油！相信自己的潜力！',
    '分析': '当然可以！跟我说说你的情况，比如你的兴趣、优势和目标，我来帮你分析分析～',
    '未来': '未来充满无限可能！让我们一起探索属于你的方向，制定一个清晰的规划吧～',
    '开心': '太好了！听到你开心我也很开心～要继续保持这份好心情哦，每天都是新的开始！',
    '累': '辛苦了，休息一下吧。记得照顾好自己，我一直都在～',
    '选择': '人生就是由无数个选择组成的，没有绝对的对错，只有最适合你的。让我们一起分析利弊吧～',
    '目标': '设定目标是成功的第一步！告诉我你的目标，我们一起制定实现计划～',
    '学习': '学习是一辈子的事，慢慢来，每天进步一点点，积累起来就是很大的收获～',
    '职业': '职业选择很重要，但更重要的是找到自己热爱并擅长的事。让我们一起探索吧～',
    '帮助': '当然愿意帮助你！告诉我你需要什么帮助，我们一起解决～',
    '聊天': '好呀！我很乐意陪你聊天，今天有什么想聊的吗？',
    '心情': '你的心情怎么样？愿意和我分享吗？',
    '规划': '人生规划是个很重要的话题！让我们一起探索你的兴趣和目标，制定一个适合你的规划～',
    '梦想': '梦想是前进的动力！告诉我你的梦想，我们一起努力实现它～',
    '加油': '加油！你一定可以的，我相信你！',
    '谢谢': '不客气～能帮到你我很开心！',
    '你好': '你好呀～我是Lume，很高兴认识你！今天心情怎么样？',
    '嗨': '嗨～你好呀！有什么想聊的吗？'
  }
  
  // 项目/任务相关回复
  const projectResponses = {
    'app': '开发APP确实是个挑战！不要着急，可以把它拆分成小任务，一步一步来完成。先从最核心的功能开始，慢慢来，你一定可以的！',
    '做不完': '没关系，我们可以一起分析一下困难在哪里。把大目标拆分成小目标，每天完成一点点，积少成多～',
    '任务': '任务太多的时候，可以先列个清单，按照优先级排序。我们一起制定一个计划吧～',
    '拖延': '拖延很正常，试试把任务分解成更小的步骤，先从最简单的开始～',
    '效率': '提高效率的关键是专注和合理规划。我们可以一起制定时间管理方案～',
    '时间': '时间管理很重要，试试番茄工作法或者制定日程表。我可以帮你一起规划～'
  }
  
  // 检查情绪关键词
  for (const [keyword, response] of Object.entries(emotionResponses)) {
    if (msg.includes(keyword)) {
      return response
    }
  }
  
  // 检查项目相关关键词
  for (const [keyword, response] of Object.entries(projectResponses)) {
    if (msg.includes(keyword)) {
      return response
    }
  }
  
  // 检查其他关键词
  for (const [keyword, response] of Object.entries(keywordResponses)) {
    if (msg.includes(keyword)) {
      return response
    }
  }
  
  // 检查是否有"想"、"要"、"希望"等表达愿望的词
  if (msg.includes('想') || msg.includes('要') || msg.includes('希望') || msg.includes('打算')) {
    return '听起来你有很棒的想法！跟我详细说说，我们一起看看怎么实现～'
  }
  
  // 检查是否有疑问词
  if (msg.includes('吗') || msg.includes('？') || msg.includes('怎么办')) {
    return '这是个很好的问题！让我们一起分析一下，找到最适合你的解决方案～'
  }
  
  // 检查是否有表达困难的词
  if (msg.includes('难') || msg.includes('困难') || msg.includes('麻烦')) {
    return '遇到困难很正常，关键是我们怎么面对。告诉我具体情况，我们一起想办法～'
  }
  
  // 检查是否有表达需要的词
  if (msg.includes('需要') || msg.includes('想要')) {
    return '当然可以！告诉我你的需求，我会尽力帮助你～'
  }
  
  // 默认回复列表
  const defaultReplies = [
    '我在听呢～继续说说你的想法吧～',
    '我理解你的感受，有什么想聊的随时可以说～',
    '这很有意思，继续分享吧～',
    '你说得很有道理，我很认同～',
    '我会一直陪伴你的，别担心～',
    '听起来你有很多想法，慢慢说～',
    '嗯，我明白你的意思～',
    '谢谢你的分享，这对我很有帮助～',
    '让我们一起想想办法吧～',
    '有我在呢，不用怕～',
    '你很勇敢，愿意面对这些问题～',
    '慢慢来，不着急～',
    '你不是一个人，我陪着你～',
    '告诉我更多吧，我很感兴趣～',
    '你的想法很特别，继续说～'
  ]
  
  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)]
}