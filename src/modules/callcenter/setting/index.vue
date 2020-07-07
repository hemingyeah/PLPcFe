<template>
  <keep-alive>
    <div v-loading.fullscreen.lock="loading">
      <component :is="show" :account-info="result" :current="current"></component>
    </div>
  </keep-alive>
</template>

<script>
import * as CallCenterApi from '@src/api/CallCenterApi'
import CallCenter from '../views/CallCenter.vue'
import Apply from '../views/Apply.vue'
import Auditing from '../views/Auditing.vue'
export default {
  inject: ['initData'],
  data() {
    return {
      show: '',
      result: null,
      loading: false,
    }
  },
  computed: {
    current() {
      return (this.initData && this.initData.current) || 0;
    }
  },
  async mounted() {
    // // 判断是否开通
    this.getAccountInfo() 
  },
  methods: {
    async getAccountInfo() {
      this.loading = true
      try {
        const { code, message, result } = await CallCenterApi.getAccountInfo()
        this.loading = false
        // result为null未申请开通
        if (code !== 0 || !result) {
          this.show = 'call-center-apply'
          return
        } 
        console.info('res:', code, message, result)
        this.result = result
        // 审核状态：0待审核，1已审核
        this.show = result.verifyStatus ? 'call-center' : 'call-center-auditing'
      } catch (error) {
        this.loading = false
        this.show = 'call-center-apply'
        console.error(error)
      }
    }
  },
  components: {
    'call-center': CallCenter,
    'call-center-auditing': Auditing,
    'call-center-apply': Apply
  }
}
</script>

<style lang="scss">
.call-center-popper {
  padding: 12px 0;
  margin-top: 0;
}
</style>