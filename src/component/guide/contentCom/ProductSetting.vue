<!--  -->
<template>
  <div>增加产品类型配置功能，产品可选择关联一个产品类型，丰富产品信息。<a href="javascript:;"
                                          @click="openLink('https://www.yuque.com/shb/help/vbk5ip')">查看使用详情</a></div>
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