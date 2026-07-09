<template>
  <view class="companion-container">
    <view class="chat-header">
      <view class="avatar-section">
        <view class="avatar">
          <text class="avatar-icon">L</text>
        </view>
        <view class="avatar-info">
          <text class="avatar-name">Lume</text>
          <text class="avatar-status">在线 · 随时陪伴你</text>
        </view>
      </view>
    </view>

    <!-- 用户状态卡：画像 / 测评 / 规划 -->
    <view class="status-card" v-if="profileSummary || testSummary || planSummary">
      <view class="status-row" v-if="profileSummary">
        <text class="status-emoji">👤</text>
        <text class="status-text">{{ profileSummary }}</text>
      </view>
      <view class="status-row" v-if="testSummary">
        <text class="status-emoji">💎</text>
        <text class="status-text">{{ testSummary }}</text>
      </view>
      <view class="status-row" v-if="planSummary">
        <text class="status-emoji">🗺️</text>
        <text class="status-text">{{ planSummary }}</text>
      </view>
    </view>

    <!-- 今日计划监督面板 -->
    <view class="task-panel" v-if="todayTasks.length > 0">
      <view class="task-panel-header">
        <view class="task-panel-title">
          <text class="task-panel-icon">✅</text>
          <text class="task-panel-name">今日计划</text>
        </view>
        <view class="task-panel-progress">
          <text class="task-progress-num">{{ doneCount }}/{{ todayTasks.length }}</text>
          <view class="task-progress-bar">
            <view class="task-progress-fill" :style="{ width: progressPct + '%' }"></view>
          </view>
        </view>
      </view>
      <view class="task-panel-list">
        <view
          class="task-row"
          v-for="t in todayTasks"
          :key="t.id"
          :class="{ done: t.completed }"
          @click="checkInTask(t)"
        >
          <view class="task-box" :class="{ done: t.completed }">
            <text v-if="t.completed">✓</text>
          </view>
          <view class="task-info">
            <text class="task-name" :class="{ done: t.completed }">{{ t.name }}</text>
            <text class="task-time">{{ t.time }}</text>
          </view>
        </view>
      </view>
      <view class="task-panel-footer" v-if="encouragement">
        <text class="encourage-emoji">💖</text>
        <text class="encourage-text">{{ encouragement }}</text>
      </view>
    </view>

    <!-- 无计划时的引导 -->
    <view class="task-panel empty" v-else>
      <view class="empty-row">
        <text class="empty-emoji">📋</text>
        <text class="empty-text">今日还没有计划，去「人生规划」生成一下吧～</text>
      </view>
    </view>

    <scroll-view
      class="chat-content"
      scroll-y
      :scroll-into-view="scrollToId"
      scroll-with-animation
    >
      <view class="message-list">
        <view class="welcome-message">
          <view class="welcome-bubble">
            <text class="welcome-text">你好呀～ 我是Lume，你的专属人生规划陪伴者。今天心情怎么样？有什么想聊的吗？</text>
          </view>
        </view>

        <view
          class="message-item"
          v-for="(msg, index) in messages"
          :key="index"
          :id="'msg-' + index"
          :class="{ self: msg.isSelf }"
        >
          <view class="msg-avatar" v-if="!msg.isSelf">
            <text>L</text>
          </view>
          <view class="msg-content">
            <view class="msg-bubble" :class="{ self: msg.isSelf }">
              <text>{{ msg.content }}</text>
            </view>
            <text class="msg-time">{{ msg.time }}</text>
          </view>
          <view class="msg-avatar self-avatar" v-if="msg.isSelf">
            <text>你</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="quick-actions">
      <text class="quick-title">快捷回复</text>
      <scroll-view class="quick-list" scroll-x>
        <view
          class="quick-item"
          v-for="(item, index) in quickReplies"
          :key="index"
          @click="sendQuickReply(item)"
        >
          <text>{{ item }}</text>
        </view>
      </scroll-view>
    </view>

    <view class="input-section">
      <view class="input-row">
        <view class="input-wrapper">
          <input
            class="message-input"
            v-model="inputText"
            placeholder="和Lume聊聊吧..."
            @confirm="sendMessage"
          />
        </view>
        <view class="send-btn" :class="{ active: inputText.trim() }" @click="sendMessage">
          <text>发送</text>
        </view>
      </view>
      <view class="input-actions">
        <view class="action-item" @click="openMood">
          <text class="action-icon">😊</text>
          <text class="action-text">心情</text>
        </view>
        <view class="action-item" @click="openDiary">
          <text class="action-icon">📝</text>
          <text class="action-text">日记</text>
        </view>
        <view class="action-item" @click="goPlan">
          <text class="action-icon">🎯</text>
          <text class="action-text">计划</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { chat as aiChat, getSmartLocalReply } from '../../utils/aiService'
