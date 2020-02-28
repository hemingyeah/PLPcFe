<template>
  <div class="form-setting-panel">
    <h3>基础字段 -- {{setting.name}}</h3>
    <div class="form-setting-group">
      <p class="form-separator-setting-tips">服务项目组件可以在工单完成时选择已维护的标准服务项目，并生成价格。</p>
      <div class="form-setting-group">
        <textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="updateForDom" :maxlength="placeholderMaxLength"></textarea>
      </div>
      <div class="form-setting-group">
        <el-checkbox :value="field.isNull" @input="update($event, 'isNull')" :true-label="0" :false-label="1">必填</el-checkbox>
      </div>
    </div>
    
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';

export default {
  name: 'form-serviceterm-setting',
  mixins: [SettingMixin],
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    setting: {
      type: Object,
      default: () => ({})
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
      this.$emit('input', {value, prop});
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
</style>
