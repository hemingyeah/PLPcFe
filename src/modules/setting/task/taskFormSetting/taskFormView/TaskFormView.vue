<template>
  <div class="setting-task" v-loading.fullscreen.lock="pending">
    <!-- start 头部 -->
    <div class="setting-task-header">
      <div class="setting-task-header-left">表单设置 > 新建表单设置</div>
      <div class="setting-task-header-right">
        <el-button plain @click="submit" :disabled="pending">保存</el-button>
      </div>
    </div>
    <!-- end 头部 -->

    <!-- start 表单设计器 -->
    <div class="setting-task-design">
      <form-design
        ref="formDesign"
        v-if="init"
        v-model="fields"
        :mode="mode"
        :relation-field-options="relationOptions"
      ></form-design>
    </div>
    <!-- end 表单设计器 -->

    <!-- 客户关联查询和产品关联查询字段设置关联项弹窗 -->
    <relation-options-modal
      ref="relationOptionsModal"
      @confirm="relationOptionsConfirm"
    >
    </relation-options-modal>
  </div>
</template>

<script>
import TaskFormView from './TaskFormView';
export default TaskFormView;
</script>

<style lang="scss">
@import './TaskFormView.scss';
</style>