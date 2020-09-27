<template>
  <div class="setting-data-cmp-box">
    <div class="font-16 font-w-500 mar-b-20">企业圈子</div>
    <div class="text-con">
      <div>请前往"知识库“选择内容发布圈子</div>
      <el-button class="mar-t-24" type="primary" @click="goToWiki">去发布</el-button>
    </div>
  </div>
</template>
<script>
import _ from "lodash";
export default {
  name: "wiki-enter-data",
  data() {
    return {};
  },
  methods: {
    goToWiki() {
      let fromId = window.frameElement.getAttribute("id");
      this.$platform.openTab({
        id: "M_INFO_DOC",
        title: "知识库列表",
        url: "/wiki",
        reload: true,
        close: true,
        fromId,
      });
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