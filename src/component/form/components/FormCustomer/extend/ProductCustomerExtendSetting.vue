<template>
  <div class="form-setting-panel">
    <!-- start 标题 -->
    <h3 class="form-setting-panel-title">{{field.displayName}}</h3>   
    <!-- end 标题 -->
    <p class="form-design-warning" style="margin-bottom: 5px">该字段为系统内置字段，暂不支持修改、删除。</p>
    <h3>关联项</h3>
    <div class="form-setting-group">
      <el-checkbox :value="field.setting.customerOption.linkman" @input="updateOptions($event, 'linkman')">联系人</el-checkbox>
      <el-checkbox :value="field.setting.customerOption.linkmanNotNull" @input="updateOptions($event, 'linkmanNotNull')" :disabled="!field.setting.customerOption.linkman">联系人必填</el-checkbox>
    </div>
    <div class="form-setting-group">
      <el-checkbox :value="field.setting.customerOption.address" @input="updateOptions($event, 'address')">地址</el-checkbox>
      <el-checkbox :value="field.setting.customerOption.addressNotNull" @input="updateOptions($event, 'addressNotNull')" :disabled="!field.setting.customerOption.address">地址必填</el-checkbox>
    </div>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';

export default {
  name: 'product-customer-extend-setting',
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
    updateOptions(value, prop, isSetting = false){
      this.$emit('updateOptions', {value, prop, isSetting})
    }
  }
}
</script>
