<template>
  <div class="form-setting-panel">
    <div class="form-setting-group form-setting-group-small">
      <form-title-setting :field="field" :setting="setting" @input="updateForDom"></form-title-setting>
    </div>
    <div class="form-setting-group">
      <form-describe-setting :field="field" @input="updateForDom"></form-describe-setting>
    </div>
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">校验</h4>
      <div class="form-item-box">
        <form-required-setting :field="field" @input="update"></form-required-setting>
        <form-repeat-setting :field="field" @input="update"></form-repeat-setting>
      </div>
    </div>
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">字段权限</h4>
      <div class="form-item-box">
        <mobile-show-setting v-if="isTaskMode" :field="field" :fields="fields" @input="update"></mobile-show-setting>
        <form-visible-setting :field="field" @input="update"></form-visible-setting>
        <form-search-setting :field="field" @input="update"></form-search-setting>
      </div>
    </div>
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">其他设置</h4>
      <div class="form-item-box">
        <el-checkbox :value="field.setting.isScanCode" @input="update($event, 'isScanCode', true)" :true-label="1" :false-label="0">
          支持扫码录入
          <el-tooltip content="支持二维码/条形码，仅支持移动端使用" placement="top">
            <i class="iconfont icon-question"></i>
          </el-tooltip>
        </el-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
/* mixin */
import SettingMixin from '@src/component/form/mixin/setting';
/* props */
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-text-setting',
  mixins: [SettingMixin],
  props: settingProps,
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;

      this.update(value, prop);
    },
    update(value, prop, isSetting = false) {
      this.$emit('input', {value, prop, isSetting});
    }
  }
}
</script>
