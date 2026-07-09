<template>
  <view class="plan-container">
    <view class="page-header">
      <text class="page-title">人生规划</text>
      <text class="page-desc">探索未来，规划人生</text>
    </view>

    <view class="plan-tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === index }"
        v-for="(tab, index) in tabs" 
        :key="index"
        @click="activeTab = index"
      >
        <text>{{ tab }}</text>
      </view>
    </view>

    <!-- 路径模拟 -->
    <view class="simulation-section" v-if="activeTab === 0">
      <view class="sim-card">
        <view class="sim-header">
          <text class="sim-title">人生路径模拟</text>
          <text class="sim-subtitle">基于你的现状，探索不同可能性</text>
        </view>
        
        <view class="timeline">
          <view class="timeline-item" v-for="(item, index) in timelineData" :key="index">
            <view class="timeline-dot" :class="{ active: index <= currentStage }">
              <text v-if="index <= currentStage">✓</text>
            </view>
            <view class="timeline-content">
              <text class="timeline-year">{{ item.year }}</text>
              <text class="timeline-desc">{{ item.description }}</text>
              <view class="milestones" v-if="index <= currentStage">
                <text class="milestone-title">里程碑：</text>
                <view class="milestone-list">
                  <text class="milestone-item" v-for="(milestone, mIdx) in item.milestones" :key="mIdx">
                    • {{ milestone }}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="sim-actions">
          <view class="action-btn primary" @click="runSimulation">
            <text>开始模拟</text>
          </view>
          <view class="action-btn secondary" @click="editProfile">
            <text>修改参数</text>
          </view>
        </view>
      </view>

      <view class="sim-result-card" v-if="showSimulationResult">
        <view class="result-header">
          <text class="result-icon">✨</text>
          <text class="result-title">AI分析完成</text>
        </view>
        <view class="result-summary">
          <text class="summary-text">根据你的个人信息，AI为你提供了专业的人生规划分析：</text>
        </view>
        
        <!-- AI分析结果展示 -->
        <view class="ai-analysis-card" v-if="aiAnalysis">
          <view class="analysis-header">
            <text class="analysis-icon">🤖</text>
            <text class="analysis-title">AI深度分析</text>
          </view>
          <text class="analysis-content">{{ aiAnalysis }}</text>
        </view>
        
        <!-- 个人洞察展示 -->
        <view class="insight-card" v-if="personalInsight">
          <view class="insight-header">
            <text class="insight-icon">💡</text>
            <text class="insight-title">个性化洞察</text>
          </view>
          <text class="insight-content">{{ personalInsight }}</text>
        </view>
        <view class="result-stats">
          <view class="stat-item">
            <text class="stat-value">{{ completedMilestones }}</text>
            <text class="stat-label">已完成里程碑</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ totalYears }}</text>
            <text class="stat-label">规划年限</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ targetStatus }}</text>
            <text class="stat-label">目标状态</text>
          </view>
        </view>

        <view class="rerun-row">
          <text class="rerun-btn" @click="rerunSimulation">↻ 重新模拟</text>
        </view>
      </view>

      <!-- AI 沟通区 -->
      <view class="plan-chat-card" v-if="showSimulationResult && pathConfirmStatus !== 'none'">
        <view class="chat-header">
          <text class="chat-icon">💬</text>
          <text class="chat-title">AI 规划沟通</text>
        </view>

        <view class="chat-msgs">
          <view v-for="(m, i) in planChat" :key="i" :class="['chat-msg', m.role]">
            <text class="msg-content">{{ m.content }}</text>
            <text class="msg-time">{{ m.time }}</text>
          </view>
          <view class="chat-msg ai" v-if="planChatLoading">
            <text class="msg-content typing">AI 正在思考…</text>
          </view>
        </view>

        <!-- 分支选择按钮：仅在 pending 状态显示 -->
        <view v-if="pathConfirmStatus === 'pending'" class="choice-area">
          <text class="choice-label">这个路径符合你内心的个人规划吗？</text>
          <view class="choice-row">
            <view class="choice-btn primary" @click="confirmPathMatches">
              <text>✅ 符合，开始制定目标</text>
            </view>
          </view>
          <view class="choice-row">
            <view class="choice-btn" @click="confirmPathDifferent">
              <text>💬 我有不同想法</text>
            </view>
          </view>
          <view class="choice-row">
            <view class="choice-btn" @click="confirmPathNoGoal">
              <text>🤔 我没具体目标，求推荐</text>
            </view>
          </view>
        </view>

        <!-- 用户自定义目标输入：userCustom 状态 -->
        <view v-if="pathConfirmStatus === 'userCustom'" class="choice-area">
          <text class="choice-label">请描述你的目标（具体一点）：</text>
          <textarea class="custom-goal-input" v-model="customGoalText" placeholder="例如：3 年内成为 AI 产品经理，月薪 30K+" />
          <view class="choice-row">
            <view class="choice-btn primary" @click="submitCustomGoal">
              <text>提交并生成目标</text>
            </view>
          </view>
        </view>

        <!-- 自由对话：confirmed/userCustom/noGoal 之后仍可继续问 -->
        <view class="free-chat">
          <view class="free-input-row">
            <input class="free-input" v-model="planChatInput" placeholder="对路径有疑问？继续问 AI" @confirm="sendPlanChat" />
            <view class="free-send" @click="sendPlanChat">
              <text>发送</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 目标规划 -->
    <view class="goals-section" v-if="activeTab === 1">
      <view class="goals-header">
        <text class="goals-title">我的目标</text>
        <text class="add-btn" @click="showAddGoalModal = true">+ 添加</text>
      </view>

      <view class="goals-ai-bar" v-if="pathConfirmStatus === 'confirmed' || pathConfirmStatus === 'userCustom' || pathConfirmStatus === 'noGoal'">
        <view class="goals-ai-btn" :class="{ disabled: generatingGoals }" @click="generateGoals('基于当前路径和用户当前目标，刷新/补充 3-7 个目标。')">
          <text>✨ {{ generatingGoals ? 'AI 生成中...' : 'AI 重新生成目标' }}</text>
        </view>
      </view>
      <view class="goals-ai-hint" v-else>
        <text>请先在「路径模拟」中确认 AI 路径，然后切回来生成目标</text>
      </view>
      
      <view class="goals-filter">
        <view 
          class="filter-item" 
          :class="{ active: goalFilter === 'all' }"
          @click="goalFilter = 'all'"
        >
          <text>全部</text>
        </view>
        <view 
          class="filter-item" 
          :class="{ active: goalFilter === 'in_progress' }"
          @click="goalFilter = 'in_progress'"
        >
          <text>进行中</text>
        </view>
        <view 
          class="filter-item" 
          :class="{ active: goalFilter === 'completed' }"
          @click="goalFilter = 'completed'"
        >
          <text>已完成</text>
        </view>
      </view>

      <view class="goals-list">
        <view class="goal-card" v-for="goal in filteredGoals" :key="goal.id" @click="viewGoalDetail(goal)">
          <view class="goal-progress-ring">
            <view class="ring-progress" :style="{ '--progress': goal.progress }">
              <text class="progress-value">{{ goal.progress }}%</text>
            </view>
          </view>
          <view class="goal-info">
            <text class="goal-name">{{ goal.name }}</text>
            <text class="goal-desc">{{ goal.desc }}</text>
            <view class="goal-meta">
              <text class="goal-deadline">截止：{{ goal.deadline }}</text>
            </view>
          </view>
          <view class="goal-status" :class="goal.status">
            <text>{{ getStatusText(goal.status) }}</text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="filteredGoals.length === 0">
        <text class="empty-icon">🎯</text>
        <text class="empty-title">暂无目标</text>
        <text class="empty-desc">点击右上角添加你的第一个目标</text>
      </view>
    </view>

    <!-- 每年计划 -->
    <view class="yearly-section" v-if="activeTab === 2">
      <view class="yearly-header">
        <text class="yearly-title">每年计划</text>
        <text class="add-btn" @click="showAddYearlyModal = true">+ 添加年计划</text>
      </view>

      <view class="yearly-ai-bar" v-if="goals.length > 0">
        <view class="yearly-ai-btn" :class="{ disabled: generatingYearly }" @click="generateYearlyPlans">
          <text>✨ {{ generatingYearly ? 'AI 生成中...' : 'AI 生成每年计划' }}</text>
        </view>
      </view>

      <view class="yearly-list">
        <view class="yearly-card" v-for="plan in filteredYearlyPlans" :key="plan.id">
          <view class="yearly-top">
            <view class="yearly-progress-ring">
              <view class="ring-progress small" :style="{ '--progress': plan.progress }">
                <text class="progress-value small">{{ plan.progress }}%</text>
              </view>
            </view>
            <view class="yearly-info">
              <text class="yearly-label">{{ plan.label }}</text>
              <text class="yearly-goal-name">{{ getGoalName(plan.goalId) }}</text>
              <text class="yearly-desc">{{ plan.description }}</text>
            </view>
            <view class="yearly-status" :class="plan.status">
              <text>{{ getStatusText(plan.status) }}</text>
              <text v-if="plan.completedManually && plan.status === 'completed'" class="manual-badge">✋</text>
            </view>
          </view>
          <view class="yearly-actions">
            <text class="yearly-action-btn" v-if="plan.status !== 'completed' && plan.status !== 'skipped'" @click="markYearlyComplete(plan)">
              ✅ 标记完成
            </text>
            <text class="yearly-action-btn skip" v-if="plan.status !== 'skipped' && plan.status !== 'completed'" @click="skipYearlyPlan(plan)">
              ⏭️ 跳过
            </text>
            <text class="yearly-action-btn undo" v-if="plan.status === 'skipped' || plan.completedManually" @click="undoYearlyPlan(plan)">
              ↩️ 恢复
            </text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="filteredYearlyPlans.length === 0">
        <text class="empty-icon">📅</text>
        <text class="empty-title">暂无每年计划</text>
        <text class="empty-desc">请先在「目标规划」中制定目标，再生成每年计划</text>
      </view>
    </view>

    <!-- 每月计划 -->
    <view class="monthly-section" v-if="activeTab === 3">
      <view class="monthly-header">
        <text class="monthly-title">每月计划</text>
        <text class="add-btn" @click="showAddMonthlyModal = true">+ 添加月计划</text>
      </view>

      <view class="monthly-year-filter" v-if="yearlyPlans.length > 0">
        <text class="filter-label">筛选年份：</text>
        <picker mode="selector" :range="yearFilterOptions" @change="onYearFilterChange">
          <text class="filter-value">{{ monthlyYearFilter === 'all' ? '全部' : monthlyYearFilter + '年' }}</text>
        </picker>
      </view>

      <view class="monthly-ai-bar" v-if="yearlyPlans.length > 0">
        <view class="monthly-ai-btn" :class="{ disabled: generatingMonthly }" @click="generateMonthlyPlans">
          <text>✨ {{ generatingMonthly ? 'AI 生成中...' : 'AI 生成每月计划' }}</text>
        </view>
      </view>

      <view class="monthly-list">
        <view class="monthly-card" v-for="plan in filteredMonthlyPlans" :key="plan.id">
          <view class="monthly-top">
            <view class="monthly-progress-ring">
              <view class="ring-progress small" :style="{ '--progress': plan.progress }">
                <text class="progress-value small">{{ plan.progress }}%</text>
              </view>
            </view>
            <view class="monthly-info">
              <text class="monthly-label">{{ plan.label }}</text>
              <text class="monthly-year-ref">{{ plan.year }}年 · {{ getGoalName(plan.goalId) }}</text>
              <text class="monthly-focus">{{ plan.focus }}</text>
            </view>
            <view class="monthly-status" :class="plan.status">
              <text>{{ getStatusText(plan.status) }}</text>
              <text v-if="plan.completedManually && plan.status === 'completed'" class="manual-badge">✋</text>
            </view>
          </view>
          <view class="monthly-actions">
            <text class="monthly-action-btn" v-if="plan.status !== 'completed' && plan.status !== 'skipped'" @click="markMonthlyComplete(plan)">
              ✅ 标记完成
            </text>
            <text class="monthly-action-btn skip" v-if="plan.status !== 'skipped' && plan.status !== 'completed'" @click="skipMonthlyPlan(plan)">
              ⏭️ 跳过
            </text>
            <text class="monthly-action-btn undo" v-if="plan.status === 'skipped' || plan.completedManually" @click="undoMonthlyPlan(plan)">
              ↩️ 恢复
            </text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="filteredMonthlyPlans.length === 0">
        <text class="empty-icon">📆</text>
        <text class="empty-title">暂无每月计划</text>
        <text class="empty-desc">请先在「每年计划」中制定年计划，再生成每月计划</text>
      </view>
    </view>

    <!-- 每日计划 -->
    <view class="daily-section" v-if="activeTab === 4">
      <view class="daily-header">
        <text class="daily-title">{{ currentDate }}</text>
        <view class="date-nav">
          <text class="nav-btn disabled" @click="prevDay">←</text>
          <text class="nav-btn active" @click="today">今天</text>
          <text class="nav-btn disabled" @click="nextDay">→</text>
        </view>
      </view>

      <view class="daily-ai-bar" v-if="goals.length > 0">
        <view class="daily-ai-btn" :class="{ disabled: generatingDaily }" @click="generateDailyPlan">
          <text>✨ {{ generatingDaily ? 'AI 生成中...' : 'AI 生成今日计划' }}</text>
        </view>
        <text class="daily-ai-hint">基于你已制定的 {{ goals.filter(g => g.status !== 'completed').length }} 个未完成目标</text>
      </view>
      <view class="daily-ai-hint" v-else>
        <text>请先在「目标规划」中制定目标，再生成今日计划</text>
      </view>
      
      <view class="daily-stats">
        <view class="daily-stat">
          <text class="stat-num">{{ completedCount }}</text>
          <text class="stat-text">已完成</text>
        </view>
        <view class="daily-stat">
          <text class="stat-num">{{ dailyTasks.length - completedCount }}</text>
          <text class="stat-text">待完成</text>
        </view>
        <view class="daily-progress">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: dailyProgress + '%' }"></view>
          </view>
          <text class="progress-text">{{ dailyProgress }}%</text>
        </view>
      </view>

      <view class="daily-tasks">
        <view 
          class="task-item" 
          v-for="(task, index) in dailyTasks" 
          :key="task.id"
          @click="toggleTask(index)"
        >
          <view class="task-checkbox" :class="{ checked: task.completed }">
            <text v-if="task.completed">✓</text>
          </view>
          <view class="task-content">
            <text class="task-name" :class="{ completed: task.completed }">{{ task.name }}</text>
            <text class="task-time">{{ task.time }}</text>
          </view>
          <view class="task-indicator" :class="{ completed: task.completed }"></view>
        </view>
      </view>

      <view class="add-task-btn" @click="showAddTaskModal = true">
        <text class="add-icon">+</text>
        <text class="add-text">添加任务</text>
      </view>
    </view>

    <!-- 添加目标弹窗 -->
    <view class="modal-overlay" v-if="showAddGoalModal" @click="closeAddGoalModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingGoal ? '编辑目标' : '添加目标' }}</text>
          <text class="modal-close" @click="closeAddGoalModal">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">目标名称</text>
            <input class="form-input" v-model="goalForm.name" placeholder="请输入目标名称" />
          </view>
          <view class="form-item">
            <text class="form-label">目标描述</text>
            <textarea class="form-textarea" v-model="goalForm.desc" placeholder="请输入目标描述"></textarea>
          </view>
          <view class="form-item">
            <text class="form-label">截止日期</text>
            <picker mode="date" :value="goalForm.deadline" @change="onDeadlineChange">
              <view class="form-input">
                <text>{{ goalForm.deadline || '请选择日期' }}</text>
              </view>
            </picker>
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="closeAddGoalModal">取消</view>
          <view class="modal-btn confirm" @click="saveGoal">保存</view>
        </view>
      </view>
    </view>

    <!-- 添加任务弹窗 -->
    <view class="modal-overlay" v-if="showAddTaskModal" @click="closeAddTaskModal">
      <view class="modal-content small" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加任务</text>
          <text class="modal-close" @click="closeAddTaskModal">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">任务名称</text>
            <input class="form-input" v-model="taskForm.name" placeholder="请输入任务名称" />
          </view>
          <view class="form-item">
            <text class="form-label">时间</text>
            <picker mode="time" :value="taskForm.time" @change="onTimeChange">
              <view class="form-input">
                <text>{{ taskForm.time || '请选择时间' }}</text>
              </view>
            </picker>
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="closeAddTaskModal">取消</view>
          <view class="modal-btn confirm" @click="saveTask">保存</view>
        </view>
      </view>
    </view>

    <!-- 目标详情弹窗 -->
    <view class="modal-overlay" v-if="showGoalDetail" @click="showGoalDetail = false">
      <view class="modal-content large" @click.stop>
        <view class="modal-header">
          <text class="modal-title">目标详情</text>
          <text class="modal-close" @click="showGoalDetail = false">×</text>
        </view>
        <view class="modal-body" v-if="selectedGoal">
          <view class="detail-progress">
            <view class="detail-ring">
              <view class="ring-progress large" :style="{ '--progress': selectedGoal.progress }">
                <text class="progress-value">{{ selectedGoal.progress }}%</text>
              </view>
            </view>
            <text class="detail-name">{{ selectedGoal.name }}</text>
            <text class="detail-status" :class="selectedGoal.status">{{ getStatusText(selectedGoal.status) }}</text>
          </view>
          <view class="detail-info">
            <view class="info-row">
              <text class="info-label">描述</text>
              <text class="info-value">{{ selectedGoal.desc }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">截止日期</text>
              <text class="info-value">{{ selectedGoal.deadline }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">创建时间</text>
              <text class="info-value">{{ selectedGoal.createTime }}</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showGoalDetail = false">关闭</view>
          <view class="modal-btn warn" @click="removeGoal(selectedGoal.id)">删除</view>
          <view class="modal-btn confirm" @click="editGoal">编辑</view>
        </view>
      </view>
    </view>

    <!-- 修改参数弹窗：默认隐藏，仅点击"修改参数"按钮或首次模拟时打开；支持滚动 -->
    <view class="modal-overlay" v-if="showProfileModal" @click="closeProfileModal">
      <view class="modal-content large" @click.stop>
        <view class="modal-header">
          <text class="modal-title">AI人生规划</text>
          <text class="modal-close" @click="closeProfileModal">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">年龄</text>
            <input class="form-input" v-model="profileForm.age" placeholder="请输入您的年龄" type="number" />
          </view>
          <view class="form-item">
            <text class="form-label">教育背景</text>
            <view class="radio-group">
              <text :class="['radio-btn', profileForm.education === '本科' ? 'active' : '']" @click="profileForm.education = '本科'">本科</text>
              <text :class="['radio-btn', profileForm.education === '硕士' ? 'active' : '']" @click="profileForm.education = '硕士'">硕士</text>
              <text :class="['radio-btn', profileForm.education === '博士' ? 'active' : '']" @click="profileForm.education = '博士'">博士</text>
              <text :class="['radio-btn', profileForm.education === '大专' ? 'active' : '']" @click="profileForm.education = '大专'">大专</text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">专业</text>
            <input class="form-input" v-model="profileForm.major" placeholder="请输入您的专业" />
          </view>
          <view class="form-item">
            <text class="form-label">职业阶段</text>
            <view class="radio-group">
              <text :class="['radio-btn', profileForm.careerStage === '学生' ? 'active' : '']" @click="profileForm.careerStage = '学生'">学生</text>
              <text :class="['radio-btn', profileForm.careerStage === '应届毕业生' ? 'active' : '']" @click="profileForm.careerStage = '应届毕业生'">应届毕业生</text>
              <text :class="['radio-btn', profileForm.careerStage === '职场新人' ? 'active' : '']" @click="profileForm.careerStage = '职场新人'">职场新人</text>
              <text :class="['radio-btn', profileForm.careerStage === '经验人士' ? 'active' : '']" @click="profileForm.careerStage = '经验人士'">经验人士</text>
              <text :class="['radio-btn', profileForm.careerStage === '创业者' ? 'active' : '']" @click="profileForm.careerStage = '创业者'">创业者</text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">兴趣爱好（最多选5个）</text>
            <view class="interest-group">
              <text :class="['interest-tag', profileForm.interests.includes(item) ? 'active' : '']" v-for="item in interestOptions" :key="item" @click="toggleInterest(item)">{{ item }}</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="closeProfileModal">取消</view>
          <view class="modal-btn confirm" @click="runAISimulation">开始AI分析</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defaultGoals, defaultDailyTasks, simulationTemplates } from '../../data/plans'
import { chat as aiChat, tryParseJson } from '../../utils/aiService'
import * as userContext from '../../utils/userContext'

export default {
  data() {
    return {
      activeTab: 0,
      tabs: ['路径模拟', '目标规划', '每年计划', '每月计划', '每日计划'],
      currentStage: 2,
      currentDate: '',
      timelineData: [] as Array<{ year: string; description: string; milestones: string[] }>,
      showSimulationResult: false,
      completedMilestones: 0,
      targetStatus: '进行中',
      goals: [] as userContext.GoalItem[],
      goalFilter: 'all' as 'all' | 'pending' | 'in_progress' | 'completed' | 'skipped',
      yearlyPlans: [] as userContext.YearlyPlanItem[],
      yearlyPlanFilter: 'all' as 'all' | 'pending' | 'in_progress' | 'completed' | 'skipped',
      monthlyPlans: [] as userContext.MonthlyPlanItem[],
      monthlyPlanFilter: 'all' as 'all' | 'pending' | 'in_progress' | 'completed' | 'skipped',
      monthlyYearFilter: 'all' as string,
      dailyTasks: [] as userContext.DailyTaskItem[],
      showAddGoalModal: false,
      showAddTaskModal: false,
      showAddYearlyModal: false,
      showAddMonthlyModal: false,
      showGoalDetail: false,
      showProfileModal: false,
      selectedGoal: null as userContext.GoalItem | null,
      editingGoal: null as userContext.GoalItem | null,
      goalForm: {
        name: '',
        desc: '',
        deadline: ''
      },
      taskForm: {
        name: '',
        time: ''
      },
      yearlyForm: {
        goalId: '',
        label: '',
        description: ''
      },
      monthlyForm: {
        yearlyPlanId: '',
        goalId: '',
        label: '',
        focus: ''
      },
      profileForm: {
        education: '',
        interests: [] as string[],
        careerStage: '',
        age: '',
        major: ''
      },
      interestOptions: ['编程', '设计', '音乐', '写作', '商业', '艺术', '运动', '旅行', '阅读', '摄影'],
      careerOptions: ['学生', '应届毕业生', '职场新人', '经验人士', '创业者'],
      aiAnalysis: '',
      personalInsight: '',
      savedProfile: null as userContext.UserProfile | null,
      pathConfirmStatus: 'none' as 'none' | 'pending' | 'confirmed' | 'userCustom' | 'noGoal' | 'recommended',
      customGoalText: '',
      planChat: [] as Array<{ role: 'ai' | 'user'; content: string; time: string }>,
      planChatInput: '',
      planChatLoading: false,
      generatingGoals: false,
      generatingYearly: false,
      generatingMonthly: false,
      generatingDaily: false,
      testResultsSummary: ''
    }
  },
  computed: {
    filteredGoals() {
      if (this.goalFilter === 'all') return this.goals
      return this.goals.filter(goal => goal.status === this.goalFilter)
    },
    completedCount() {
      return this.dailyTasks.filter(task => task.completed).length
    },
    dailyProgress() {
      if (this.dailyTasks.length === 0) return 0
      return Math.round((this.completedCount / this.dailyTasks.length) * 100)
    },
    /**
     * 规划年限：根据 timelineData 最后一项的 year 字段动态计算。
     * "现在"→0、"1年后"→1、"5年后"→5，无法识别则返回 5。
     */
    totalYears(): number {
      const list = this.timelineData
      if (!Array.isArray(list) || list.length === 0) return 5
      const last = String(list[list.length - 1].year || '')
      if (last.includes('现在')) return list.length - 1
      const m = last.match(/(\d+)/)
      return m ? Number(m[1]) : 5
    },
    filteredYearlyPlans() {
      let list = this.yearlyPlans
      if (this.yearlyPlanFilter !== 'all') {
        list = list.filter(p => p.status === this.yearlyPlanFilter)
      }
      return list
    },
    filteredMonthlyPlans() {
      let list = this.monthlyPlans
      if (this.monthlyPlanFilter !== 'all') {
        list = list.filter(p => p.status === this.monthlyPlanFilter)
      }
      if (this.monthlyYearFilter !== 'all') {
        list = list.filter(p => String(p.year) === this.monthlyYearFilter)
      }
      return list
    },
    yearFilterOptions() {
      const years = Array.from(new Set(this.yearlyPlans.map(p => p.year)))
      return ['全部', ...years.map(y => `${y}年`)]
    },
  },
  onLoad() {
    this.initDate()
    this.loadSimulationData()
    this.loadProfileFromContext()
    this.loadGoalsFromContext()
    this.loadYearlyPlansFromContext()
    this.loadMonthlyPlansFromContext()
    this.loadDailyTasksFromContext()
    this.loadTestResultsSummary()
    this.loadPlanSummary()
  },
  methods: {
    loadProfileFromContext() {
      const ctx = userContext.loadContext()
      if (ctx.profile) {
        this.profileForm = {
          age: String(ctx.profile.age ?? ''),
          education: ctx.profile.education || '',
          major: ctx.profile.major || '',
          careerStage: ctx.profile.careerStage || '',
          interests: Array.isArray(ctx.profile.interests) ? [...ctx.profile.interests] : []
        }
        this.savedProfile = { ...ctx.profile, interests: [...(ctx.profile.interests || [])] }
      }
    },
    loadGoalsFromContext() {
      const ctx = userContext.loadContext()
      this.goals = ctx.goals || []
    },
    loadYearlyPlansFromContext() {
      const ctx = userContext.loadContext()
      this.yearlyPlans = ctx.yearlyPlans || []
    },
    loadMonthlyPlansFromContext() {
      const ctx = userContext.loadContext()
      this.monthlyPlans = ctx.monthlyPlans || []
    },
    loadDailyTasksFromContext() {
      this.dailyTasks = userContext.getTodayTasks()
      if (this.dailyTasks.length === 0) {
        // 没有今日任务：用 defaultDailyTasks 作 seed
        this.dailyTasks = defaultDailyTasks.map(task => ({
          id: 'seed-' + task.id,
          name: task.name,
          time: task.time,
          completed: false
        }))
      }
    },
    loadTestResultsSummary() {
      const results = userContext.getAllTestResults()
      if (!results.length) {
        this.testResultsSummary = ''
        return
      }
      const parts: string[] = []
      results.forEach(r => {
        parts.push(`${r.testId.toUpperCase()}: ${r.type}`)
      })
      this.testResultsSummary = parts.join('；')
    },
    loadPlanSummary() {
      const ctx = userContext.loadContext()
      if (ctx.planSummary) {
        this.aiAnalysis = ctx.planSummary.aiAnalysis
        this.personalInsight = ctx.planSummary.personalInsight
        this.timelineData = this.convertToTimelineFormat({
          fiveYearPlan: ctx.planSummary.fiveYearPlan
        })
        this.currentStage = Math.max(0, this.timelineData.length - 1)
        this.completedMilestones = this.timelineData.reduce((s, t) => s + (Array.isArray(t.milestones) ? t.milestones.length : 0), 0)
        this.targetStatus = 'AI规划完成'
        this.showSimulationResult = true
        this.pathConfirmStatus = (ctx.planSummary.userChoice as any) || 'pending'
      }
    },
    initDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const day = now.getDate()
      this.currentDate = `${year}年${month}月${day}日`
    },
    loadSimulationData() {
      this.timelineData = simulationTemplates.default.stages
    },
    formatDate(date: Date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    async runSimulation() {
      // 检查是否已经保存了用户参数
      if (!this.savedProfile) {
        uni.showToast({
          title: '请先设置个人参数',
          icon: 'none'
        })
        this.showProfileModal = true
        return
      }

      uni.showLoading({
        title: 'AI正在模拟...'
      })

      const { age, education, major, interests, careerStage } = this.savedProfile
      const recentMoods = userContext.loadContext().recentMoods.slice(-5)
      const moodHint = recentMoods.length
        ? `\n\n用户近期心情记录：${recentMoods.map(m => m.mood).join('、')}。请在建议中适当照顾其情绪状态。`
        : ''

      // 拼入测评结果
      const tests = userContext.getAllTestResults()
      let testHint = ''
      if (tests.length) {
        testHint = '\n\n【用户测评画像】\n'
        tests.forEach(r => {
          const name = ({ mbti: 'MBTI', holland: '霍兰德职业兴趣', intelligence: '多元智能', value: '价值观' } as any)[r.testId] || r.testId
          testHint += `· ${name}：${r.type}（${r.description}）\n`
          if (r.topThree && r.topThree.length) {
            testHint += `  强项：${r.topThree.map(t => t.name).join('、')}\n`
          }
        })
        testHint += '\n请在规划中**充分结合**上述测评画像，让方案贴合用户的性格/兴趣/智能/价值观，而不是套通用模板。'
      }

      const systemPrompt = `你是一名资深人生规划顾问。基于用户的画像${tests.length ? '和测评结果' : ''}，输出严格 JSON（不要任何额外文字、代码块围栏或解释）：
{
  "aiAnalysis": "对用户当前处境的专业分析（200字以内，务必结合测评给出个性化判断）",
  "personalInsight": "个性化洞察（120字以内，温暖务实）",
  "fiveYearPlan": [
    { "year": "现在",   "description": "...", "keyActions": ["...", "..."] },
    { "year": "1年后", "description": "...", "keyActions": ["...", "..."] },
    { "year": "2年后", "description": "...", "keyActions": ["...", "..."] },
    { "year": "3年后", "description": "...", "keyActions": ["...", "..."] },
    { "year": "5年后", "description": "...", "keyActions": ["...", "..."] }
  ]
}
要求：中文；结合用户的专业、兴趣${tests.length ? '和测评结果' : ''}给出可执行建议；keyActions 每条 1 行、动词开头。${moodHint}${testHint}`

      const userMsg = `画像：${age}岁 / ${education} / ${major}专业 / ${careerStage} / 兴趣：${interests.join('、')}`

      const text = await aiChat({
        systemPrompt,
        userMessage: userMsg,
        jsonMode: true,
        maxTokens: 1500,
        temperature: 0.7
      })

      uni.hideLoading()

      if (text) {
        const parsed = tryParseJson<{
          aiAnalysis?: string
          personalInsight?: string
          fiveYearPlan?: Array<{ year: string; description?: string; title?: string; keyActions?: string[] }>
        }>(text)

        if (parsed && parsed.fiveYearPlan) {
          const planSummary = {
            aiAnalysis: parsed.aiAnalysis || '',
            personalInsight: parsed.personalInsight || '',
            fiveYearPlan: parsed.fiveYearPlan.map(s => ({
              year: s.year,
              description: s.description || s.title || '',
              keyActions: Array.isArray(s.keyActions) ? s.keyActions : []
            })),
            userChoice: 'pending' as const
          }
          // 保存到 userContext，供 companion 引用
          userContext.setPlanSummary(planSummary)

          this.aiAnalysis = parsed.aiAnalysis || ''
          this.personalInsight = parsed.personalInsight || ''
          this.timelineData = this.convertToTimelineFormat(parsed)
          this.pathConfirmStatus = 'pending'
          this.planChat = [{
            role: 'ai' as const,
            content: '我已经基于你的画像' + (tests.length ? '和' + tests.length + '项测评结果' : '') + '生成了上面这份 5 年路径模拟。\n\n请告诉我：\n1. ✅ 这个路径符合你内心的个人规划吗？\n2. 如果不符合，你想换成什么目标？',
            time: this.nowStr()
          }]

          this.currentStage = 4
          this.completedMilestones = 15
          this.targetStatus = 'AI规划完成'
          this.showSimulationResult = true

          uni.showToast({ title: '模拟完成', icon: 'success' })
          return
        }
      }

      // AI 调用或解析失败：走本地模拟
      console.warn('[plan] AI 不可用，使用本地模拟')
      this.fallbackToLocalSimulation(age, education, major, interests, careerStage)
    },
    editProfile() {
        this.showProfileModal = true
      },
      closeProfileModal() {
        this.showProfileModal = false
      },
      toggleInterest(interest) {
        const index = this.profileForm.interests.indexOf(interest)
        if (index === -1) {
          if (this.profileForm.interests.length < 5) {
            this.profileForm.interests.push(interest)
          } else {
            uni.showToast({
              title: '最多选择5个兴趣',
              icon: 'none'
            })
          }
        } else {
          this.profileForm.interests.splice(index, 1)
        }
      },
      async runAISimulation() {
        // 表单验证
        if (!this.profileForm.age || isNaN(parseInt(this.profileForm.age)) || parseInt(this.profileForm.age) < 1 || parseInt(this.profileForm.age) > 120) {
          uni.showToast({
            title: '请输入有效年龄（1-120岁）',
            icon: 'none'
          })
          return
        }
        if (!this.profileForm.education) {
          uni.showToast({
            title: '请选择教育背景',
            icon: 'none'
          })
          return
        }
        if (!this.profileForm.major.trim()) {
          uni.showToast({
            title: '请输入您的专业',
            icon: 'none'
          })
          return
        }
        if (!this.profileForm.careerStage) {
          uni.showToast({
            title: '请选择职业阶段',
            icon: 'none'
          })
          return
        }
        if (this.profileForm.interests.length === 0) {
          uni.showToast({
            title: '请选择至少一个兴趣',
            icon: 'none'
          })
          return
        }
        
        // 保存用户参数
        this.savedProfile = {
          age: parseInt(this.profileForm.age),
          education: this.profileForm.education,
          major: this.profileForm.major,
          interests: [...this.profileForm.interests],
          careerStage: this.profileForm.careerStage
        }

        // 同步到共享 userContext，供 companion 引用
        userContext.setProfile(this.savedProfile)

        // 关闭弹窗
        this.showProfileModal = false
        
        uni.showToast({
          title: '参数已保存，请点击开始模拟',
          icon: 'none'
        })
      },
      
      // 生成模拟规划数据
      generateSimulationData(age: number | string, education: string, major: string, interests: string[], careerStage: string) {
        // 根据专业获取行业方向建议
        const getMajorDirection = () => {
          const majorMap = {
            '计算机': '互联网技术、软件开发、人工智能',
            '广告': '品牌营销、创意策划、数字广告、内容创作',
            '金融': '投资分析、风险管理、金融科技',
            '医学': '临床医疗、医学研究、健康管理',
            '教育': '教学研究、教育管理、在线教育',
            '设计': '视觉设计、产品设计、UI/UX设计',
            '心理学': '心理咨询、用户研究、人力资源',
            '商业': '企业管理、市场营销、战略规划'
          }
          return majorMap[major] || '专业领域发展'
        }
        
        // 根据年龄计算职业阶段进度
        const getCareerProgress = () => {
          if (age < 22) return '成长阶段'
          if (age < 28) return '积累阶段'
          if (age < 35) return '上升阶段'
          if (age < 45) return '成熟阶段'
          return '巅峰阶段'
        }
        
        // 根据教育背景获取建议
        const getEducationAdvice = () => {
          const adviceMap = {
            '大专': '注重实践技能培养，成为技术蓝领中的精英',
            '本科': '夯实理论基础，积极参与实习项目',
            '硕士': '深入研究专业领域，发表学术成果',
            '博士': '专注科研创新，成为行业权威专家'
          }
          return adviceMap[education] || '持续学习，不断提升'
        }
        
        // 根据职业阶段获取发展重点
        const getStageFocus = () => {
          const focusMap = {
            '学生': '学业成绩优异，积累知识储备，参与社团活动',
            '应届毕业生': '制作简历作品集，参加校招，积累面试经验',
            '职场新人': '快速适应企业文化，掌握工作技能，建立职业人脉',
            '经验人士': '深耕专业领域，争取晋升机会，拓展行业资源',
            '创业者': '市场调研分析，组建核心团队，获取创业资金'
          }
          return focusMap[careerStage] || '稳步推进职业发展'
        }
        
        // 根据兴趣获取发展方向
        const getInterestDirections = () => {
          const directionMap = {
            '编程': ['学习主流编程语言', '参与开源项目', '开发个人作品'],
            '设计': ['学习设计软件', '打造个人作品集', '参加设计比赛'],
            '音乐': ['学习乐器/声乐', '创作原创音乐', '发布音乐作品'],
            '写作': ['坚持写作练习', '开设个人博客', '出版个人作品'],
            '商业': ['学习商业知识', '参与创业比赛', '积累商业人脉'],
            '艺术': ['持续创作练习', '举办个人展览', '加入艺术社群'],
            '运动': ['专业训练提升', '参加各类赛事', '获取相关认证'],
            '旅行': ['规划旅行路线', '记录旅行故事', '打造旅行IP'],
            '阅读': ['制定阅读计划', '分享读书心得', '建立知识体系'],
            '摄影': ['学习摄影技术', '积累摄影作品', '参加摄影展览']
          }
          const directions = []
          interests.forEach(interest => {
            if (directionMap[interest]) {
              directions.push(...directionMap[interest].slice(0, 2))
            }
          })
          return directions.slice(0, 4)
        }
        
        // 根据专业和职业阶段生成个性化里程碑
        const generateMilestones = (yearOffset) => {
          // 广告专业特定里程碑
          const adMilestones = {
            0: ['分析行业趋势', '建立创意素材库', '学习营销工具'],
            1: ['独立负责小型campaign', '建立行业人脉', '获得客户认可'],
            2: ['主导品牌全案策划', '拓展优质客户', '提升创意能力'],
            3: ['成为资深策划/创意总监', '打造成功案例', '行业影响力'],
            5: ['创立广告公司/工作室', '服务知名品牌', '行业领军人物']
          }
          
          // 通用里程碑
          const baseMilestones = {
            0: {
              '学生': ['制定学习计划', '参加专业课程', '建立学习小组'],
              '应届毕业生': ['完善简历作品集', '投递广告公司', '准备面试'],
              '职场新人': ['熟悉公司业务', '掌握策划流程', '建立同事关系'],
              '经验人士': ['评估职业现状', '设定新目标', '拓展行业人脉'],
              '创业者': ['市场调研', '商业计划书', '寻找合伙人']
            },
            1: {
              '学生': ['获取奖学金', '参与广告比赛', '发表论文'],
              '应届毕业生': ['获得offer', '入职培训', '适应工作'],
              '职场新人': ['独立负责项目', '获得绩效好评', '晋升机会'],
              '经验人士': ['担任管理岗位', '拓展业务范围', '行业影响力'],
              '创业者': ['服务首批客户', '积累案例', '客户增长']
            },
            2: {
              '学生': ['完成毕业论文', '获得学位', '规划职业方向'],
              '应届毕业生': ['独立负责项目', '积累项目经验', '职业晋升'],
              '职场新人': ['成为业务骨干', '带领小团队', '专业认证'],
              '经验人士': ['成为部门负责人', '行业专家', '培养团队'],
              '创业者': ['团队扩张', '市场拓展', '品牌建设']
            },
            3: {
              '学生': ['深造或就业', '开启广告生涯', '独立生活'],
              '应届毕业生': ['职业转型或晋升', '专业技能提升', '薪资增长'],
              '职场新人': ['管理岗位', '行业影响力', '职业突破'],
              '经验人士': ['高管职位', '创业或投资', '回馈社会'],
              '创业者': ['规模化发展', '行业认可', '品牌升级']
            },
            5: {
              '学生': ['成为行业骨干', '职业稳定发展', '实现财务独立'],
              '应届毕业生': ['成为中层管理者', '行业资深专家', '事业有成'],
              '职场新人': ['高级管理岗位', '行业权威', '人生规划'],
              '经验人士': ['事业巅峰', '财富自由', '社会贡献'],
              '创业者': ['成为行业领军', '多元化发展', '人生新阶段']
            }
          }
          
          // 如果是广告专业，使用广告特定里程碑
          if (major === '广告') {
            return adMilestones[yearOffset] || ['持续发展', '自我提升', '目标达成']
          }
          
          return baseMilestones[yearOffset]?.[careerStage] || ['持续发展', '自我提升', '目标达成']
        }
        
        const progress = getCareerProgress()
        const educationAdvice = getEducationAdvice()
        const stageFocus = getStageFocus()
        const interestDirections = getInterestDirections().join('、')
        const majorDirection = getMajorDirection()
        
        return [
          {
            year: '现在',
            description: `${age}岁，${education}学历，${major}专业。当前处于${progress}，${stageFocus}。兴趣爱好：${interests.join('、')}。建议发展方向：${majorDirection}`,
            milestones: generateMilestones(0)
          },
          {
            year: '1年后',
            description: `${age + 1}岁，${educationAdvice}。结合兴趣发展：${interestDirections}`,
            milestones: generateMilestones(1)
          },
          {
            year: '2年后',
            description: `${age + 2}岁，在${major}领域深耕细作，积累专业经验，拓展职业边界。预计可独立负责项目`,
            milestones: generateMilestones(2)
          },
          {
            year: '3年后',
            description: `${age + 3}岁，${careerStage === '学生' ? '学业深造完成，开启职业新篇章' : '职业发展取得突破，迈向更高台阶'}。目标：成为${major}领域骨干`,
            milestones: generateMilestones(3)
          },
          {
            year: '5年后',
            description: `${age + 5}岁，成为${major}领域的中坚力量，实现阶段性人生目标。结合您的兴趣${interests.join('、')}，打造独特的职业竞争力`,
            milestones: generateMilestones(5)
          }
        ]
      },
      getStatusText(status: string) {
      const statusMap: Record<string, string> = {
        completed: '已完成',
        in_progress: '进行中',
        pending: '待开始',
        skipped: '已跳过'
      }
      return statusMap[status] || status
    },
    getGoalName(goalId: string): string {
      const goal = this.goals.find(g => g.id === goalId)
      return goal ? goal.name : '未知目标'
    },
      convertToTimelineFormat(data: any) {
        const timeline: Array<{ year: string; description: string; milestones: string[] }> = []
        
        // 处理5年规划（云函数返回的是数组格式）
        if (data.fiveYearPlan && Array.isArray(data.fiveYearPlan)) {
          // 第1年 - 现在
          const year1 = data.fiveYearPlan[0]
          timeline.push({
            year: '现在',
            description: year1?.description || year1?.title || '从现在开始，开启您的职业规划之旅',
            milestones: year1?.keyActions ? year1.keyActions.map((action, idx) => `• ${action}`) : []
          })
          
          // 第2年 - 1年后
          const year2 = data.fiveYearPlan[1]
          timeline.push({
            year: '1年后',
            description: year2?.description || year2?.title || '一年后，初步实现职业转型',
            milestones: year2?.keyActions ? year2.keyActions.map((action, idx) => `• ${action}`) : []
          })
          
          // 第3年 - 2年后
          const year3 = data.fiveYearPlan[2]
          timeline.push({
            year: '2年后',
            description: year3?.description || year3?.title || '两年后，在专业领域站稳脚跟',
            milestones: year3?.keyActions ? year3.keyActions.map((action, idx) => `• ${action}`) : []
          })
          
          // 第4年 - 3年后
          const year4 = data.fiveYearPlan[3]
          timeline.push({
            year: '3年后',
            description: year4?.description || year4?.title || '三年后，职业发展取得突破',
            milestones: year4?.keyActions ? year4.keyActions.map((action, idx) => `• ${action}`) : []
          })
          
          // 第5年 - 5年后
          const year5 = data.fiveYearPlan[4]
          timeline.push({
            year: '5年后',
            description: year5?.description || year5?.title || '五年后，实现阶段性人生目标',
            milestones: year5?.keyActions ? year5.keyActions.map((action, idx) => `• ${action}`) : []
          })
        }
        
        return timeline.length > 0 ? timeline : this.generateSimulationData(
          this.profileForm.age,
          this.profileForm.education,
          this.profileForm.major,
          this.profileForm.interests,
          this.profileForm.careerStage
        )
      },
      // 云函数调用失败时的本地模拟备用方案
      fallbackToLocalSimulation(age: number | string, education: string, major: string, interests: string[], careerStage: string) {
        uni.hideLoading()
        uni.showToast({
          title: '网络异常，使用本地分析',
          icon: 'none'
        })

        // 使用本地模拟生成规划数据
        this.timelineData = this.generateSimulationData(age, education, major, interests, careerStage)

        this.currentStage = Math.max(0, this.timelineData.length - 1)
        this.completedMilestones = this.timelineData.reduce((s, t) => s + (Array.isArray(t.milestones) ? t.milestones.length : 0), 0)
        this.targetStatus = 'AI规划完成'
        this.showSimulationResult = true
        this.showProfileModal = false
        this.pathConfirmStatus = 'pending'
        this.planChat = [{
          role: 'ai' as const,
          content: '已为你生成本地版路径模拟（AI 暂时不可用）。请告诉我：\n1. ✅ 这个路径符合你内心的个人规划吗？\n2. 如果不符合，你想换成什么目标？',
          time: this.nowStr()
        }]
      },
    // ============ 新增：路径确认三步流程 ============
    nowStr() {
      const d = new Date()
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    },
    /**
     * 路径确认分支一：用户认为路径符合个人规划
     */
    confirmPathMatches() {
      this.pathConfirmStatus = 'confirmed'
      const ctx = userContext.loadContext()
      if (ctx.planSummary) {
        userContext.setPlanSummary({ ...ctx.planSummary, userChoice: 'confirmed' })
      }
      this.planChat.push({
        role: 'user' as const,
        content: '✅ 这个路径符合我的个人规划',
        time: this.nowStr()
      })
      this.planChat.push({
        role: 'ai' as const,
        content: '太好了！那我们就在这个路径上推进。\n\n我马上基于这个 5 年规划为你生成【目标规划】。完成后切到「目标规划」tab 即可看到。',
        time: this.nowStr()
      })
      uni.showToast({ title: '路径已确认', icon: 'success' })
      // 立即开始生成目标
      this.generateGoals('基于已确认的 5 年路径模拟，输出 5-7 个可量化的目标。')
    },
    /**
     * 路径确认分支二：用户有不同的想法
     */
    confirmPathDifferent() {
      this.pathConfirmStatus = 'userCustom'
      this.planChat.push({
        role: 'user' as const,
        content: '💬 我有不同的想法',
        time: this.nowStr()
      })
      this.planChat.push({
        role: 'ai' as const,
        content: '好的～ 那你心里具体的目标或规划是什么？\n\n比如：想去的行业、想达成的具体成绩、3-5 年后的状态……描述得越具体越好。',
        time: this.nowStr()
      })
    },
    /**
     * 路径确认分支三：用户没有目标
     */
    confirmPathNoGoal() {
      this.pathConfirmStatus = 'noGoal'
      this.planChat.push({
        role: 'user' as const,
        content: '🤔 我暂时没有具体目标',
        time: this.nowStr()
      })
      this.planChat.push({
        role: 'ai' as const,
        content: '没问题～ 我会基于你的画像、测评结果和近期心情，给你推荐 5-7 个适合你现阶段的目标。你可以挑喜欢的勾选，也可以全部接受。',
        time: this.nowStr()
      })
      // 立即基于画像+测评推荐目标
      this.generateGoals('用户暂时没有明确目标，请你结合他的画像、测评结果和近期心情，推荐 5-7 个他现阶段最值得去做的目标。')
    },
    /**
     * 用户提交了自定义目标文字：分析可行性
     */
    async submitCustomGoal() {
      const text = (this.customGoalText || '').trim()
      if (!text) {
        uni.showToast({ title: '请先输入你的目标', icon: 'none' })
        return
      }
      this.planChat.push({
        role: 'user' as const,
        content: text,
        time: this.nowStr()
      })
      this.customGoalText = ''

      // 调 AI 分析可行性，然后直接生成目标
      this.planChatLoading = true
      try {
        const ctx = userContext.loadContext()
        const sys = '你是一名务实的职业规划师。用户给了一个具体目标，请用 1-2 段话（150字内）评估其可行性和落地路径。结尾给一句鼓励。不要返回 JSON。'
        const usr = `用户画像：${JSON.stringify(ctx.profile)}\n测评：${this.testResultsSummary || '无'}\n用户目标：${text}`
        const reply = await aiChat({ systemPrompt: sys, userMessage: usr, temperature: 0.7, maxTokens: 400 })
        this.planChat.push({
          role: 'ai' as const,
          content: reply || '这个目标我可以帮你拆解～ 我马上为你生成具体的目标规划。',
          time: this.nowStr()
        })
      } catch (e) {
        console.warn(e)
      } finally {
        this.planChatLoading = false
      }

      // 把用户目标写入 planSummary.userCustomGoal
      const ctx = userContext.loadContext()
      if (ctx.planSummary) {
        userContext.setPlanSummary({ ...ctx.planSummary, userCustomGoal: text, userChoice: 'userCustom' })
      }
      this.pathConfirmStatus = 'userCustom'

      // 立即基于用户目标生成
      setTimeout(() => this.generateGoals(`用户自定义的目标："${text}"。请基于这个目标为他拆解 5-7 个可量化的子目标。`), 600)
    },
    /**
     * AI 沟通区用户输入：自由对话（兜底）
     */
    async sendPlanChat() {
      const text = (this.planChatInput || '').trim()
      if (!text) return
      this.planChat.push({ role: 'user' as const, content: text, time: this.nowStr() })
      this.planChatInput = ''
      this.planChatLoading = true
      try {
        const ctx = userContext.loadContext()
        const sys = '你是 Lume 规划助手。结合用户画像、测评结果、当前路径模拟，简短（120字内）回答用户关于规划的疑问。'
        const usr = `画像：${JSON.stringify(ctx.profile)}\n测评：${this.testResultsSummary || '无'}\n当前路径：${this.aiAnalysis}\n用户问题：${text}`
        const reply = await aiChat({ systemPrompt: sys, userMessage: usr, temperature: 0.7, maxTokens: 300 })
        this.planChat.push({ role: 'ai' as const, content: reply || '我们一步步来，先确认路径再细化目标～', time: this.nowStr() })
      } catch (e) {
        console.warn(e)
      } finally {
        this.planChatLoading = false
      }
    },
    /**
     * 生成目标规划：根据 hint 调 AI
     */
    async generateGoals(hint: string) {
      if (this.generatingGoals) return
      this.generatingGoals = true
      uni.showLoading({ title: 'AI 生成目标中...' })
      try {
        const ctx = userContext.loadContext()
        const sys = `你是一名资深职业规划师。${hint}\n\n请基于以下信息，输出严格 JSON（不要任何额外文字、代码块围栏或解释）：
{
  "goals": [
    { "name": "目标名", "desc": "具体可量化的描述（60字内）", "planYear": "现在" | "1年后" | ..., "deadlineMonths": 3 | 6 | 12 }
  ]
}
要求：中文；3-7 个目标；覆盖短中长期；动词开头；尽量贴用户最近一次规划方向。`
        const usr = `画像：${JSON.stringify(ctx.profile)}\n测评：${this.testResultsSummary || '无'}\n当前路径分析：${this.aiAnalysis || '无'}`
        const text = await aiChat({ systemPrompt: sys, userMessage: usr, jsonMode: true, temperature: 0.7, maxTokens: 1000 })
        const parsed = tryParseJson<{ goals?: Array<{ name: string; desc?: string; planYear?: string; deadlineMonths?: number }> }>(text)
        if (parsed && Array.isArray(parsed.goals) && parsed.goals.length) {
          // 保留用户手动加的、移除 AI 已生成的旧目标
          const manualGoals = this.goals.filter(g => !g.fromAI)
          const now = new Date()
          const aiGoals: userContext.GoalItem[] = parsed.goals.map((g, i) => {
            const months = Math.max(1, Math.min(60, g.deadlineMonths || 6))
            const d = new Date(now.getTime() + months * 30 * 86400000)
            return {
              id: 'aig-' + Date.now() + '-' + i,
              name: g.name,
              desc: g.desc || '',
              progress: 0,
              deadline: d.toISOString().slice(0, 10),
              status: 'pending',
              createTime: this.formatDate(now),
              planYear: g.planYear,
              fromAI: true
            }
          })
          this.goals = [...aiGoals, ...manualGoals]
          userContext.setGoals(this.goals)
          this.planChat.push({
            role: 'ai' as const,
            content: `已为你生成 ${aiGoals.length} 个目标，切到「目标规划」tab 即可查看和调整。`,
            time: this.nowStr()
          })
          uni.showToast({ title: '目标已生成', icon: 'success' })
        } else {
          uni.showToast({ title: 'AI 未返回目标，请稍后再试', icon: 'none' })
        }
      } catch (e) {
        console.warn('[plan] generateGoals failed:', e)
        uni.showToast({ title: '生成失败', icon: 'none' })
      } finally {
        this.generatingGoals = false
        uni.hideLoading()
      }
    },
    /**
     * 生成今日计划：基于当前已选目标，输出 4-6 条今日可执行任务
     */
    async generateDailyPlan() {
      if (this.generatingDaily) return
      if (!this.goals || this.goals.length === 0) {
        uni.showToast({ title: '请先制定目标规划', icon: 'none' })
        return
      }
      this.generatingDaily = true
      uni.showLoading({ title: 'AI 生成今日计划中...' })
      try {
        const ctx = userContext.loadContext()
        const today = new Date()
        const currMonth = today.getMonth() + 1
        const currYear = today.getFullYear()

        // 筛选当前月未完成的月计划（用于 AI 生成）
        const relatedMonthly = this.monthlyPlans.filter(m =>
          m.month === currMonth &&
          m.status !== 'skipped' &&
          m.status !== 'completed'
        )
        const activeGoals = this.goals.filter(g => g.status !== 'completed').slice(0, 6)

        const sys = `你是一名时间管理教练。基于用户已制定的目标和月计划，为他规划今天的可执行任务。

请输出严格 JSON（不要任何额外文字、代码块围栏或解释）：
{
  "tasks": [
    { "name": "任务名", "time": "HH:MM", "monthlyIndex": 0 }
  ]
}
要求：中文；4-6 条任务；时间分布在 8:00-22:00；每条 30 分钟以内可完成；尽量分散在不同月计划；动词开头。
monthlyIndex 是月计划列表的序号（从 0 开始）。`

        let usr = ''
        if (relatedMonthly.length > 0) {
          usr = `画像：${JSON.stringify(ctx.profile)}\n测评：${this.testResultsSummary || '无'}\n\n当前月计划列表（请用 monthlyIndex 对应）：
${relatedMonthly.map((m, i) => `${i}. ${m.label}（${m.year}年，目标：${this.getGoalName(m.goalId)}）：${m.focus}`).join('\n')}

请为今天生成对应任务。`
        } else {
          usr = `画像：${JSON.stringify(ctx.profile)}\n测评：${this.testResultsSummary || '无'}\n当前目标：
${activeGoals.map((g, i) => `${i}. ${g.name} - ${g.desc} (截止 ${g.deadline})`).join('\n')}

请为今天生成任务。`
        }

        const text = await aiChat({ systemPrompt: sys, userMessage: usr, jsonMode: true, temperature: 0.7, maxTokens: 700 })
        const parsed = tryParseJson<{ tasks?: Array<{ name: string; time: string; monthlyIndex?: number; goalIndex?: number }> }>(text)

        if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length) {
          const tasks: userContext.DailyTaskItem[] = parsed.tasks.map((t, i) => {
            let goalId: string | undefined
            let monthlyPlanId: string | undefined
            let yearlyPlanId: string | undefined

            // 优先用 monthlyIndex 匹配
            if (typeof t.monthlyIndex === 'number' && relatedMonthly[t.monthlyIndex]) {
              const mp = relatedMonthly[t.monthlyIndex]
              monthlyPlanId = mp.id
              yearlyPlanId = mp.yearlyPlanId
              goalId = mp.goalId
            }
            // 其次用 goalIndex 匹配
            else if (typeof t.goalIndex === 'number' && activeGoals[t.goalIndex]) {
              goalId = activeGoals[t.goalIndex].id
              // 尝试自动匹配当前月的月计划
              const autoMp = this.monthlyPlans.find(m =>
                m.goalId === goalId &&
                m.year === currYear &&
                m.month === currMonth &&
                m.status !== 'skipped'
              )
              if (autoMp) {
                monthlyPlanId = autoMp.id
                yearlyPlanId = autoMp.yearlyPlanId
              }
            }

            return {
              id: 'd-' + Date.now() + '-' + i,
              name: t.name,
              time: t.time || '09:00',
              completed: false,
              goalId,
              yearlyPlanId,
              monthlyPlanId
            }
          })
          userContext.setTodayTasks(tasks)
          this.dailyTasks = tasks
          uni.showToast({ title: '今日计划已生成', icon: 'success' })
        } else {
          // AI 失败兜底
          const fallbackTasks = this.generateDailyPlanFallback(activeGoals, relatedMonthly, currYear, currMonth)
          userContext.setTodayTasks(fallbackTasks)
          this.dailyTasks = fallbackTasks
          uni.showToast({ title: '今日计划已生成', icon: 'success' })
        }
      } catch (e) {
        console.warn('[plan] generateDailyPlan failed:', e)
        // 出错也走兜底
        const activeGoals = this.goals.filter(g => g.status !== 'completed').slice(0, 6)
        const today = new Date()
        const relatedMonthly = this.monthlyPlans.filter(m => m.month === today.getMonth() + 1 && m.status !== 'skipped' && m.status !== 'completed')
        const fallbackTasks = this.generateDailyPlanFallback(activeGoals, relatedMonthly, today.getFullYear(), today.getMonth() + 1)
        userContext.setTodayTasks(fallbackTasks)
        this.dailyTasks = fallbackTasks
        uni.showToast({ title: '今日计划已生成', icon: 'success' })
      } finally {
        this.generatingDaily = false
        uni.hideLoading()
      }
    },
    generateDailyPlanFallback(
      goals: userContext.GoalItem[],
      monthlyPlans: userContext.MonthlyPlanItem[],
      currYear: number,
      currMonth: number
    ): userContext.DailyTaskItem[] {
      const tasks: userContext.DailyTaskItem[] = []
      const now = new Date()
      const timeSlots = ['09:00', '11:00', '14:00', '16:00', '18:00', '20:00']
      // 如果有月计划，基于月计划生成
      if (monthlyPlans.length > 0) {
        for (let i = 0; i < Math.min(5, monthlyPlans.length); i++) {
          const mp = monthlyPlans[i % monthlyPlans.length]
          tasks.push({
            id: 'd-fb-' + now.getTime() + '-' + i,
            name: `推进「${mp.label}」计划：${mp.focus.slice(0, 15)}`,
            time: timeSlots[i % timeSlots.length],
            completed: false,
            goalId: mp.goalId,
            yearlyPlanId: mp.yearlyPlanId,
            monthlyPlanId: mp.id
          })
        }
      } else {
        // 没有月计划，基于目标生成
        for (let i = 0; i < Math.min(5, goals.length); i++) {
          const g = goals[i]
          tasks.push({
            id: 'd-fb-' + now.getTime() + '-' + i,
            name: `推进「${g.name}」目标`,
            time: timeSlots[i % timeSlots.length],
            completed: false,
            goalId: g.id
          })
        }
      }
      return tasks
    },
    /**
     * 重新跑一次 AI 路径模拟（用户改变主意）
     */
    rerunSimulation() {
      this.pathConfirmStatus = 'none'
      this.planChat = []
      this.runSimulation()
    },
    viewGoalDetail(goal: userContext.GoalItem) {
      this.selectedGoal = goal
      this.showGoalDetail = true
    },
    editGoal() {
      if (this.selectedGoal) {
        this.editingGoal = this.selectedGoal
        this.goalForm = {
          name: this.selectedGoal.name,
          desc: this.selectedGoal.desc,
          deadline: this.selectedGoal.deadline
        }
        this.showGoalDetail = false
        this.showAddGoalModal = true
      }
    },
    closeAddGoalModal() {
      this.showAddGoalModal = false
      this.editingGoal = null
      this.goalForm = { name: '', desc: '', deadline: '' }
    },
    saveGoal() {
      if (!this.goalForm.name.trim()) {
        uni.showToast({
          title: '请输入目标名称',
          icon: 'none'
        })
        return
      }

      if (this.editingGoal) {
        const updated: userContext.GoalItem = {
          ...this.editingGoal,
          name: this.goalForm.name,
          desc: this.goalForm.desc,
          deadline: this.goalForm.deadline || this.editingGoal.deadline
        }
        userContext.upsertGoal(updated)
        const idx = this.goals.findIndex(g => g.id === this.editingGoal.id)
        if (idx !== -1) this.goals.splice(idx, 1, updated)
        uni.showToast({ title: '修改成功', icon: 'success' })
      } else {
        const newGoal: userContext.GoalItem = {
          id: 'g-' + Date.now(),
          name: this.goalForm.name,
          desc: this.goalForm.desc,
          progress: 0,
          deadline: this.goalForm.deadline || '2099-12-31',
          status: 'pending',
          createTime: this.formatDate(new Date()),
          fromAI: false
        }
        userContext.upsertGoal(newGoal)
        this.goals.unshift(newGoal)
        uni.showToast({ title: '添加成功', icon: 'success' })
      }

      this.closeAddGoalModal()
    },
    removeGoal(goalId: string) {
      userContext.removeGoal(goalId)
      this.goals = this.goals.filter(g => g.id !== goalId)
      this.showGoalDetail = false
      uni.showToast({ title: '已删除', icon: 'success' })
    },
    onDeadlineChange(e: { detail: { value: string } }) {
      this.goalForm.deadline = e.detail.value
    },
    toggleTask(index: number) {
      const task = this.dailyTasks[index]
      if (!task) return
      // 乐观更新 UI
      this.dailyTasks[index] = { ...task, completed: !task.completed }
      // 持久化（用 userContext）
      const updated = userContext.toggleTodayTask(task.id)
      if (updated.dailyTasks && updated.dailyTasks.tasks.length) {
        this.dailyTasks = updated.dailyTasks.tasks
      }
      // ====== 四层级联更新 ======
      this.cascadeProgress(this.dailyTasks[index])
      // 全部完成时给一个鼓励
      if (this.dailyTasks.every(t => t.completed) && this.dailyTasks.length > 0) {
        uni.showToast({ title: '🎉 今日计划全部完成！', icon: 'success' })
      }
    },

    /**
     * ============================================================
     * 核心方法：四层级联进度更新
     * 每日任务勾选 → 月计划 → 年计划 → 目标
     * ============================================================
     */
    cascadeProgress(task: userContext.DailyTaskItem) {
      let monthlyPlanId = task.monthlyPlanId
      // 如果任务没有关联月计划，但有关联目标，尝试自动匹配当前月的月计划
      if (!monthlyPlanId && task.goalId) {
        const matched = this.autoLinkTaskToMonthlyPlan(task)
        if (matched) {
          monthlyPlanId = matched.monthlyPlanId
          // 更新任务的关联信息
          const idx = this.dailyTasks.findIndex(t => t.id === task.id)
          if (idx >= 0) {
            this.dailyTasks[idx] = { ...this.dailyTasks[idx], monthlyPlanId: matched.monthlyPlanId, yearlyPlanId: matched.yearlyPlanId }
            userContext.setTodayTasks(this.dailyTasks)
          }
        }
      }
      // 走月计划级联路径
      if (monthlyPlanId) {
        this.recalcMonthlyProgress(monthlyPlanId)
      } else if (task.goalId) {
        // 只有当目标完全没有年计划时，才直接从每日任务计算目标进度
        const hasYearlyPlans = this.yearlyPlans.some(p => p.goalId === task.goalId && p.status !== 'skipped')
        if (!hasYearlyPlans) {
          this.recalcGoalProgressFromTasks(task.goalId)
        }
      }
    },

    /** 自动将任务匹配到对应目标、当前年月的月计划 */
    autoLinkTaskToMonthlyPlan(task: userContext.DailyTaskItem): { monthlyPlanId: string; yearlyPlanId: string } | null {
      if (!task.goalId) return null
      const now = new Date()
      const currYear = now.getFullYear()
      const currMonth = now.getMonth() + 1
      // 找到该目标、当前年月的月计划
      const mp = this.monthlyPlans.find(p =>
        p.goalId === task.goalId &&
        p.year === currYear &&
        p.month === currMonth &&
        p.status !== 'skipped'
      )
      if (mp) return { monthlyPlanId: mp.id, yearlyPlanId: mp.yearlyPlanId }
      // 如果当前年没有，找最近一年的同月
      const altMp = this.monthlyPlans.find(p => p.goalId === task.goalId && p.month === currMonth && p.status !== 'skipped')
      if (altMp) return { monthlyPlanId: altMp.id, yearlyPlanId: altMp.yearlyPlanId }
      return null
    },

    /** 重算月计划进度 → 触发年计划 → 触发目标
     * 月进度 = 当月每天完成率的累计和 / 当月总天数
     * 比如7月有31天，今天全完成了，进度 = 100/31 ≈ 3%
     */
    recalcMonthlyProgress(monthlyPlanId: string) {
      const mp = this.monthlyPlans.find(p => p.id === monthlyPlanId)
      if (!mp || mp.completedManually || mp.status === 'skipped') return
      const now = new Date()
      const todayStr = this.formatDateKey(now)
      // 计算今天该月计划任务的完成率
      const relatedTasks = this.dailyTasks.filter(t => t.monthlyPlanId === monthlyPlanId)
      const todayRate = relatedTasks.length > 0
        ? Math.round((relatedTasks.filter(t => t.completed).length / relatedTasks.length) * 100)
        : 0
      // 更新今日完成率记录
      if (!mp.dailyCompletions) mp.dailyCompletions = {}
      mp.dailyCompletions[todayStr] = todayRate
      // 计算当月总天数
      const daysInMonth = new Date(mp.year, mp.month, 0).getDate()
      // 计算累计完成率之和
      const recordedDays = Object.keys(mp.dailyCompletions).filter(d => {
        const [y, m] = d.split('-').map(Number)
        return y === mp.year && m === mp.month
      })
      const totalRate = recordedDays.reduce((s, d) => s + (mp.dailyCompletions![d] || 0), 0)
      // 月进度 = 累计完成率 / 当月总天数（上限100）
      mp.progress = Math.min(100, Math.round(totalRate / daysInMonth))
      mp.status = mp.progress === 100 ? 'completed' : mp.progress > 0 ? 'in_progress' : 'pending'
      userContext.upsertMonthlyPlan(mp)
      this.monthlyPlans = [...this.monthlyPlans]
      // 级联到年计划
      if (mp.yearlyPlanId) this.recalcYearlyProgress(mp.yearlyPlanId)
    },
    /** 格式化日期为 YYYY-MM-DD */
    formatDateKey(date: Date): string {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },

    /** 重算年计划进度 → 触发目标 */
    recalcYearlyProgress(yearlyPlanId: string) {
      const yp = this.yearlyPlans.find(p => p.id === yearlyPlanId)
      if (!yp || yp.completedManually || yp.status === 'skipped') return
      const children = this.monthlyPlans.filter(p => p.yearlyPlanId === yearlyPlanId && p.status !== 'skipped')
      if (children.length === 0) return
      const avg = children.reduce((s, c) => s + c.progress, 0) / children.length
      yp.progress = Math.round(avg)
      const allDone = children.every(c => c.status === 'completed')
      const anyProgress = children.some(c => c.progress > 0)
      yp.status = allDone ? 'completed' : anyProgress ? 'in_progress' : 'pending'
      userContext.upsertYearlyPlan(yp)
      this.yearlyPlans = [...this.yearlyPlans]
      // 级联到目标
      if (yp.goalId) this.recalcGoalProgress(yp.goalId)
    },

    /** 重算目标进度 */
    recalcGoalProgress(goalId: string) {
      const goal = this.goals.find(g => g.id === goalId)
      if (!goal || goal.completedManually || goal.status === 'skipped') return
      const children = this.yearlyPlans.filter(p => p.goalId === goalId && p.status !== 'skipped')
      if (children.length === 0) {
        // 如果目标没有年计划，回退到直接从每日任务计算
        this.recalcGoalProgressFromTasks(goalId)
        return
      }
      const avg = children.reduce((s, c) => s + c.progress, 0) / children.length
      goal.progress = Math.round(avg)
      const allDone = children.every(c => c.status === 'completed')
      const anyProgress = children.some(c => c.progress > 0)
      goal.status = allDone ? 'completed' : anyProgress ? 'in_progress' : 'pending'
      userContext.upsertGoal(goal)
      this.goals = [...this.goals]
    },

    /** 回退方法：直接从每日任务计算目标进度（当目标没有年/月计划时） */
    recalcGoalProgressFromTasks(goalId: string) {
      const goal = this.goals.find(g => g.id === goalId)
      if (!goal || goal.completedManually || goal.status === 'skipped') return
      const related = this.dailyTasks.filter(t => t.goalId === goalId)
      if (related.length === 0) return
      const done = related.filter(t => t.completed).length
      goal.progress = Math.round((done / related.length) * 100)
      goal.status = goal.progress === 100 ? 'completed' : goal.progress > 0 ? 'in_progress' : 'pending'
      userContext.upsertGoal(goal)
      this.goals = [...this.goals]
    },

    // ============================================================
    // 每年计划：手动完成 / 跳过 / 恢复
    // ============================================================

    markYearlyComplete(plan: userContext.YearlyPlanItem) {
      plan.status = 'completed'
      plan.completedManually = true
      plan.progress = 100
      userContext.upsertYearlyPlan(plan)
      this.yearlyPlans = [...this.yearlyPlans]
      if (plan.goalId) this.recalcGoalProgress(plan.goalId)
      uni.showToast({ title: '已标记为完成', icon: 'success' })
    },

    skipYearlyPlan(plan: userContext.YearlyPlanItem) {
      plan.status = 'skipped'
      plan.completedManually = false
      userContext.upsertYearlyPlan(plan)
      this.yearlyPlans = [...this.yearlyPlans]
      if (plan.goalId) this.recalcGoalProgress(plan.goalId)
      uni.showToast({ title: '已跳过，不参与目标进度计算', icon: 'none' })
    },

    undoYearlyPlan(plan: userContext.YearlyPlanItem) {
      plan.status = 'pending'
      plan.completedManually = false
      plan.progress = 0
      userContext.upsertYearlyPlan(plan)
      this.yearlyPlans = [...this.yearlyPlans]
      if (plan.goalId) this.recalcGoalProgress(plan.goalId)
      uni.showToast({ title: '已恢复', icon: 'none' })
    },

    // ============================================================
    // 每月计划：手动完成 / 跳过 / 恢复
    // ============================================================

    markMonthlyComplete(plan: userContext.MonthlyPlanItem) {
      plan.status = 'completed'
      plan.completedManually = true
      plan.progress = 100
      userContext.upsertMonthlyPlan(plan)
      this.monthlyPlans = [...this.monthlyPlans]
      if (plan.yearlyPlanId) this.recalcYearlyProgress(plan.yearlyPlanId)
      uni.showToast({ title: '已标记为完成', icon: 'success' })
    },

    skipMonthlyPlan(plan: userContext.MonthlyPlanItem) {
      plan.status = 'skipped'
      plan.completedManually = false
      userContext.upsertMonthlyPlan(plan)
      this.monthlyPlans = [...this.monthlyPlans]
      if (plan.yearlyPlanId) this.recalcYearlyProgress(plan.yearlyPlanId)
      uni.showToast({ title: '已跳过，不参与年计划进度计算', icon: 'none' })
    },

    undoMonthlyPlan(plan: userContext.MonthlyPlanItem) {
      plan.status = 'pending'
      plan.completedManually = false
      plan.progress = 0
      plan.dailyCompletions = {}
      userContext.upsertMonthlyPlan(plan)
      this.monthlyPlans = [...this.monthlyPlans]
      if (plan.yearlyPlanId) this.recalcYearlyProgress(plan.yearlyPlanId)
      uni.showToast({ title: '已恢复', icon: 'none' })
    },

    // ============================================================
    // 年/月计划筛选
    // ============================================================

    onYearFilterChange(e: { detail: { value: number } }) {
      const val = this.yearFilterOptions[e.detail.value]
      if (val === '全部') {
        this.monthlyYearFilter = 'all'
      } else {
        this.monthlyYearFilter = val.replace('年', '')
      }
    },

    // ============================================================
    // AI 生成年/月计划
    // ============================================================

    async generateYearlyPlans() {
      if (this.generatingYearly || this.goals.length === 0) return
      this.generatingYearly = true
      uni.showLoading({ title: 'AI 生成每年计划中...' })
      try {
        const activeGoals = this.goals.filter(g => g.status !== 'completed' && g.status !== 'skipped').slice(0, 3)
        const sys = `你是一名人生规划师。基于用户的目标，为每个目标生成每年计划。

请输出严格 JSON：
{
  "yearlyPlans": [
    { "goalIndex": 0, "years": [
      { "label": "第1年", "description": "这一年的具体要做的内容（40字内）" }
    ]}
  ]
}
要求：goalIndex 是目标列表的序号从0开始；每个目标生成 3-5 年的年计划；描述要具体可执行。`
        const usr = `目标列表（请用 goalIndex 对应）：
${activeGoals.map((g, i) => `${i}. ${g.name}：${g.desc}`).join('\n')}

请为每个目标生成每年计划。`
        const text = await aiChat({ systemPrompt: sys, userMessage: usr, jsonMode: true, temperature: 0.7, maxTokens: 1500 })
        const parsed = tryParseJson<{ yearlyPlans?: Array<{ goalIndex?: number; years: Array<{ label: string; description: string }> }> }>(text)
        if (parsed && Array.isArray(parsed.yearlyPlans)) {
          const newPlans: userContext.YearlyPlanItem[] = []
          const now = new Date()
          let yearBase = now.getFullYear()
          parsed.yearlyPlans.forEach((gp) => {
            const idx = typeof gp.goalIndex === 'number' ? gp.goalIndex : -1
            const goal = activeGoals[idx]
            if (!goal || !Array.isArray(gp.years)) return
            gp.years.forEach((y, yi) => {
              newPlans.push({
                id: 'yp-' + Date.now() + '-' + idx + '-' + yi,
                goalId: goal.id,
                year: yearBase + yi,
                label: y.label || `第${yi + 1}年`,
                description: y.description || '',
                progress: 0,
                status: 'pending',
                completedManually: false,
                createTime: this.formatDate(now),
                fromAI: true
              })
            })
          })
          if (newPlans.length > 0) {
            this.yearlyPlans = newPlans
            userContext.setYearlyPlans(newPlans)
            uni.showToast({ title: `已生成 ${newPlans.length} 个年计划`, icon: 'success' })
            return
          }
        }
        // AI 失败兜底：根据目标自动生成简单年计划
        const fallbackPlans = this.generateYearlyPlansFallback(activeGoals)
        this.yearlyPlans = fallbackPlans
        userContext.setYearlyPlans(fallbackPlans)
        uni.showToast({ title: `已生成 ${fallbackPlans.length} 个年计划`, icon: 'success' })
      } catch (e) {
        console.warn('[plan] generateYearlyPlans failed:', e)
        uni.showToast({ title: '生成失败', icon: 'none' })
      } finally {
        this.generatingYearly = false
        uni.hideLoading()
      }
    },
    generateYearlyPlansFallback(goals: userContext.GoalItem[]): userContext.YearlyPlanItem[] {
      const now = new Date()
      const yearBase = now.getFullYear()
      const plans: userContext.YearlyPlanItem[] = []
      goals.forEach((goal, gi) => {
        const years = 3 + (gi % 2)
        for (let yi = 0; yi < years; yi++) {
          plans.push({
            id: 'yp-fb-' + Date.now() + '-' + gi + '-' + yi,
            goalId: goal.id,
            year: yearBase + yi,
            label: `第${yi + 1}年`,
            description: `${yi + 1}年后达成「${goal.name}」的第${yi + 1}阶段目标`,
            progress: 0,
            status: 'pending',
            completedManually: false,
            createTime: this.formatDate(now),
            fromAI: false
          })
        }
      })
      return plans
    },

    async generateMonthlyPlans() {
      if (this.generatingMonthly || this.yearlyPlans.length === 0) return
      this.generatingMonthly = true
      uni.showLoading({ title: 'AI 生成每月计划中...' })
      try {
        const activeYearly = this.yearlyPlans.filter(p => p.status !== 'completed' && p.status !== 'skipped').slice(0, 6)
        const sys = `你是一名时间管理教练。基于用户的年计划，为每个年计划生成每月计划。

请输出严格 JSON：
{
  "monthlyPlans": [
    { "yearlyIndex": 0, "months": [
      { "label": "1月", "focus": "这个月的重点工作/学习内容（30字内）" }
    ]}
  ]
}
要求：yearlyIndex 是年计划列表的序号从0开始；每个年计划生成 12 个月的月计划；每月 focus 要具体。`
        const usr = `年计划列表（请用 yearlyIndex 对应）：
${activeYearly.map((p, i) => `${i}. ${p.label}(${p.year}年)：${p.description}`).join('\n')}

请为每个年计划生成 12 个月的月计划。`
        const text = await aiChat({ systemPrompt: sys, userMessage: usr, jsonMode: true, temperature: 0.7, maxTokens: 2000 })
        const parsed = tryParseJson<{ monthlyPlans?: Array<{ yearlyIndex?: number; months: Array<{ label: string; focus: string }> }> }>(text)
        if (parsed && Array.isArray(parsed.monthlyPlans)) {
          const newPlans: userContext.MonthlyPlanItem[] = []
          const now = new Date()
          parsed.monthlyPlans.forEach((gp) => {
            const idx = typeof gp.yearlyIndex === 'number' ? gp.yearlyIndex : -1
            const yp = activeYearly[idx]
            if (!yp || !Array.isArray(gp.months)) return
            gp.months.forEach((m, mi) => {
              newPlans.push({
                id: 'mp-' + Date.now() + '-' + idx + '-' + mi,
                yearlyPlanId: yp.id,
                goalId: yp.goalId,
                year: yp.year,
                month: mi + 1,
                label: m.label || `${mi + 1}月`,
                focus: m.focus || '',
                progress: 0,
                status: 'pending',
                completedManually: false,
                createTime: this.formatDate(now),
                fromAI: true
              })
            })
          })
          if (newPlans.length > 0) {
            this.monthlyPlans = newPlans
            userContext.setMonthlyPlans(newPlans)
            uni.showToast({ title: `已生成 ${newPlans.length} 个月计划`, icon: 'success' })
            return
          }
        }
        // AI 失败兜底：根据年计划自动生成月计划
        const fallbackPlans = this.generateMonthlyPlansFallback(activeYearly)
        this.monthlyPlans = fallbackPlans
        userContext.setMonthlyPlans(fallbackPlans)
        uni.showToast({ title: `已生成 ${fallbackPlans.length} 个月计划`, icon: 'success' })
      } catch (e) {
        console.warn('[plan] generateMonthlyPlans failed:', e)
        uni.showToast({ title: '生成失败', icon: 'none' })
      } finally {
        this.generatingMonthly = false
        uni.hideLoading()
      }
    },
    generateMonthlyPlansFallback(yearlyPlans: userContext.YearlyPlanItem[]): userContext.MonthlyPlanItem[] {
      const now = new Date()
      const plans: userContext.MonthlyPlanItem[] = []
      const focuses = ['基础准备', '核心技能提升', '实践项目', '复盘总结', '深度探索', '成果输出', '专项突破', '拓展学习', '综合应用', '整理归档', '规划迭代', '年度总结']
      yearlyPlans.forEach((yp, yi) => {
        for (let mi = 0; mi < 12; mi++) {
          plans.push({
            id: 'mp-fb-' + Date.now() + '-' + yi + '-' + mi,
            yearlyPlanId: yp.id,
            goalId: yp.goalId,
            year: yp.year,
            month: mi + 1,
            label: `${mi + 1}月`,
            focus: `${focuses[mi]}：${yp.description.slice(0, 15)}`,
            progress: 0,
            status: 'pending',
            completedManually: false,
            createTime: this.formatDate(now),
            fromAI: false
          })
        }
      })
      return plans
    },
    closeAddTaskModal() {
      this.showAddTaskModal = false
      this.taskForm = { name: '', time: '' }
    },
    saveTask() {
      if (!this.taskForm.name.trim()) {
        uni.showToast({ title: '请输入任务名称', icon: 'none' })
        return
      }

      const newTask: userContext.DailyTaskItem = {
        id: 't-' + Date.now(),
        name: this.taskForm.name,
        time: this.taskForm.time || '09:00',
        completed: false
      }
      this.dailyTasks.push(newTask)
      userContext.setTodayTasks(this.dailyTasks)

      uni.showToast({ title: '添加成功', icon: 'success' })
      this.closeAddTaskModal()
    },
    onTimeChange(e: { detail: { value: string } }) {
      this.taskForm.time = e.detail.value
    },
    prevDay() {
      uni.showToast({
        title: '历史计划暂未开放',
        icon: 'none'
      })
    },
    today() {
      this.initDate()
    },
    nextDay() {
      uni.showToast({
        title: '暂仅支持今日计划',
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss">
.plan-container {
  min-height: 100vh;
  background: #FFF5F5;
  padding-bottom: 100rpx;
}

.page-header {
  padding: 60rpx 40rpx 30rpx;
  background: linear-gradient(180deg, #FFE4E1 0%, #FFF5F5 100%);
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.page-desc {
  font-size: 26rpx;
  color: #999;
  margin-top: 12rpx;
}

.plan-tabs {
  display: flex;
  background: #fff;
  margin: 0 40rpx;
  border-radius: 20rpx;
  padding: 8rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #999;
  transition: all 0.3s ease;
  
  &.active {
    background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
    color: #fff;
    font-weight: bold;
  }
}

.simulation-section, .goals-section, .yearly-section, .monthly-section, .daily-section {
  padding: 32rpx 40rpx;
}

.sim-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.sim-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.sim-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.sim-subtitle {
  font-size: 26rpx;
  color: #999;
  margin-top: 12rpx;
}

.timeline {
  position: relative;
  padding-left: 40rpx;
  
  &::before {
    content: '';
    position: absolute;
    left: 15rpx;
    top: 20rpx;
    bottom: 20rpx;
    width: 4rpx;
    background: #F0F0F0;
    border-radius: 2rpx;
  }
}

.timeline-item {
  position: relative;
  padding-left: 40rpx;
  padding-bottom: 40rpx;
  
  &:last-child {
    padding-bottom: 0;
  }
}

.timeline-dot {
  position: absolute;
  left: -40rpx;
  top: 4rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #fff;
  transition: all 0.3s ease;
  
  &.active {
    background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
  }
}

.timeline-content {
  background: #FFF5F5;
  border-radius: 16rpx;
  padding: 20rpx;
}

.timeline-year {
  font-size: 28rpx;
  font-weight: bold;
  color: #FF6B8A;
  display: block;
}

.timeline-desc {
  font-size: 26rpx;
  color: #666;
  margin-top: 8rpx;
  display: block;
}

.milestones {
  margin-top: 12rpx;
}

.milestone-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.milestone-list {
  margin-top: 8rpx;
}

.milestone-item {
  font-size: 22rpx;
  color: #666;
  display: block;
  line-height: 1.5;
}

.sim-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  
  &.primary {
    background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
    color: #fff;
  }
  
  &.secondary {
    background: #F5F5F5;
    color: #666;
  }
}

.sim-result-card {
  margin-top: 32rpx;
  background: linear-gradient(135deg, #FFF0F0 0%, #FFE4E1 100%);
  border-radius: 24rpx;
  padding: 32rpx;
}

.result-header {
  text-align: center;
  margin-bottom: 24rpx;
}

.result-icon {
  font-size: 64rpx;
  display: block;
}

.result-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF6B8A;
  margin-top: 12rpx;
}

.result-summary {
  text-align: center;
  margin-bottom: 32rpx;
}

.summary-text {
  font-size: 26rpx;
  color: #666;
}

.ai-analysis-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border-left: 6rpx solid #4A90D9;
}

.analysis-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.analysis-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.analysis-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #4A90D9;
}

.analysis-content {
  font-size: 26rpx;
  color: #555;
  line-height: 1.8;
}

.insight-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border-left: 6rpx solid #FFB800;
}

.insight-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.insight-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.insight-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #FFB800;
}

.insight-content {
  font-size: 26rpx;
  color: #555;
  line-height: 1.8;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #FF6B8A;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.stat-divider {
  width: 1rpx;
  background: #F0F0F0;
}

.goals-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.goals-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.add-btn {
  font-size: 28rpx;
  color: #FF6B8A;
}

.goals-filter {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.filter-item {
  padding: 12rpx 28rpx;
  background: #fff;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #666;
  transition: all 0.3s ease;
  
  &.active {
    background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
    color: #fff;
  }
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.goal-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.goal-progress-ring {
  width: 80rpx;
  height: 80rpx;
  margin-right: 24rpx;
}

.ring-progress {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    #FF6B8A calc(var(--progress) * 1%),
    #F0F0F0 calc(var(--progress) * 1%)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    background: #fff;
  }
  
  &.large {
    &::before {
      width: 100rpx;
      height: 100rpx;
    }
  }
}

.progress-value {
  position: relative;
  z-index: 1;
  font-size: 20rpx;
  font-weight: bold;
  color: #FF6B8A;
}

.goal-info {
  flex: 1;
}

.goal-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.goal-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
  display: block;
}

.goal-meta {
  margin-top: 10rpx;
}

.goal-deadline {
  font-size: 22rpx;
  color: #666;
}

.goal-status {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  
  &.completed {
    background: #E8F5E9;
    color: #4CAF50;
  }
  
  &.in_progress {
    background: #FFF3E0;
    color: #FF9800;
  }
  
  &.pending {
    background: #F5F5F5;
    color: #999;
  }
}

.empty-state {
  text-align: center;
  padding: 60rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
}

.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-top: 20rpx;
  display: block;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
  margin-top: 12rpx;
}

.daily-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.daily-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.date-nav {
  display: flex;
  gap: 16rpx;
}

.nav-btn {
  padding: 12rpx 24rpx;
  background: #fff;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #666;

  &.active {
    background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
    color: #fff;
  }

  &.disabled {
    background: #F5F5F5;
    color: #CCC;
  }
}

.daily-stats {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.daily-stat {
  display: inline-block;
  text-align: center;
  margin-right: 40rpx;
  
  &:last-child {
    margin-right: 0;
  }
}

.stat-num {
  font-size: 40rpx;
  font-weight: bold;
  color: #FF6B8A;
  display: block;
}

.stat-text {
  font-size: 22rpx;
  color: #999;
}

.daily-progress {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.progress-bar {
  flex: 1;
  height: 12rpx;
  background: #F0F0F0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #FF6B8A;
  font-weight: bold;
  width: 80rpx;
  text-align: right;
}

.daily-tasks {
  background: #fff;
  border-radius: 24rpx;
  padding: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.task-item {
  display: flex;
  align-items: center;
  padding: 24rpx 16rpx;
  border-bottom: 1rpx solid #F5F5F5;
  
  &:last-child {
    border-bottom: none;
  }
}

.task-checkbox {
  width: 44rpx;
  height: 44rpx;
  border: 3rpx solid #DDD;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-size: 24rpx;
  color: #fff;
  transition: all 0.3s ease;
  
  &.checked {
    background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
    border-color: #FF6B8A;
  }
}

.task-content {
  flex: 1;
}

.task-name {
  font-size: 28rpx;
  color: #333;
  display: block;
  
  &.completed {
    text-decoration: line-through;
    color: #999;
  }
}

.task-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
  display: block;
}

.task-indicator {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #DDD;
  
  &.completed {
    background: #FF6B8A;
  }
}

.add-task-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 24rpx;
  padding: 28rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.add-icon {
  font-size: 36rpx;
  color: #FF6B8A;
}

.add-text {
  font-size: 28rpx;
  color: #FF6B8A;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  /* 兜底：视口太矮时弹窗靠顶并允许整体滚动 */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 40rpx 0;
}

.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* 关键：用 calc 让 maxHeight 在所有视口都生效，超出时内部滚动 */
  max-height: calc(100vh - 80rpx);
  margin: auto 0;

  &.small {
    width: 500rpx;
  }

  &.large {
    width: 650rpx;
  }
}

.modal-body {
  padding: 32rpx;
  /* 表单区独立滚动，header/footer 固定可见 */
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.modal-body-scroll {
  /* 占用除 header/footer 之外的所有空间，独立滚动 */
  flex: 1;
  min-height: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.modal-body {
  padding: 32rpx;
}

.form-item {
  margin-bottom: 28rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #F8F9FA;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  color: #333;
  
  text {
    color: #999;
  }
}

.form-input.active {
  background: #FFF3F5;
  border: 2rpx solid #FF6B8A;
}

/* 教育背景单选按钮组 */
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.radio-btn {
  padding: 20rpx 32rpx;
  background: #F8F9FA;
  border-radius: 40rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.active {
    background: linear-gradient(135deg, #FFEEF0 0%, #FFE4E8 100%);
    color: #FF6B8A;
    border-color: #FF6B8A;
    font-weight: 500;
  }
}

/* 兴趣爱好标签组 */
.interest-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.interest-tag {
  padding: 16rpx 28rpx;
  background: #F8F9FA;
  border-radius: 32rpx;
  font-size: 24rpx;
  color: #666;
  transition: all 0.3s ease;
  border: 2rpx solid #E9E9E9;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.active {
    background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
    color: #fff;
    border-color: #FF6B8A;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 138, 0.3);
  }
}

/* 职业阶段选择器 */
.picker-wrapper {
  position: relative;
}

.picker-arrow {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24rpx;
  color: #999;
  pointer-events: none;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #F0F0F0;
}

.modal-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  
  &.cancel {
    background: #F5F5F5;
    color: #666;
  }
  
  &.confirm {
    background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
    color: #fff;
  }
}

.detail-progress {
  text-align: center;
  margin-bottom: 32rpx;
}

.detail-ring {
  width: 140rpx;
  height: 140rpx;
  margin: 0 auto 20rpx;
}

.detail-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.detail-status {
  font-size: 24rpx;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  display: inline-block;
  margin-top: 12rpx;
  
  &.completed {
    background: #E8F5E9;
    color: #4CAF50;
  }
  
  &.in_progress {
    background: #FFF3E0;
    color: #FF9800;
  }
  
  &.pending {
    background: #F5F5F5;
    color: #999;
  }
}

.detail-info {
  background: #F9F9F9;
  border-radius: 16rpx;
  padding: 20rpx;
}

.info-row {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #EEE;
  
  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 26rpx;
  color: #999;
  width: 140rpx;
}

.info-value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
}

/* ============ 路径沟通 + AI 操作 ============ */

.rerun-row {
  margin-top: 20rpx;
  text-align: right;
}

.rerun-btn {
  font-size: 24rpx;
  color: #999;
  padding: 8rpx 16rpx;
  border: 1rpx solid #EEE;
  border-radius: 12rpx;

  &:active {
    opacity: 0.6;
  }
}

.plan-chat-card {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.chat-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #F5F5F5;
}

.chat-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.chat-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.chat-msgs {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.chat-msg {
  max-width: 80%;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  line-height: 1.6;
  word-break: break-all;

  &.ai {
    align-self: flex-start;
    background: #F5F8FF;
    color: #333;
    border-top-left-radius: 4rpx;
  }

  &.user {
    align-self: flex-end;
    background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
    color: #fff;
    border-top-right-radius: 4rpx;
  }

  .msg-content {
    display: block;
    white-space: pre-wrap;
  }

  .msg-content.typing {
    color: #999;
    font-style: italic;
  }

  .msg-time {
    display: block;
    font-size: 20rpx;
    color: rgba(0,0,0,0.4);
    margin-top: 4rpx;
  }

  &.user .msg-time {
    color: rgba(255,255,255,0.7);
  }
}

.choice-area {
  background: #FAFAFA;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-top: 12rpx;
}

.choice-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
}

.choice-row {
  margin-bottom: 12rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.choice-btn {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
  border: 2rpx solid #F0F0F0;

  &:active {
    transform: scale(0.98);
    background: #FFF5F5;
  }

  &.primary {
    background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
    color: #fff;
    border: none;

    &:active {
      opacity: 0.9;
    }
  }
}

.custom-goal-input {
  width: 100%;
  min-height: 120rpx;
  background: #fff;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 28rpx;
  border: 2rpx solid #F0F0F0;
  margin-bottom: 16rpx;
  box-sizing: border-box;
}

.free-chat {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F5F5F5;
}

.free-input-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.free-input {
  flex: 1;
  height: 72rpx;
  background: #F8F9FA;
  border-radius: 36rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
  color: #333;
}

.free-send {
  background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
  color: #fff;
  padding: 16rpx 28rpx;
  border-radius: 32rpx;
  font-size: 26rpx;

  &:active {
    opacity: 0.85;
  }
}

.goals-ai-bar {
  margin-bottom: 20rpx;
}

.goals-ai-btn {
  background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
  color: #fff;
  text-align: center;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;

  &:active {
    opacity: 0.85;
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.goals-ai-hint, .daily-ai-hint {
  background: #FFF8E1;
  color: #F57C00;
  font-size: 24rpx;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.daily-ai-bar {
  margin-bottom: 20rpx;
}

.daily-ai-btn {
  background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
  color: #fff;
  text-align: center;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;

  &:active {
    opacity: 0.85;
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.modal-btn {
  &.warn {
    background: #FFEBEE;
    color: #E53935;
  }
}

// ============================================================
// 每年计划样式
// ============================================================

.yearly-section, .monthly-section {
  .yearly-header, .monthly-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
  }

  .yearly-title, .monthly-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.yearly-ai-bar, .monthly-ai-bar {
  margin-bottom: 24rpx;
}

.yearly-ai-btn, .monthly-ai-btn {
  background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
  color: #fff;
  text-align: center;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;

  &:active {
    opacity: 0.85;
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.yearly-list, .monthly-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.yearly-card, .monthly-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}

.yearly-top, .monthly-top {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.yearly-progress-ring, .monthly-progress-ring {
  flex-shrink: 0;
}

.ring-progress.small {
  width: 80rpx;
  height: 80rpx;
}

.progress-value.small {
  font-size: 22rpx;
  font-weight: bold;
}

.yearly-info, .monthly-info {
  flex: 1;
  min-width: 0;
}

.yearly-label, .monthly-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.yearly-goal-name, .monthly-year-ref {
  font-size: 24rpx;
  color: #FF6B8A;
  margin-top: 4rpx;
  display: block;
}

.yearly-desc, .monthly-focus {
  font-size: 26rpx;
  color: #666;
  margin-top: 8rpx;
  display: block;
  line-height: 1.5;
}

.yearly-status, .monthly-status {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;

  &.completed {
    background: #E8F5E9;
    color: #4CAF50;
  }

  &.in_progress {
    background: #E3F2FD;
    color: #2196F3;
  }

  &.pending {
    background: #F5F5F5;
    color: #999;
  }

  &.skipped {
    background: #F5F5F5;
    color: #BBB;
    text-decoration: line-through;
  }
}

.manual-badge {
  font-size: 20rpx;
}

.yearly-actions, .monthly-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F0F0F0;
}

.yearly-action-btn, .monthly-action-btn {
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  background: #F5F5F5;

  &.skip {
    background: #FFF3E0;
    color: #E65100;
  }

  &.undo {
    background: #E3F2FD;
    color: #1565C0;
  }

  &:active {
    opacity: 0.7;
  }
}

.monthly-year-filter {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
  padding: 16rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;

  .filter-label {
    font-size: 26rpx;
    color: #666;
  }

  .filter-value {
    font-size: 26rpx;
    color: #FF6B8A;
    font-weight: 600;
  }
}
</style>