<template>
  <view class="home-container">
    <!-- 顶部欢迎区域 -->
    <view class="welcome-section">
      <view class="welcome-bg"></view>
      <view class="welcome-content">
        <view class="logo-area">
          <view class="logo-icon">
            <text class="logo-text">L</text>
          </view>
          <text class="logo-name">Lume 璐觅</text>
          <text class="logo-slogan">AI人生规划陪伴者</text>
        </view>
        <view class="greeting">
          <text class="greeting-text">{{ greeting }}</text>
          <text class="greeting-name">{{ userName || '亲爱的朋友' }}</text>
        </view>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-actions">
      <view class="action-card" @click="goToTest">
        <view class="action-icon test-icon">
          <text>测</text>
        </view>
        <text class="action-title">开始测评</text>
        <text class="action-desc">了解真实的自己</text>
      </view>
      <view class="action-card" @click="goToPlan">
        <view class="action-icon plan-icon">
          <text>规</text>
        </view>
        <text class="action-title">人生规划</text>
        <text class="action-desc">探索未来的可能</text>
      </view>
      <view class="action-card" @click="goToCheckin">
        <view class="action-icon checkin-icon">
          <text>打</text>
        </view>
        <text class="action-title">每日打卡</text>
        <text class="action-desc">记录成长点滴</text>
      </view>
      <view class="action-card" @click="goToChat">
        <view class="action-icon chat-icon">
          <text>聊</text>
        </view>
        <text class="action-title">找Lume聊</text>
        <text class="action-desc">随时陪伴你</text>
      </view>
    </view>

    <!-- 今日心情 -->
    <view class="mood-section">
      <view class="section-header">
        <text class="section-title">今日心情</text>
        <text class="section-date">{{ currentDate }}</text>
      </view>
      <view class="mood-selector">
        <view 
          v-for="(mood, index) in moods" 
          :key="index"
          class="mood-item"
          :class="{ active: selectedMood === index }"
          @click="selectMood(index)"
        >
          <text class="mood-emoji">{{ mood.emoji }}</text>
          <text class="mood-label">{{ mood.label }}</text>
        </view>
      </view>
    </view>

    <!-- 成长记录 -->
    <view class="growth-section">
      <view class="section-header">
        <text class="section-title">我的成长</text>
        <text class="section-more" @click="goToProfile">查看更多 →</text>
      </view>
      <view class="growth-stats">
        <view class="stat-item">
          <text class="stat-value">{{ streakDays }}</text>
          <text class="stat-label">连续打卡</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ completedTasks }}</text>
          <text class="stat-label">完成任务</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ planProgress }}%</text>
          <text class="stat-label">计划进度</text>
        </view>
      </view>
    </view>

    <!-- 每日推荐 -->
    <view class="recommend-section">
      <view class="section-header">
        <text class="section-title">今日推荐</text>
      </view>
      <view class="recommend-card">
        <view class="recommend-content">
          <text class="recommend-title">{{ todayTip.title }}</text>
          <text class="recommend-desc">{{ todayTip.content }}</text>
        </view>
        <view class="recommend-icon">💡</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      greeting: '早安',
      userName: '',
      currentDate: '',
      selectedMood: -1,
      moods: [
        { emoji: '😊', label: '开心' },
        { emoji: '😐', label: '平静' },
        { emoji: '😔', label: '低落' },
        { emoji: '😤', label: '烦躁' },
        { emoji: '🥰', label: '幸福' }
      ],
      streakDays: 7,
      completedTasks: 42,
      planProgress: 68,
      todayTip: {
        title: '今日箴言',
        content: '人生最大的挑战是发现自己是谁，而第二大的挑战是对所发现的感到满意。'
      }
    }
  },
  onLoad() {
    this.initData()
  },
  methods: {
    initData() {
      const now = new Date()
      const hour = now.getHours()
      if (hour < 12) {
        this.greeting = '早安'
      } else if (hour < 18) {
        this.greeting = '午安'
      } else {
        this.greeting = '晚安'
      }
      
      const month = now.getMonth() + 1
      const day = now.getDate()
      const weekDays = ['日', '一', '二', '三', '四', '五', '六']
      const weekDay = weekDays[now.getDay()]
      this.currentDate = `${month}月${day}日 星期${weekDay}`
      
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userName = userInfo.name
      }
    },
    selectMood(index) {
      this.selectedMood = index
      uni.showToast({
        title: `已记录：${this.moods[index].label}`,
        icon: 'success'
      })
    },
    goToTest() {
      uni.switchTab({
        url: '/pages/test/test'
      })
    },
    goToPlan() {
      uni.switchTab({
        url: '/pages/plan/plan'
      })
    },
    goToCheckin() {
      // checkin 不是 tabBar 页面，使用 navigateTo
      uni.navigateTo({
        url: '/pages/checkin/checkin'
      })
    },
    goToChat() {
      uni.switchTab({
        url: '/pages/companion/companion'
      })
    },
    goToProfile() {
      uni.switchTab({
        url: '/pages/mine/mine'
      })
    }
  }
}
</script>

<style lang="scss">
.home-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFE4E1 0%, #FFF5F5 100%);
  padding-bottom: 100rpx;
}

.welcome-section {
  position: relative;
  padding: 100rpx 40rpx 60rpx;
  overflow: hidden;
}

.welcome-bg {
  position: absolute;
  top: -100rpx;
  right: -50rpx;
  width: 400rpx;
  height: 400rpx;
  background: radial-gradient(circle, rgba(255,107,138,0.2) 0%, transparent 70%);
  border-radius: 50%;
}

.welcome-content {
  position: relative;
  z-index: 1;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.logo-icon {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(255,107,138,0.4);
}

.logo-text {
  font-size: 56rpx;
  font-weight: bold;
  color: #fff;
}

.logo-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-top: 20rpx;
}

.logo-slogan {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.greeting {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-left: 20rpx;
}

.greeting-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #FF6B8A;
}

.greeting-name {
  font-size: 32rpx;
  color: #333;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  padding: 0 40rpx;
  margin-top: 20rpx;
}

.action-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  }
}

.action-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  
  text {
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
  }
}

.test-icon {
  background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
}

.plan-icon {
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
}

.checkin-icon {
  background: linear-gradient(135deg, #11998E 0%, #38EF7D 100%);
}

.chat-icon {
  background: linear-gradient(135deg, #F093FB 0%, #F5576C 100%);
}

.action-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.action-desc {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}

.mood-section, .growth-section, .recommend-section {
  background: #fff;
  margin: 32rpx 40rpx;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-date {
  font-size: 24rpx;
  color: #999;
}

.section-more {
  font-size: 24rpx;
  color: #FF6B8A;
}

.mood-selector {
  display: flex;
  justify-content: space-between;
}

.mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  
  &.active {
    background: #FFE4E1;
  }
}

.mood-emoji {
  font-size: 48rpx;
}

.mood-label {
  font-size: 22rpx;
  color: #666;
  margin-top: 8rpx;
}

.growth-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #FF6B8A;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.recommend-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #FFF5F5 0%, #FFE4E1 100%);
  border-radius: 16rpx;
  padding: 24rpx;
}

.recommend-content {
  flex: 1;
}

.recommend-title {
  font-size: 24rpx;
  color: #FF6B8A;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.recommend-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.recommend-icon {
  font-size: 48rpx;
  margin-left: 20rpx;
}
</style>