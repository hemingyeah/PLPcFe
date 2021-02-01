<!--  -->
<template>
  <div
    id="normal-setting-components-box"
    v-loading.fullscreen.lock="fullscreenLoading"
  >
    <div class="flex-x box-12 bg-w">
      <div class="flex-1">
        <div class="font-16 font-w-600">产品类型自定义字段</div>
        <div>产品类型里的字段，可以在这里配置</div>
      </div>
      <el-button type="primary" @click="openTab">配置自定义字段</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "product-menu-set",
  data() {
    return {
      fullscreenLoading: false,
    };
  },
  created() {},
  mounted() {},
  methods: {
    openTab() {
      window.location.href = "/setting/productV2/catalog/settingField"
    },
  },
};
</script>
<style lang="scss" scoped></style>
