<template>
  <base-modal
    class="form-builder-modal"
    :show.sync="visble"
    v-loading.lock="pending"
  >
    <template slot="title">
      <div class="form-builder-title">表单设置 > {{ modeName }}设置</div>
      <el-button class="form-builder-save-btn" plain @click="submit" :disabled="pending">保存</el-button>
    </template>

    <!-- start 表单设计器 -->
    <form-design
      ref="formDesign"
      v-if="init"
      v-model="fields"
      :mode="mode"
      :relation-field-options="relationOptions"
      @cancelPublicFieldSetting="transformPrivateField"
      @updatePublicFieldSetting="updatePublicFieldSetting"
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
import taskFormSettingModal from './taskFormSettingModal';
export default taskFormSettingModal;
</script>

<style lang="scss">
@import './taskFormSettingModal.scss';
</style>