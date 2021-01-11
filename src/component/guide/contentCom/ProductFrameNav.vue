<!--  -->
<template>
  <div>新增产品管理模块，升级产品二维码功能，引入产品类型。<a href="javascript:;"
                                    @click="openLink('https://www.yuque.com/shb/help/fosxau')">查看使用详情</a></div>
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