import * as userContext from '../../utils/userContext'

const ENCOURAGE_LOCAL = [
  '今天又是元气满满的一天呢～继续加油！',
  '完成得很好，一点点在靠近目标啦～',
  '坚持就是胜利，今天的努力都不会白费。',
  '看到你的进步我也很开心，明天继续～',
  '你已经比昨天更强了一点，真棒！'
]

const NUDGE_LOCAL = [
  '今天还剩一些任务哦，挑一个最简单的先开始～',
  '慢慢来，从最小的一步开始就好。',
  '累了就休息一下，记得喝水哦。',
  '别急，先做完一件再想下一件。'
]

function buildCompanionSystemPrompt(ctx: userContext.UserContext): string {
  const profile = ctx.profile
  const plan = ctx.planSummary
  const tests = ctx.testResults
  const moods = ctx.recentMoods.slice(-5)
  const goals = ctx.goals || []
  const tasks = ctx.dailyTasks?.tasks || []
  const done = tasks.filter(t => t.completed).length

  const profileLine = profile
    ? `${profile.age}岁 / ${profile.education} / ${profile.major}专业 / ${profile.careerStage} / 兴趣：${(profile.interests || []).join('、')}`
    : '尚未填写画像（可温柔引导其去"人生规划"页完善）'

  const planLine = plan
    ? plan.aiAnalysis
    : '尚未生成（可引导其去"人生规划"页跑一次 AI 规划）'

  const planStages = plan && Array.isArray(plan.fiveYearPlan) && plan.fiveYearPlan.length
    ? plan.fiveYearPlan.map(s => `${s.year}：${s.description}`).join('；')
    : '—'

  const testLine = tests.length
    ? tests.map(r => `${r.testId.toUpperCase()}: ${r.type}`).join('；')
    : '—'

  const goalLine = goals.length
    ? goals.slice(0, 5).map(g => `${g.name}（${g.status}）`).join('、')
    : '—'

  const taskLine = tasks.length
    ? `已完成 ${done}/${tasks.length}：${tasks.map(t => `${t.completed ? '✓' : '○'} ${t.name}`).join('；')}`
    : '今日无任务'

  const moodLine = moods.length
    ? moods.map(m => m.mood).join('、')
    : '稳定'

  return `你是 Lume，用户的专属人生规划陪伴者。你温柔、贴心，善于倾听；回复简洁（150字以内），用中文，像朋友一样聊天。

【用户画像】${profileLine}

【测评结果】${testLine}

【当前人生规划分析】${planLine}

【关键路径】${planStages}

【当前目标】${goalLine}

【今日计划监督】${taskLine}

【近期心情】${moodLine}

聊天时请主动关联用户的规划、目标与今日计划，给出温暖、可执行的建议；不要空泛鸡汤，也不要复述上面的元信息。
当用户提到完成/打卡时，给予真诚的鼓励；当用户还没完成时，温柔地督促而不是施压。`
}

