<!--  -->
<template>
  <div
    id="normal-setting-components-box"
    v-loading.fullscreen.lock="fullscreenLoading"
  >
    <div class="flex-x box-12 bg-w">
      <div class="flex-1">
        <div class="font-16 font-w-600">产品目录自定义字段</div>
        <div>产品目录里的字段，可以在这里配置</div>
      </div>
      <el-button type="primary" @click="openTab">配置自定义字段</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'product-menu-set',
  data() {
    return {
      fullscreenLoading: false,
    };
  },
  created() {},
  mounted() {},
  methods: {
    openTab() {
      window.location.href = '/productV2/productMenu/settingField'
      // this.$platform.openTab({
      //   id: 'productV2_productMenu_settingField',
      //   title: '产品目录表单',
      //   url: '/productV2/productMenu/settingField',
      //   close: true,
      // });
    },
  },
};
</script>
<style lang="scss" scoped></style>
