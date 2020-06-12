<template>
  <keep-alive>
    <component :is="show" :account-info="result"></component>
  </keep-alive>

</template>

<script>
import CallCenter from '../views/CallCenter.vue'
import Apply from '../views/Apply.vue'
import Auditing from '../views/Auditing.vue'
export default {
  data() {
    return {
      show: 'call-center-apply',
      result: null
    }
  },
  async mounted() {
    // 判断是否开通
    try {
      const {code, message, result} = await this.$http.get('/outside/callcenter/api/getAccountInfo')
      // result为null未申请开通
      if (code !== 0 || !result) return
      console.info('res:', code, message, result);
      this.result = result
      // 审核状态：0待审核，1已审核
      result.verifyStatus = 1; // 这里手动设置1
      this.show = result.verifyStatus ? 'call-center' : 'call-center-auditing'      
    } catch (error) {
      console.error(error);
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