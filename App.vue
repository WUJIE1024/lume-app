<script>
export default {
  onLaunch: function () {
    console.log('Lume App Launch')
    // 初始化云服务
    this.initCloud()
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
  methods: {
    initCloud() {
      // #ifdef H5 || APP-PLUS
      // 云服务初始化（根据实际需求配置）
      console.log('Initializing cloud service...')
      // #endif
    }
  }
}
</script>

<style lang="scss">
@import './static/css/global.scss';
</style>