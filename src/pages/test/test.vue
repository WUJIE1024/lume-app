<template>
  <view class="test-container">
    <view class="page-header">
      <text class="page-title">测评中心</text>
      <text class="page-desc">通过科学测评，了解真实的自己</text>
    </view>

    <view class="test-list">
      <view class="test-card" v-for="(test, index) in tests" :key="index" @click="startTest(test)">
        <view class="test-icon" :style="{ background: test.gradient }">
          <text>{{ test.icon }}</text>
        </view>
        <view class="test-info">
          <text class="test-name">{{ test.name }}</text>
          <text class="test-desc">{{ test.desc }}</text>
          <view class="test-meta">
            <text class="meta-item">{{ test.questions }}题</text>
            <text class="meta-divider">·</text>
            <text class="meta-item">{{ test.time }}分钟</text>
          </view>
        </view>
        <view class="test-arrow">
          <text class="arrow-icon">→</text>
        </view>
      </view>
    </view>

    <view class="result-section" v-if="hasResults">
      <view class="section-header">
        <text class="section-title">我的测评结果</text>
        <text class="section-hint">{{ allResults.length }} 项</text>
      </view>
      <view class="result-card">
        <view class="result-item" v-for="(result, index) in allResults" :key="index" @click="viewResult(result)">
          <view class="result-icon">{{ iconOf(result.testId) }}</view>
          <view class="result-content">
            <text class="result-name">{{ nameOf(result.testId) }}</text>
            <text class="result-value">{{ result.type }}</text>
          </view>
          <text class="result-date">{{ formatDate(result.completedAt) }}</text>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-icon">📋</text>
      <text class="empty-text">还没有测评记录</text>
      <text class="empty-hint">完成测评，开启自我探索之旅</text>
    </view>
  </view>
</template>

<script lang="ts">
import { testMap } from '../../data/tests'
import * as userContext from '../../utils/userContext'

const testMeta: Record<string, { icon: string; gradient: string; time: number }> = {
  mbti: { icon: '💎', gradient: 'linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%)', time: 12 },
  holland: { icon: '🎯', gradient: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', time: 15 },
  intelligence: { icon: '✨', gradient: 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)', time: 10 },
  value: { icon: '💖', gradient: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)', time: 8 }
}

export default {
  data() {
    return {
      tests: [] as Array<{ id: string; name: string; desc: string; icon: string; gradient: string; questions: number; time: number }>,
      hasResults: false,
      allResults: [] as userContext.TestResultEntry[]
    }
  },
  onShow() {
    this.loadTests()
    this.loadResults()
  },
  methods: {
    loadTests() {
      this.tests = Object.values(testMap).map(t => ({
        id: t.id,
        name: t.name,
        desc: t.desc,
        icon: testMeta[t.id]?.icon || '📝',
        gradient: testMeta[t.id]?.gradient || 'linear-gradient(135deg, #ccc 0%, #aaa 100%)',
        questions: t.questions.length,
        time: testMeta[t.id]?.time || Math.ceil(t.questions.length / 6)
      }))
    },
    loadResults() {
      this.allResults = userContext.getAllTestResults()
      this.hasResults = this.allResults.length > 0
    },
    nameOf(testId: string) {
      return testMap[testId]?.name || testId
    },
    iconOf(testId: string) {
      return testMeta[testId]?.icon || '📝'
    },
    formatDate(iso: string) {
      if (!iso) return ''
      const d = new Date(iso)
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${d.getFullYear()}-${month}-${day}`
    },
    viewResult(result: userContext.TestResultEntry) {
      uni.navigateTo({
        url: `/pages/test/result?id=${result.testId}`
      })
    },
    startTest(test: any) {
      uni.showModal({
        title: `开始${test.name}`,
        content: `该测试包含${test.questions}题，预计用时${test.time}分钟`,
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: `/pages/test/question?id=${test.id}`
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.test-container {
  min-height: 100vh;
  background: #FFF5F5;
  padding-bottom: 100rpx;
}

.page-header {
  padding: 60rpx 40rpx 40rpx;
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

.test-list {
  padding: 0 40rpx;
}

.test-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

.test-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.test-info {
  flex: 1;
  margin-left: 28rpx;
}

.test-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.test-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.test-meta {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}

.meta-item {
  font-size: 22rpx;
  color: #FF6B8A;
}

.meta-divider {
  margin: 0 12rpx;
  color: #ddd;
}

.test-arrow {
  width: 60rpx;
  height: 60rpx;
  background: #FFF5F5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  font-size: 28rpx;
  color: #FF6B8A;
}

.result-section {
  margin: 40rpx;
}

.section-header {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.result-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.result-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F5F5F5;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    opacity: 0.6;
  }
}

.result-icon {
  font-size: 36rpx;
}

.result-content {
  flex: 1;
  margin-left: 20rpx;
}

.result-name {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.result-value {
  font-size: 24rpx;
  color: #FF6B8A;
  margin-top: 4rpx;
  display: block;
}

.result-date {
  font-size: 22rpx;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
  margin-top: 12rpx;
}
</style>