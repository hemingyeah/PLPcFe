<template>
  <div class="setting-task" v-loading.fullscreen.lock="pending">
    <!-- start 头部 -->
    <div class="setting-task-header">
      <div class="setting-task-header-left">表单设置 > 回执表单设置</div>
      <div class="setting-task-header-right">
        <el-button plain @click="submit" :disabled="pending">保存</el-button>
      </div>
    </div>
    <!-- end 头部 -->

    <!-- start 表单设计器 -->
    <div class="setting-task-design">
      <form-design
        v-if="init"
        v-model="fields"
        mode="task_receipt"
      ></form-design>
    </div>
    <!-- end 表单设计器 -->
  </div>
</template>

<script>
import taskReceiptFormView from './taskReceiptFormView';
export default taskReceiptFormView;
</script>

<style lang="scss">
@import './taskReceiptFormView.scss';
</style>