export default {
  data() {
    const ctx = userContext.loadContext()
    return {
      inputText: '',
      scrollToId: '',
      messages: (ctx.chatHistory || []).map(m => ({
        content: m.content,
        time: m.time,
        isSelf: m.role === 'self'
      })),
      quickReplies: [
        '我今天有点迷茫',
        '给我一些鼓励吧',
        '我完成了今日计划',
        '帮我分析一下我的选择',
        '我想聊聊未来',
        '今天很开心！',
        '感觉有点累',
        '今日打卡'
      ],
      // 监督面板数据
      todayTasks: [] as userContext.DailyTaskItem[],
      encouragement: '' as string,
      generatingEncourage: false,
      // 用户状态摘要
      profileSummary: '',
      testSummary: '',
      planSummary: ''
    }
  },
  computed: {
    doneCount(): number {
      return this.todayTasks.filter(t => t.completed).length
    },
    progressPct(): number {
      if (!this.todayTasks.length) return 0
      return Math.round((this.doneCount / this.todayTasks.length) * 100)
    }
  },
  onShow() {
    this.refreshFromContext()
  },
  methods: {
    refreshFromContext() {
      const ctx = userContext.loadContext()
      // 同步聊天记录
      this.messages = (ctx.chatHistory || []).map(m => ({
        content: m.content,
        time: m.time,
        isSelf: m.role === 'self'
      }))
      // 同步今日任务
      this.todayTasks = ctx.dailyTasks && ctx.dailyTasks.tasks ? [...ctx.dailyTasks.tasks] : []
      // 同步状态摘要
      this.profileSummary = ctx.profile
        ? `${ctx.profile.age}岁 · ${ctx.profile.education} · ${ctx.profile.major}`
        : ''
      this.testSummary = ctx.testResults.length
        ? ctx.testResults.map(r => r.type.split('·')[0].trim()).join(' · ')
        : ''
      this.planSummary = ctx.planSummary
        ? ((ctx.planSummary.userChoice as string) === 'confirmed' ? '路径已确认' :
           (ctx.planSummary.userChoice as string) === 'userCustom' ? '自定义目标' :
           (ctx.planSummary.userChoice as string) === 'noGoal' ? 'AI 推荐目标' :
           (ctx.planSummary.userChoice as string) === 'pending' ? '路径待确认' : '已生成规划')
        : ''
    },
    async sendMessage() {
      const userInput = this.inputText.trim()
      if (!userInput) return

      const now = new Date()
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

      const selfMsg = { content: userInput, time, isSelf: true }
      this.messages.push(selfMsg)
      userContext.appendMessage({ role: 'self', content: userInput, time })

      // 记录情绪
      const mood = userContext.detectMood(userInput)
      if (mood !== 'neutral') {
        userContext.appendMood(mood, userInput.slice(0, 60))
      }

      this.inputText = ''
      this.scrollToBottom()

      uni.showLoading({
        title: '思考中...',
        mask: false
      })

      let reply: string | null = null
      try {
        const ctx = userContext.loadContext()
        reply = await aiChat({
          systemPrompt: buildCompanionSystemPrompt(ctx),
          userMessage: userInput,
          maxTokens: 500,
          temperature: 0.8
        })
      } catch (error) {
        console.error('[companion] ai chat error:', error)
      }

      uni.hideLoading()

      if (!reply) {
        reply = getSmartLocalReply(userInput)
      }

      const replyTime = new Date()
      const replyTimeStr = `${replyTime.getHours().toString().padStart(2, '0')}:${replyTime.getMinutes().toString().padStart(2, '0')}`
      this.messages.push({ content: reply, time: replyTimeStr, isSelf: false })
      userContext.appendMessage({ role: 'lume', content: reply, time: replyTimeStr })
      setTimeout(() => this.scrollToBottom(), 100)
    },

    sendQuickReply(text: string) {
      this.inputText = text
      this.sendMessage()
    },

    scrollToBottom() {
      setTimeout(() => {
        this.scrollToId = 'msg-' + (this.messages.length - 1)
      }, 100)
    },

    openMood() {
      uni.showModal({
        title: '心情日记',
        content: '今天的心情怎么样？',
        editable: true,
        placeholderText: '说说你的心情...',
        success: (res) => {
          if (res.confirm && res.content) {
            const m = userContext.detectMood(res.content)
            userContext.appendMood(m, res.content.slice(0, 60))
            uni.showToast({
              title: '已记录你的心情',
              icon: 'success'
            })
          }
        }
      })
    },

    openDiary() {
      uni.showToast({
        title: '日记功能开发中',
        icon: 'none'
      })
    },

    goPlan() {
      uni.switchTab({
        url: '/pages/plan/plan'
      })
    },

    /**
     * 打卡 / 取消打卡某个任务
     */
    async checkInTask(task: userContext.DailyTaskItem) {
      const updated = userContext.toggleTodayTask(task.id)
      if (updated.dailyTasks) {
        this.todayTasks = [...updated.dailyTasks.tasks]
      }
      const nowDone = this.doneCount
      const total = this.todayTasks.length

      // 全部完成 → 生成鼓励；刚完成最后一项触发
      if (task && !task.completed && nowDone === total && total > 0) {
        await this.generateEncouragement('all_done')
        // 主动 push 一条 Lume 鼓励进聊天
        this.pushLumeMessage(this.encouragement)
      } else if (task && task.completed && nowDone < total) {
        // 用户取消了一项已完成，提醒一下
        const t = `${ENCOURAGE_LOCAL[Math.floor(Math.random() * ENCOURAGE_LOCAL.length)]}（还剩 ${total - nowDone} 项，慢慢来～）`
        this.encouragement = t
      } else if (!task.completed && nowDone > 0) {
        // 刚完成了一项
        const t = ENCOURAGE_LOCAL[Math.floor(Math.random() * ENCOURAGE_LOCAL.length)]
        this.encouragement = t
      } else if (nowDone === 0) {
        // 重置后
        this.encouragement = NUDGE_LOCAL[Math.floor(Math.random() * NUDGE_LOCAL.length)]
      }
    },

    /**
     * 用 AI 生成鼓励/督促语；失败时用本地兜底
     */
    async generateEncouragement(reason: 'all_done' | 'partial' | 'none_done') {
      if (this.generatingEncourage) return
      this.generatingEncourage = true
      try {
        const ctx = userContext.loadContext()
        let sys = ''
        let usr = ''
        if (reason === 'all_done') {
          sys = '你是 Lume，用户刚完成今日全部计划。给一句真诚、温暖的鼓励（30字内），关联他的目标。'
          usr = `今日计划：${this.todayTasks.map(t => t.name).join('、')}。用户目标：${(ctx.goals || []).slice(0, 3).map(g => g.name).join('、') || '—'}`
        } else if (reason === 'partial') {
          sys = '你是 Lume，用户完成了一项任务。给一句简短的肯定（20字内）。'
          usr = `已完成 ${this.doneCount}/${this.todayTasks.length}`
        } else {
          sys = '你是 Lume，用户还没开始今日任务。给一句温柔的督促（30字内），不要施压。'
          usr = `今日待办：${this.todayTasks.map(t => t.name).join('、')}`
        }
        const reply = await aiChat({ systemPrompt: sys, userMessage: usr, temperature: 0.8, maxTokens: 200 })
        if (reply) {
          this.encouragement = reply
        } else {
          this.encouragement = reason === 'all_done'
            ? ENCOURAGE_LOCAL[Math.floor(Math.random() * ENCOURAGE_LOCAL.length)]
            : NUDGE_LOCAL[Math.floor(Math.random() * NUDGE_LOCAL.length)]
        }
      } catch (e) {
        console.warn(e)
        this.encouragement = reason === 'all_done'
          ? ENCOURAGE_LOCAL[Math.floor(Math.random() * ENCOURAGE_LOCAL.length)]
          : NUDGE_LOCAL[Math.floor(Math.random() * NUDGE_LOCAL.length)]
      } finally {
        this.generatingEncourage = false
      }
    },

    /**
     * 把 Lume 鼓励语作为一条消息推入聊天
     */
    pushLumeMessage(text: string) {
      if (!text) return
      const now = new Date()
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      this.messages.push({ content: text, time, isSelf: false })
      userContext.appendMessage({ role: 'lume', content: text, time })
      setTimeout(() => this.scrollToBottom(), 100)
    }
  }
}
</script>

