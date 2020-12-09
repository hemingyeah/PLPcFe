<template>
  <div class="form-setting-panel">
    <!-- start 标题 -->
    <form-title-setting
      :field="field"
      :setting="setting"
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
      </div>
    </div>
    <!-- end 校验 -->

    <!-- start 选项 -->
    <div class="form-setting-options">
      <h3>选项</h3>
      <div class="form-setting-group form-select-setting-operation">
        <button type="button" class="btn-text" @click="open">配置选项</button>
      </div>
    </div>
    <!-- end 选项 -->

    <!-- start 字段权限 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">字段权限</h4>
      <div class="form-item-box">
        <!-- 移动端列表展示 -->
        <mobile-show-setting v-if="isTaskMode" :field="field" :fields="fields" @input="update"></mobile-show-setting>
        <!-- 可见性 -->
        <form-visible-setting :field="field" @input="update"></form-visible-setting>
        <!-- 支持高级搜索 -->
        <form-search-setting :field="field" @input="update"></form-search-setting>
      </div>
    </div>
    <!-- end 字段权限 -->

    <!-- start 其他设置 -->
    <div class="form-setting-group form-setting-item" v-if="allowPublicSet">
      <h4 class="form-item-title">其他设置</h4>
      <div class="form-item-box">
        <!-- 设为公用字段 -->
        <form-public-setting :field="field" @input="update"></form-public-setting>
      </div>
    </div>
    <!-- end 其他设置 -->
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import Cascader from './components/index';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-cascader-setting',
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
    },
    open(){
      let source = this.field.setting.dataSource || [];
      let maxDeep = this.field.setting.maxDeep || 2;
      let defaultValue = (this.field.defaultValue && this.field.defaultValue.split(',')) || [];

      Cascader.setting(source, maxDeep, defaultValue).then(result => {
        if(result.status == 0) {
          this.field.setting.dataSource = result.data.dataSource;
          this.field.setting.maxDeep = result.data.maxDeep;
          this.field.defaultValue = result.data.defaultValue.join(',');
        }
      })
    }
  }
}
</script>