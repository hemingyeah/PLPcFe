<!--  -->
<template>
<div>会话管理中可设置分配规则，系统根据规则将服务人员推荐给客户。<a href="javascript:;" @click="openLink('https://www.yuque.com/shb/help/tn7hhx')">查看使用详情</a></div></template>

<script>
export default {
  data () {
    return {

    }
  },
  methods: {
    openLink (e) {
      this.$platform.openLink(e);
    },
  },
}
</script>
<style lang='scss' scoped>
a {
  color: $color-primary;
}
</style>