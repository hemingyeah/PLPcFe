<template>
  <div class="form-setting-panel">
    <h3>基础字段 -- {{setting.name}}</h3>
    <div class="form-setting-group">
      <p class="form-separator-setting-tips">备件组件可以在工单完成时选择备件库中的备件直接管理核销出库，并生成价格。</p>
      <input type="text" placeholder="请输入标题" data-prop="displayName" :value="field.displayName" @input="update" :maxlength="nameMaxLength">
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
    update(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;

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
</style>
