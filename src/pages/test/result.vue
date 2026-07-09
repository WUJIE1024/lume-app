<template>
  <view class="result-container">
    <view class="result-header">
      <view class="result-icon">🎉</view>
      <text class="result-title">测评完成</text>
      <text class="result-subtitle">{{ testName }}</text>
    </view>

    <view class="result-card">
      <view class="result-type">
        <text class="type-text">{{ result.type }}</text>
      </view>
      <view class="result-desc">
        <text class="desc-text">{{ result.description }}</text>
      </view>
    </view>

    <view class="score-section" v-if="result.topThree && result.topThree.length">
      <view class="section-header">
        <text class="section-icon">📊</text>
        <text class="section-title">核心维度</text>
      </view>
      <view class="score-card">
        <view class="score-row" v-for="(s, idx) in result.topThree" :key="idx">
          <text class="score-rank">{{ idx + 1 }}</text>
          <text class="score-name">{{ s.name }}</text>
          <view class="score-bar-wrap">
            <view class="score-bar" :style="{ width: barWidth(s.score) + '%' }"></view>
          </view>
          <text class="score-value">{{ s.score }}</text>
        </view>
      </view>
    </view>

    <view class="career-section">
      <view class="section-header">
        <text class="section-icon">💼</text>
        <text class="section-title">适合职业</text>
      </view>
      <view class="career-tags">
        <view class="career-tag" v-for="(career, idx) in result.career" :key="idx">
          <text>{{ career }}</text>
        </view>
      </view>
    </view>

    <view class="advice-section">
      <view class="section-header">
        <text class="section-icon">💡</text>
        <text class="section-title">发展建议</text>
      </view>
      <view class="advice-card">
        <text class="advice-text">{{ result.advice }}</text>
      </view>
    </view>

    <view class="action-bar">
      <view class="btn btn-secondary" @click="retake">
        <text>重新测试</text>
      </view>
      <view class="btn btn-secondary" @click="goHome">
        <text>返回</text>
      </view>
      <view class="btn btn-primary" @click="goPlan">
        <text>应用到规划</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { testMap } from '../../data/tests'
import * as userContext from '../../utils/userContext'

export default {
  data() {
    return {
      testId: '',
      testName: '',
      result: { type: '', description: '', career: [], advice: '', topThree: [], rawScores: {} }
    }
  },
  onLoad(options) {
    this.testId = options?.id || 'mbti'
    const test = testMap[this.testId]
    if (test) {
      this.testName = test.name
    }
    // 优先从 userContext 读（最新结果），回退到旧 key
    const stored = userContext.getTestResult(this.testId as any) || uni.getStorageSync('testResult')
    if (stored) {
      this.result = stored
    }
  },
  methods: {
    barWidth(score: number) {
      // 归一化到 0-100 范围（多元智能最高 30，霍兰德最高 50，价值观最高 15）
      const max = Math.max(...Object.values(this.result.rawScores || {}), score)
      return max > 0 ? Math.round((score / max) * 100) : 0
    },
    retake() {
      uni.redirectTo({
        url: '/pages/test/question?id=' + this.testId
      })
    },
    goHome() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },
    goPlan() {
      uni.showToast({ title: '已同步到规划', icon: 'success' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/plan/plan' })
      }, 600)
    },
    shareResult() {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss">
.result-container {
  min-height: 100vh;
  background: #FFF5F5;
  padding-bottom: 160rpx;
}

.result-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
  background: linear-gradient(180deg, #FFE4E1 0%, #FFF5F5 100%);
}

.result-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
}

.result-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.result-subtitle {
  font-size: 26rpx;
  color: #999;
  margin-top: 12rpx;
}

.result-card {
  margin: 40rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.score-section {
  margin: 0 40rpx 40rpx;
}

.score-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.score-row {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  gap: 16rpx;
}

.score-rank {
  width: 36rpx;
  height: 36rpx;
  background: #FFE4E1;
  color: #FF6B8A;
  border-radius: 50%;
  text-align: center;
  line-height: 36rpx;
  font-size: 22rpx;
  font-weight: bold;
  flex-shrink: 0;
}

.score-name {
  width: 180rpx;
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;
}

.score-bar-wrap {
  flex: 1;
  height: 12rpx;
  background: #FFE4E1;
  border-radius: 6rpx;
  overflow: hidden;
}

.score-bar {
  height: 100%;
  background: linear-gradient(90deg, #FF6B8A 0%, #FF8FA3 100%);
  border-radius: 6rpx;
  transition: width 0.6s ease;
}

.score-value {
  width: 60rpx;
  text-align: right;
  font-size: 24rpx;
  color: #FF6B8A;
  font-weight: bold;
  flex-shrink: 0;
}

.result-type {
  text-align: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #FFF0F0 0%, #FFE4E1 100%);
  border-radius: 16rpx;
  margin-bottom: 30rpx;
}

.type-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #FF6B8A;
}

.result-desc {
  text-align: center;
}

.desc-text {
  font-size: 30rpx;
  color: #666;
  line-height: 1.6;
}

.career-section {
  margin: 0 40rpx 40rpx;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.career-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.career-tag {
  padding: 16rpx 32rpx;
  background: #fff;
  border-radius: 32rpx;
  border: 2rpx solid #FFE4E1;
  
  text {
    font-size: 26rpx;
    color: #FF6B8A;
  }
}

.advice-section {
  margin: 0 40rpx;
}

.advice-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.advice-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 24rpx;
  padding: 24rpx 40rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
}

.btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  text {
    font-size: 32rpx;
    font-weight: bold;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
  
  text {
    color: #fff;
  }
}

.btn-secondary {
  background: #F5F5F5;
  
  text {
    color: #666;
  }
}
</style>