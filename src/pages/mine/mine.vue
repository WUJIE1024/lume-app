<template>
  <view class="mine-container">
    <view class="profile-header">
      <view class="profile-bg"></view>
      <view class="profile-content">
        <view class="avatar-section">
          <view class="avatar">
            <text class="avatar-icon">用</text>
          </view>
          <view class="user-info">
            <text class="user-name">用户昵称</text>
            <text class="user-tag">成长中 · 第15天</text>
          </view>
        </view>
        
        <view class="stats-row">
          <view class="stat-item">
            <text class="stat-value">3</text>
            <text class="stat-label">完成测评</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">12</text>
            <text class="stat-label">完成任务</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">85%</text>
            <text class="stat-label">完成率</text>
          </view>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-title">我的规划</view>
      <view class="menu-list">
        <view class="menu-item" @click="navigateTo('plan')">
          <view class="menu-icon">🎯</view>
          <text class="menu-text">我的目标</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="navigateTo('test')">
          <view class="menu-icon">📊</view>
          <text class="menu-text">测评记录</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="navigateTo('plan')">
          <view class="menu-icon">📈</view>
          <text class="menu-text">成长曲线</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-title">功能设置</view>
      <view class="menu-list">
        <view class="menu-item" @click="openDiary">
          <view class="menu-icon">📝</view>
          <text class="menu-text">心情日记</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="openReminders">
          <view class="menu-icon">🔔</view>
          <text class="menu-text">提醒设置</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="openSettings">
          <view class="menu-icon">⚙️</view>
          <text class="menu-text">系统设置</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-title">关于我们</view>
      <view class="menu-list">
        <view class="menu-item" @click="openAbout">
          <view class="menu-icon">ℹ️</view>
          <text class="menu-text">关于Lume</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="openFeedback">
          <view class="menu-icon">💬</view>
          <text class="menu-text">意见反馈</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="openPrivacy">
          <view class="menu-icon">🔒</view>
          <text class="menu-text">隐私政策</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="logout-section">
      <view class="logout-btn" @click="logout">
        <text>退出登录</text>
      </view>
    </view>

    <view class="version-info">
      <text>Lume v1.0.0</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    navigateTo(page) {
      uni.switchTab({
        url: `/pages/${page}/${page}`
      })
    },
    
    openDiary() {
      uni.showToast({
        title: '心情日记开发中',
        icon: 'none'
      })
    },
    
    openReminders() {
      uni.showToast({
        title: '提醒设置开发中',
        icon: 'none'
      })
    },
    
    openSettings() {
      uni.showToast({
        title: '系统设置开发中',
        icon: 'none'
      })
    },
    
    openAbout() {
      uni.showModal({
        title: '关于Lume',
        content: 'Lume（璐觅）- AI人生规划陪伴者\n\n专为18-25岁青年群体打造的AI人生规划陪伴助手，致力于解决当代青年在学业、职业选择和人生方向上的迷茫问题。',
        showCancel: false
      })
    },
    
    openFeedback() {
      uni.showModal({
        title: '意见反馈',
        content: '感谢您的反馈！请告诉我们您的建议：',
        editable: true,
        placeholderText: '请输入您的建议...',
        success: (res) => {
          if (res.confirm && res.content) {
            uni.showToast({
              title: '感谢您的反馈！',
              icon: 'success'
            })
          }
        }
      })
    },
    
    openPrivacy() {
      uni.showToast({
        title: '隐私政策开发中',
        icon: 'none'
      })
    },
    
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.mine-container {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 40rpx;
}

.profile-header {
  position: relative;
  padding-bottom: 40rpx;
}

.profile-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300rpx;
  background: linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%);
  border-radius: 0 0 40rpx 40rpx;
}

.profile-content {
  position: relative;
  z-index: 1;
  padding: 60rpx 40rpx 0;
}

.avatar-section {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 138, 0.3);
}

.avatar-icon {
  font-size: 44rpx;
  font-weight: bold;
  color: #FF6B8A;
}

.user-info {
  margin-left: 24rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}

.user-tag {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
  display: block;
}

.stats-row {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.08);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #FF6B8A;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.stat-divider {
  width: 1rpx;
  background: #F0F0F0;
}

.menu-section {
  margin: 24rpx 40rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.menu-title {
  padding: 24rpx 28rpx 16rpx;
  font-size: 24rpx;
  color: #999;
}

.menu-list {
  padding: 0 8rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 20rpx;
  border-bottom: 1rpx solid #F5F5F5;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: #FFF5F5;
  }
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.menu-arrow {
  font-size: 32rpx;
  color: #CCC;
}

.logout-section {
  padding: 0 40rpx;
}

.logout-btn {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
  
  text {
    font-size: 28rpx;
    color: #FF6B8A;
  }
  
  &:active {
    background: #FFF5F5;
  }
}

.version-info {
  text-align: center;
  padding: 40rpx;
  
  text {
    font-size: 22rpx;
    color: #CCC;
  }
}
</style>