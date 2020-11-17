<template>
  <!-- 商城列表 -->
  <div class="mall-list">
    <!-- 头部返回 -->
    <div class="task-flex mall-list-header">
      <div class="task-span1">
        <base-button type="ghost">返回</base-button>
      </div>
    </div>
    <!-- tab切换 -->
    <div class="mall-list-tab">
      <el-tabs v-model="editableTabsValue" type="card">
        <el-tab-pane name="1" label="商城备件" key="1">
          <spare-parts />
        </el-tab-pane>
        <el-tab-pane name="2" label="商城服务" key="2">
          <service />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import MallList from "./mallList";
export default MallList;
</script>

<style lang="scss" scoped>
.mall-list {
  padding: 10px;
  &-header {
    padding: 10px;
    background-color: #fff;
    border-radius: 3px;
    line-height: 34px;
  }
  &-tab {
    margin-top: 10px;
    background-color: #fff;
  }
}
</style>

<style lang="scss">
.mall-list {
  .el-tabs__nav {
    border-radius: 0 !important;
  }
  .is-active {
    position: relative;
    &::before {
      content: "";
      width: 100%;
      height: 3px;
      position: absolute;
      left: 0;
      top: -1px;
      background-color: #13C2C2;
    }
  }
}
</style>