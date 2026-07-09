<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

// 仅在开发环境下输出生命周期日志，避免污染生产 console
const DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : true

onLaunch(() => {
  if (DEV) console.log('Lume App Launch')
})

onShow(() => {
  if (DEV) console.log('App Show')
})

onHide(() => {
  if (DEV) console.log('App Hide')
})
</script>

<style lang="scss">
</style>