<style lang="scss">
.companion-container {
  min-height: 100vh;
  background: #FFF5F5;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 60rpx 40rpx 24rpx;
  background: linear-gradient(180deg, #FFE4E1 0%, #FFF5F5 100%);
}

.avatar-section {
  display: flex;
  align-items: center;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar-icon {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.avatar-info {
  display: flex;
  flex-direction: column;
}

.avatar-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.avatar-status {
  font-size: 24rpx;
  color: #FF6B8A;
  margin-top: 6rpx;
}

/* ============ 状态卡 ============ */
.status-card {
  margin: 0 32rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.status-row {
  display: flex;
  align-items: center;
}

.status-emoji {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.status-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  flex: 1;
}

/* ============ 今日计划监督面板 ============ */
.task-panel {
  margin: 0 32rpx 20rpx;
  background: linear-gradient(135deg, #FFF0F0 0%, #FFE4E1 100%);
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 138, 0.08);
}

.task-panel.empty {
  background: #FFF5F5;
  border: 2rpx dashed #FFD1D1;
  box-shadow: none;
}

.empty-row {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
}

.empty-emoji {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
}

.task-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.task-panel-title {
  display: flex;
  align-items: center;
}

.task-panel-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.task-panel-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #FF6B8A;
}

.task-panel-progress {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.task-progress-num {
  font-size: 24rpx;
  color: #FF6B8A;
  font-weight: bold;
}

.task-progress-bar {
  width: 120rpx;
  height: 10rpx;
  background: rgba(255,255,255,0.6);
  border-radius: 6rpx;
  overflow: hidden;
}

.task-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B8A 0%, #FF8FA3 100%);
  border-radius: 6rpx;
  transition: width 0.4s ease;
}

.task-panel-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.task-row {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.7);
  border-radius: 14rpx;
  padding: 14rpx 16rpx;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &.done {
    background: rgba(255,255,255,0.4);
  }
}

.task-box {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 3rpx solid #FFB6C1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: #fff;
  margin-right: 16rpx;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &.done {
    background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
    border-color: #FF6B8A;
  }
}

.task-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.task-name {
  font-size: 26rpx;
  color: #333;
  line-height: 1.4;

  &.done {
    color: #999;
    text-decoration: line-through;
  }
}

.task-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.task-panel-footer {
  margin-top: 12rpx;
  padding: 14rpx 16rpx;
  background: rgba(255,255,255,0.7);
  border-radius: 14rpx;
  display: flex;
  align-items: flex-start;
}

.encourage-emoji {
  font-size: 28rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.encourage-text {
  font-size: 24rpx;
  color: #FF6B8A;
  line-height: 1.5;
  flex: 1;
}

.chat-content {
  flex: 1;
  padding: 24rpx 40rpx;
}

.message-list {
  display: flex;
  flex-direction: column;
}

.welcome-message {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 32rpx;
}

.welcome-bubble {
  background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
  border-radius: 24rpx 24rpx 24rpx 8rpx;
  padding: 24rpx 32rpx;
  max-width: 80%;
}

.welcome-text {
  font-size: 28rpx;
  color: #fff;
  line-height: 1.6;
}

.message-item {
  display: flex;
  margin-bottom: 32rpx;

  &.self {
    flex-direction: row-reverse;

    .msg-bubble {
      background: #fff;
      border-radius: 24rpx 24rpx 8rpx 24rpx;
      border: 1rpx solid #FFE4E1;
    }

    .msg-time {
      text-align: right;
    }
  }
}

.msg-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
  flex-shrink: 0;

  &.self-avatar {
    background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  }
}

.msg-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  margin: 0 16rpx;
}

.msg-bubble {
  background: #fff;
  border-radius: 24rpx 24rpx 8rpx 24rpx;
  padding: 20rpx 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);

  text {
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    word-break: break-all;
  }
}

