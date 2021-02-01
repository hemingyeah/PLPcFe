<!--  -->
<template>
  <div>门户商城配置，开启后将在首页保留商城入口<a href="javascript:;"
                              @click="openLink('https://www.yuque.com/shb/help/tn7hhx')">查看使用详情</a></div>
</template>

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
  }
}
</script>
<style lang='scss' scoped>
a {
  color: $color-primary;
}
</style>