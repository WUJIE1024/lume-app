<template>
  <view class="checkin-container">
    <view class="checkin-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <text class="page-title">每日打卡</text>
        <view class="streak-info">
          <text class="streak-count">{{ streakDays }}</text>
          <text class="streak-label">天连续打卡</text>
        </view>
      </view>
    </view>

    <view class="checkin-card" v-if="!isChecked">
      <view class="checkin-icon" @click="doCheckin">
        <text class="check-icon">✓</text>
      </view>
      <text class="checkin-tip">点击完成今日打卡</text>
    </view>

    <view class="checkin-card checked" v-else>
      <view class="checkin-icon checked-icon">
        <text class="check-icon">✓</text>
      </view>
      <text class="checkin-success">今日打卡成功！</text>
      <text class="checkin-time">打卡时间：{{ checkinTime }}</text>
    </view>

    <view class="stats-section">
      <view class="stats-title">打卡统计</view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ totalCheckins }}</text>
          <text class="stat-label">累计打卡</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ weekCheckins }}</text>
          <text class="stat-label">本周打卡</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ monthCheckins }}</text>
          <text class="stat-label">本月打卡</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ maxStreak }}</text>
          <text class="stat-label">最长连续</text>
        </view>
      </view>
    </view>

    <view class="calendar-section">
      <view class="calendar-header">
        <text class="calendar-title">本月打卡日历</text>
      </view>
      <view class="calendar-grid">
        <view class="calendar-weekday" v-for="day in weekdays" :key="day">
          <text>{{ day }}</text>
        </view>
        <view 
          class="calendar-day" 
          v-for="(day, index) in calendarDays" 
          :key="index"
          :class="{ 
            checked: day.checked, 
            today: day.isToday,
            disabled: !day.day 
          }"
        >
          <text v-if="day.day">{{ day.day }}</text>
        </view>
      </view>
    </view>

    <view class="motivation-section">
      <view class="motivation-card">
        <text class="motivation-text">"{{ motivationQuote }}"</text>
        <text class="motivation-author">—— {{ motivationAuthor }}</text>
      </view>
    </view>

    <view class="rewards-section">
      <view class="rewards-title">打卡奖励</view>
      <view class="rewards-list">
        <view 
          class="reward-item" 
          v-for="(reward, index) in rewards" 
          :key="index"
          :class="{ unlocked: reward.unlocked }"
        >
          <view class="reward-icon">
            <text>{{ reward.icon }}</text>
          </view>
          <view class="reward-info">
            <text class="reward-name">{{ reward.name }}</text>
            <text class="reward-condition">{{ reward.condition }}</text>
          </view>
          <view class="reward-status">
            <text v-if="reward.unlocked">已解锁</text>
            <text v-else>待解锁</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      streakDays: 7,
      isChecked: false,
      checkinTime: '',
      totalCheckins: 45,
      weekCheckins: 7,
      monthCheckins: 22,
      maxStreak: 15,
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      calendarDays: [],
      motivationQuote: '每一天的努力，都是未来的伏笔',
      motivationAuthor: 'Lume',
      rewards: [
        { icon: '🌱', name: '初出茅庐', condition: '连续打卡3天', unlocked: true },
        { icon: '🌿', name: '坚持不懈', condition: '连续打卡7天', unlocked: true },
        { icon: '🌳', name: '茁壮成长', condition: '连续打卡14天', unlocked: false },
        { icon: '🏆', name: '打卡达人', condition: '连续打卡30天', unlocked: false }
      ]
    }
  },
  onLoad() {
    this.generateCalendar()
    this.checkTodayCheckin()
  },
  methods: {
    generateCalendar() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      const startWeekday = firstDay.getDay()
      
      this.calendarDays = []
      
      for (let i = 0; i < startWeekday; i++) {
        this.calendarDays.push({ day: null, checked: false, isToday: false })
      }
      
      const today = now.getDate()
      const checkedDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
      
      for (let i = 1; i <= daysInMonth; i++) {
        this.calendarDays.push({
          day: i,
          checked: checkedDays.includes(i),
          isToday: i === today
        })
      }
    },
    
    checkTodayCheckin() {
      const now = new Date()
      const today = now.getDate()
      const checkedDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
      
      if (checkedDays.includes(today)) {
        this.isChecked = true
        this.checkinTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      }
    },
    
    doCheckin() {
      if (this.isChecked) return
      
      uni.showLoading({ title: '打卡中...' })
      
      setTimeout(() => {
        uni.hideLoading()
        this.isChecked = true
        this.streakDays++
        this.totalCheckins++
        this.weekCheckins++
        this.monthCheckins++
        
        const now = new Date()
        this.checkinTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        
        this.calendarDays.forEach(day => {
          if (day.isToday) {
            day.checked = true
          }
        })
        
        uni.showToast({
          title: '打卡成功！',
          icon: 'success'
        })
      }, 500)
    }
  }
}
</script>

