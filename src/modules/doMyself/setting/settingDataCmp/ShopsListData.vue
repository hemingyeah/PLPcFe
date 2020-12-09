<template>
  <div class="setting-data-cmp-box">
    <div class="font-16 font-w-500 mar-b-20">商城橱窗</div>
    <div class="text-con">
      请前往”查看商品已选项目“配置，最多允许设置4个橱窗商品
      <el-button class="mar-t-24" type="primary" @click="goToShops">去配置</el-button>
    </div>
  </div>
</template>
<script>
import _ from "lodash";
export default {
  name: "shops-list-data",
  data() {
    return {};
  },
  methods: {
    goToShops() {
      // window.location.href = "/setting/serviceStation/markSpareGray";
      window.location.href = '/setting/serviceStation/partShop'
      // window.location.href = '/abnormal/v2/list'
    },
  },
};
</script>
<style lang="scss" scoped>
.setting-data-cmp-box {
  width: 100%;
  padding: 16px 12px;
  background: #fff;
  .text-con {
    margin-top: 124px;
    padding: 0 45px;
    color: #666;
    text-align: center;
  }
}
</style>