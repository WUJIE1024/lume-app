/**
 * Lume 统一 AI 服务
 *
 * 封装对 SiliconFlow /v1/chat/completions 的调用。
 * 一次 chat() 会按顺序尝试多个模型（与历史代码一致），全部失败时返回 null，
 * 由调用方决定是否走本地兜底 getSmartLocalReply()。
 *
 * API key 来自 userContext.apiKey，可在控制台 / 后续页面里修改。
 */

import { loadContext, detectMood, Mood } from './userContext'

// H5 浏览器环境有 CORS 限制，走 Vite 代理；APP/小程序直接用原始地址
const SILICON_FLOW_URL = (typeof window !== 'undefined' && typeof document !== 'undefined')
  ? '/api/siliconflow/v1/chat/completions'
  : 'https://api.siliconflow.cn/v1/chat/completions'

// 与原 companion.vue 顺序保持一致
const MODEL_CHAIN = [
  'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
  'deepseek-chat',
  'qwen-2-7b-chat',
  'deepseek-r1-chat'
]

export interface ChatOptions {
  systemPrompt: string
  userMessage: string
  model?: string
  temperature?: number
  maxTokens?: number
  /** 规划场景 true：要求模型输出严格 JSON；会附带 response_format 并在 prompt 里强调 */
  jsonMode?: boolean
}

function getApiKey(): string {
  const ctx = loadContext()
  return ctx.apiKey
}

/**
 * 跨端统一请求（H5 走 fetch 包装，mp-weixin 走 uni.request）。
 * 这里优先用 uni.request 以便未来 mp-weixin 也能跑。
 */
function httpPost(url: string, headers: Record<string, string>, body: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // @ts-ignore - uni 在两种端都存在
    if (typeof uni !== 'undefined' && uni.request) {
      uni.request({
        url,
        method: 'POST',
        header: headers,
        data: body,
        timeout: 30000,
        success: (res: any) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(res.data).slice(0, 200)}`))
          }
        },
        fail: (err: any) => reject(err instanceof Error ? err : new Error(String(err)))
      })
      return
    }
    // 浏览器兜底
    fetch(url, { method: 'POST', headers, body })
      .then(r => r.json().then(j => ({ status: r.status, data: j })))
      .then(({ status, data }) => {
        if (status >= 200 && status < 300) resolve(data)
        else reject(new Error(`HTTP ${status}: ${JSON.stringify(data).slice(0, 200)}`))
      })
      .catch(reject)
  })
}

function tryModel(model: string, opts: ChatOptions): Promise<string | null> {
  const apiKey = getApiKey()
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: opts.systemPrompt },
    { role: 'user', content: opts.userMessage }
  ]
  const body: Record<string, any> = {
    model,
    messages,
    max_tokens: opts.maxTokens ?? 500,
    temperature: opts.temperature ?? 0.8
  }
  if (opts.jsonMode) {
    body.response_format = { type: 'json_object' }
  }
  return httpPost(
    SILICON_FLOW_URL,
    {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    JSON.stringify(body)
  )
    .then(data => {
      if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
        return String(data.choices[0].message.content || '').trim() || null
      }
      return null
    })
    .catch(err => {
      console.warn(`[aiService] model ${model} failed:`, err?.message || err)
      return null
    })
}

/**
 * 聊天补全。返回 null 表示全部模型都失败，调用方应走本地兜底。
 */
export async function chat(opts: ChatOptions): Promise<string | null> {
  const chain = opts.model ? [opts.model] : MODEL_CHAIN
  for (const m of chain) {
    // eslint-disable-next-line no-await-in-loop
    const r = await tryModel(m, opts)
    if (r) return r
  }
  return null
}

/**
 * 本地兜底智能回复。
 * 合并原 companion.vue 情绪/鼓励/问题关键词分类（companion.vue:284-336），
 * 并对纯问候类补充。
 */
export function getSmartLocalReply(message: string): string {
  const t = (message || '').trim()
  if (!t) return '我在听呢～'

  // 情绪类
  const moodKeywords = ['难过', '伤心', '不开心', '沮丧', '失落', '焦虑', '迷茫', '压力', '累', '疲惫', '崩溃']
  if (moodKeywords.some(k => t.includes(k))) {
    const m = detectMood(t) as Mood
    if (m === 'anxious') return '迷茫和焦虑都是暂时的，慢慢来，我们一起把它拆解成小步～ 想先从哪件事开始聊？'
    if (m === 'negative') return '抱抱你。难过的时候允许自己停下来，照顾好情绪比硬撑更重要。我一直都在。'
    if (m === 'tired') return '辛苦了，休息一下也没关系。明天再说也来得及，记得对自己温柔一点～'
  }

  // 鼓励类
  const encourageKeywords = ['加油', '努力', '坚持', '奋斗', '目标', '梦想', '鼓励']
  if (encourageKeywords.some(k => t.includes(k))) {
    const replies = [
      '对！就是这种积极的态度，你一定可以的！',
      '加油！坚持下去，成功就在前方！',
      '有目标是好事，一步步来，你会实现梦想的！',
      '奋斗的路上不孤单，我会一直陪伴你～'
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }

  // 问题类
  const questionKeywords = ['怎么办', '怎么', '如何', '为什么', '什么']
  if (questionKeywords.some(k => t.includes(k))) {
    return '这是个值得聊的问题。告诉我更多背景，比如当前最大的卡点是什么？我帮你一起分析。'
  }

  // 问候类
  if (/^(你好|hi|hello|嗨|哈喽|在吗)/i.test(t)) {
    return '你好呀～ 我是 Lume，今天有什么想聊的？'
  }

  // 正面
  if (detectMood(t) === 'positive') {
    return '听到你这么说我也很开心～ 继续乘胜追击！'
  }

  // 默认
  const defaults = [
    '我在听呢，继续说吧～',
    '嗯嗯，我理解你的想法！',
    '未来充满无限可能，让我们一起探索属于你的方向！',
    '你说得很有道理，我觉得可以试试这样...',
    '谢谢你愿意和我分享，这让我很开心～'
  ]
  return defaults[Math.floor(Math.random() * defaults.length)]
}

/**
 * 尝试把模型输出解析为 JSON（容错：剥 markdown 围栏、首尾大括号截取）。
 */
export function tryParseJson<T = any>(text: string): T | null {
  if (!text) return null
  let s = text.trim()
  // 去掉 ```json ... ``` 围栏
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) s = fence[1].trim()
  // 截取第一个 { 到最后一个 }
  const first = s.indexOf('{')
  const last = s.lastIndexOf('}')
  if (first !== -1 && last !== -1 && last > first) {
    s = s.slice(first, last + 1)
  }
  try {
    return JSON.parse(s) as T
  } catch (e) {
    console.warn('[aiService] tryParseJson failed:', e, '\nraw:', text.slice(0, 200))
    return null
  }
}
