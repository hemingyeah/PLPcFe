<template>
  <div class="form-setting-panel">
    <!-- start 标题 -->
    <form-title-setting
      :field="field"
      :setting="setting"
      :disabled="isSystem"
      @input="updateForDom"
    ></form-title-setting>
    <!-- end 标题 -->

    <!-- start 描述信息 -->
    <form-describe-setting
      :field="field"
      @input="updateForDom"
    ></form-describe-setting>
    <!-- end 描述信息 -->

    <!-- start 校验 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">校验</h4>
      <div class="form-item-box">
        <!-- 必填 -->
        <form-required-setting :field="field" @input="update"></form-required-setting>
        <!-- 不允许重复值 -->
        <el-checkbox :value="field.setting.appIsUp" @input="update($event, 'appIsUp', true)" :true-label="1" :false-label="0">
          <span class="form-item-box-label">移动端仅可拍照上传，不能选择相册或文件夹</span>
        </el-checkbox>
      </div>
    </div>
    <!-- end 校验 -->

    <!-- start 字段权限 -->
    <div class="form-setting-group form-setting-item" v-if="!isSystem">
      <h4 class="form-item-title">字段权限</h4>
      <div class="form-item-box">
        <!-- 可见性 -->
        <form-visible-setting :field="field" @input="update"></form-visible-setting>
      </div>
    </div>
    <!-- end 字段权限 -->

    <!-- start 其他设置 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">其他设置</h4>
      <div class="form-item-box">
        <el-checkbox :value="field.setting.isAddWatermark" @input="update($event, 'isAddWatermark', true)" :true-label="1" :false-label="0">
          <span class="form-item-box-label">上传图片时，图片上添加地址、时间、操作人水印</span>
        </el-checkbox>
      </div>
    </div>
    <!-- end 其他设置 -->
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-attachment-setting',
  mixins: [SettingMixin],
  props: settingProps,
  computed: {
    isSystem() {
      return this.field.isSystem === 1
    }
  },
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop)
    },
    update(value, prop, isSetting = false){
      this.$emit('input', {value, prop, isSetting})
    }
  }
}
</script>

<style lang="scss" scoped>
.form-item-box{
  /deep/.el-checkbox__input{
    line-height: 1.5;
    float: left;
  }
  &-label{
    display: inline-block;
    white-space: pre-wrap;
    padding-right: 10px;
  }
}
</style>