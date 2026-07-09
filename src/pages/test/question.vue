<template>
  <view class="question-container">
    <view class="question-header">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progress + '%' }"></view>
      </view>
      <text class="progress-text">{{ currentIndex + 1 }} / {{ questions.length }}</text>
    </view>

    <view class="question-card">
      <view class="question-number">第 {{ currentIndex + 1 }} 题</view>
      <text class="question-text">{{ currentQuestion.text }}</text>
      
      <view class="options-list">
        <view 
          class="option-item" 
          v-for="(option, idx) in currentQuestion.options" 
          :key="idx"
          :class="{ active: selectedAnswer === idx }"
          @click="selectOption(idx)"
        >
          <view class="option-letter">{{ String.fromCharCode(65 + idx) }}</view>
          <text class="option-text">{{ option }}</text>
          <view class="option-check" v-if="selectedAnswer === idx">✓</view>
        </view>
      </view>
    </view>

    <view class="action-bar">
      <view 
        class="btn btn-secondary" 
        :class="{ disabled: currentIndex === 0 }"
        @click="prevQuestion"
      >
        <text>上一题</text>
      </view>
      <view 
        class="btn btn-primary" 
        :class="{ disabled: selectedAnswer === -1 }"
        @click="nextQuestion"
      >
        <text>{{ currentIndex === questions.length - 1 ? '查看结果' : '下一题' }}</text>
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
      questions: [],
      currentIndex: 0,
      answers: [],
      selectedAnswer: -1
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex] || { text: '', options: [] }
    },
    progress() {
      return ((this.currentIndex + 1) / this.questions.length) * 100
    }
  },
  onLoad(options) {
    this.testId = options?.id || 'mbti'
    const test = testMap[this.testId]
    if (test) {
      this.questions = test.questions
      this.answers = new Array(test.questions.length).fill(-1)
    }
  },
  methods: {
    selectOption(idx) {
      this.selectedAnswer = idx
      this.answers[this.currentIndex] = idx
    },
    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--
        this.selectedAnswer = this.answers[this.currentIndex]
      }
    },
    nextQuestion() {
      if (this.selectedAnswer === -1) return

      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++
        this.selectedAnswer = this.answers[this.currentIndex]
      } else {
        this.showResult()
      }
    },
    showResult() {
      const test = testMap[this.testId]
      if (test) {
        const result = test.calculateResult(this.answers)
        // 保留 testId 以便后续按 id 查询
        const entry = { testId: this.testId, ...result }
        // 持久化：保留旧 key 兼容其他页面，同时写入 userContext
        uni.setStorageSync('testResult', result)
        userContext.setTestResult(entry as any)
        uni.navigateTo({
          url: '/pages/test/result?id=' + this.testId
        })
      }
    }
  }
}
</script>

<style lang="scss">
.question-container {
  min-height: 100vh;
  background: #FFF5F5;
  padding-bottom: 160rpx;
}

.question-header {
  padding: 30rpx 40rpx;
  background: linear-gradient(180deg, #FFE4E1 0%, #FFF5F5 100%);
}

.progress-bar {
  height: 12rpx;
  background: #FFE4E1;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B8A 0%, #FF8FA3 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin-top: 20rpx;
}

.question-card {
  margin: 40rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.question-number {
  font-size: 24rpx;
  color: #FF6B8A;
  margin-bottom: 24rpx;
}

.question-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.6;
  margin-bottom: 40rpx;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 28rpx;
  background: #F8F9FA;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  
  &.active {
    background: #FFF0F0;
    border-color: #FF6B8A;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.option-letter {
  width: 56rpx;
  height: 56rpx;
  background: #FFE4E1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #FF6B8A;
  
  .active & {
    background: #FF6B8A;
    color: #fff;
  }
}

.option-text {
  flex: 1;
  margin-left: 24rpx;
  font-size: 30rpx;
  color: #333;
}

.option-check {
  width: 40rpx;
  height: 40rpx;
  background: #FF6B8A;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #fff;
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
  
  &.disabled {
    opacity: 0.5;
    pointer-events: none;
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