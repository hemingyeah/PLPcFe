<template>
  <div class="form-setting-panel">
    <h3>系统字段 -- {{ field.displayName }}</h3>
    <p class="form-design-warning" style="margin-bottom: 5px">该字段为系统内置字段，暂不支持修改、删除。</p>
    <div class="form-setting-group">
      <textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="updateForDom" :maxlength="placeholderMaxLength"></textarea>
    </div>
    <div class="form-setting-group">
      <el-checkbox :value="field.isNull" @input="update($event, 'isNull')" :true-label="0" :false-label="1">必填</el-checkbox>
      <el-checkbox :value="field.setting.serialNumberUnique" @input="update($event, 'serialNumberUnique', true)">唯一性验证</el-checkbox>
    </div>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';

export default {
  name: 'product-serial-number-extend-setting',
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
  computed: {
    isSystem() {
      return this.field.isSystem === 1;
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