.msg-time {
  font-size: 20rpx;
  color: #999;
  margin-top: 8rpx;
  padding: 0 8rpx;
}

.quick-actions {
  padding: 20rpx 40rpx;
  background: #fff;
  border-top: 1rpx solid #F0F0F0;
}

.quick-title {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
  display: block;
}

.quick-list {
  white-space: nowrap;
}

.quick-item {
  display: inline-block;
  background: #FFF5F5;
  padding: 16rpx 32rpx;
  border-radius: 32rpx;
  margin-right: 16rpx;

  text {
    font-size: 26rpx;
    color: #666;
  }

  &:active {
    background: #FFE4E1;
  }
}

.input-section {
  background: #fff;
  padding: 20rpx 40rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #F0F0F0;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.input-wrapper {
  flex: 1;
  background: #F5F5F5;
  border-radius: 40rpx;
  padding: 0 28rpx;
}

.message-input {
  width: 100%;
  height: 72rpx;
  font-size: 28rpx;
}

.send-btn {
  padding: 18rpx 40rpx;
  border-radius: 40rpx;
  background: #E0E0E0;

  text {
    font-size: 28rpx;
    color: #999;
  }

  &.active {
    background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);

    text {
      color: #fff;
    }
  }
}

.input-actions {
  display: flex;
  justify-content: center;
  gap: 60rpx;
  margin-top: 20rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon {
  font-size: 40rpx;
}

.action-text {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}
</style>
