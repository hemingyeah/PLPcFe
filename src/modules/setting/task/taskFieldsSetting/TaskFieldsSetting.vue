<template>
  <base-modal
    class="form-builder-modal"
    :show.sync="visble"
  >
    <template slot="title">
      <div class="form-builder-title">表单设置 > {{ modeName }}设置</div>
      <el-button class="form-builder-save-btn" plain @click="submit" :disabled="pending">保存</el-button>
    </template>

    <!-- start 表单设计器 -->
    <div class="task-form-design" v-loading.lock="pending">
      <form-design
        ref="formDesign"
        v-if="init"
        v-model="fields"
        :mode="mode"
        :common-fields="commonFields"
        :relation-field-options="relationOptions"
        @cancelPublicFieldSetting="transformPrivateField"
        @updatePublicFieldSetting="updatePublicFieldSetting"
      ></form-design>
    </div>
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
import TaskFieldsSetting from './TaskFieldsSetting';
export default TaskFieldsSetting;
</script>

<style lang="scss">
@import './TaskFieldsSetting.scss';
</style>