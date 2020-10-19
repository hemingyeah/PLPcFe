<template>
  <div class="form-setting-panel">
    <h3>基础字段 -- {{setting.name}}</h3>
    <div class="form-setting-group">
      <form-title-setting :field="field" :fields="fields" @input="updateForDom"></form-title-setting>
    </div>
    <div class="form-setting-group">
      <form-describe-setting :field="field" :fields="fields" @input="updateForDom"></form-describe-setting>
    </div>
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">校验</h4>
      <div class="form-item-box">
        <form-mandatory-setting :field="field" :fields="fields" @input="update"></form-mandatory-setting>
        <form-norepeat-setting :field="field" :fields="fields" @input="update"></form-norepeat-setting>
      </div>
    </div>
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">字段权限</h4>
      <div class="form-item-box">
        <mobile-show-setting v-if="isTaskMode" :field="field" :fields="fields" @input="update"></mobile-show-setting>
        <form-visibility-setting :field="field" :fields="fields" @input="update"></form-visibility-setting>
        <form-search-setting :field="field" :fields="fields" @input="update"></form-search-setting>
      </div>
    </div>
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">其他设置</h4>
      <div class="form-item-box">
        <form-public-setting :field="field" :fields="fields" @input="update"></form-public-setting>
        <form-scan-code :field="field" :fields="fields" @input="update"></form-scan-code>   
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
  data() {
    return {
      placeholder:'[必填] 请输入字段标题'
    }
  },
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      this.update(value, prop)
    },
    update(value, prop){
      this.$emit('input', {value, prop})
    }
  }
}
</script>

<style lang="scss">
.form-separator-setting-tips{
  margin-top: 10px;
  padding: 10px;
  border-radius: 2px;
  background-color: #fdf6ec;
  color: #e6a23c;
}
.form-setting-item{
  .form-item-title{
    margin-bottom: 0px;

  }
}
</style>
