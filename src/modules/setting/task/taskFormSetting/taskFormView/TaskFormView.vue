<template>
  <base-modal
    class="form-builder-modal"
    :show.sync="visble"
  >
    <template slot="title">
      <div class="form-builder-title">表单设置 > 新建表单设置</div>
      <el-button class="form-builder-save-btn" plain @click="submit" :disabled="pending">保存</el-button>
    </template>

    <!-- start 表单设计器 -->
    <form-design
      v-loading.lock="pending"
      ref="formDesign"
      v-if="init"
      v-model="fields"
      :mode="mode"
      :relation-field-options="relationOptions"
    ></form-design>
    <!-- end 表单设计器 -->

    <!-- 客户关联查询和产品关联查询字段设置关联项弹窗 -->
    <relation-options-modal
      ref="relationOptionsModal"
      @confirm="relationOptionsConfirm"
    >
    </relation-options-modal>
  </base-modal>
</template>

<script>
import TaskFormView from './TaskFormView';
export default TaskFormView;
</script>

<style lang="scss">
@import './TaskFormView.scss';
</style>