<style lang="scss">
.checkin-container {
  min-height: 100vh;
  background: #FFF5F5;
  padding-bottom: 60rpx;
}

.checkin-header {
  position: relative;
  padding: 60rpx 40rpx 40rpx;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
}

.header-content {
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}

.streak-info {
  display: flex;
  align-items: baseline;
  margin-top: 16rpx;
}

.streak-count {
  font-size: 56rpx;
  font-weight: bold;
  color: #FFE43D;
}

.streak-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 8rpx;
}

.checkin-card {
  margin: -30rpx 40rpx 32rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 138, 0.2);
}

.checkin-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFE4E1 0%, #FFF5F5 100%);
  border: 4rpx dashed #FF6B8A;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    transform: scale(0.95);
  }
}

.check-icon {
  font-size: 48rpx;
  color: #FF6B8A;
}

.checked-icon {
  background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
  border: none;
  
  .check-icon {
    color: #fff;
  }
}

.checkin-tip {
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}

.checkin-success {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF6B8A;
  margin-top: 20rpx;
}

.checkin-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.stats-section {
  padding: 0 40rpx;
  margin-bottom: 32rpx;
}

.stats-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.stat-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #FF6B8A;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.calendar-section {
  padding: 0 40rpx;
  margin-bottom: 32rpx;
}

.calendar-header {
  margin-bottom: 20rpx;
}

.calendar-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8rpx;
}

.calendar-weekday {
  text-align: center;
  padding: 16rpx 0;
  font-size: 24rpx;
  color: #999;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #666;
  border-radius: 12rpx;
  
  &.disabled {
    opacity: 0;
  }
  
  &.checked {
    background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
    color: #fff;
  }
  
  &.today {
    border: 2rpx solid #FF6B8A;
    
    &.checked {
      border-color: #fff;
    }
  }
}

.motivation-section {
  padding: 0 40rpx;
  margin-bottom: 32rpx;
}

.motivation-card {
  background: linear-gradient(135deg, #FFF3E0 0%, #FFF8F0 100%);
  border-radius: 20rpx;
  padding: 32rpx;
  border-left: 6rpx solid #FFB74D;
}

.motivation-text {
  font-size: 28rpx;
  color: #5D4037;
  font-style: italic;
  line-height: 1.6;
  display: block;
}

.motivation-author {
  font-size: 24rpx;
  color: #FF8A65;
  margin-top: 16rpx;
  display: block;
  text-align: right;
}

.rewards-section {
  padding: 0 40rpx;
}

.rewards-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.rewards-list {
  background: #fff;
  border-radius: 20rpx;
  padding: 8rpx 0;
}

.reward-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #F5F5F5;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.unlocked {
    opacity: 1;
  }
  
  &:not(.unlocked) {
    opacity: 0.5;
  }
}

.reward-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: #FFF5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 20rpx;
}

.reward-info {
  flex: 1;
}

.reward-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.reward-condition {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
  display: block;
}

.reward-status {
  font-size: 22rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  
  text {
    color: #999;
  }
  
  .unlocked & {
    background: #E8F5E9;
    
    text {
      color: #4CAF50;
    }
  }
}
</style>