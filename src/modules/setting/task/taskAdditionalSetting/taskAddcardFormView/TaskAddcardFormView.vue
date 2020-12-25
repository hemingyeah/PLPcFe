<template>
  <div class="setting-task-card" v-loading="loading">
    <!-- start 头部 -->
    <div class="setting-task-card-header">
      <div class="setting-task-card-left">
        <p class="setting-back-btn" @click="back">
          <i class="iconfont icon-arrow-left"></i> 返回
        </p>
        <el-tooltip effect="dark" content="修改附加组件名称" placement="bottom">
          <el-input class="setting-back-name" v-model="cardName" placeholder="请输入附加组件名称" maxlength="20"></el-input>
        </el-tooltip>
      </div>
      <base-button
        type="primary"
        native-type="submit"
        :disabled="pending"
        @event="submit"
        >保存</base-button
      >
    </div>
    <!-- end 头部 -->

    <!-- start 表单设计器 -->
    <div class="setting-task-design">
      <form-design  v-model="fields" :mode="mode"></form-design>
    </div>
    <!-- end 表单设计器 -->
  </div>
</template>

<script>
import TaskAddcardFormView from "./TaskAddcardFormView";
export default TaskAddcardFormView;
</script>

<style lang="scss">
@import "./TaskAddcardFormView.scss";
</style>