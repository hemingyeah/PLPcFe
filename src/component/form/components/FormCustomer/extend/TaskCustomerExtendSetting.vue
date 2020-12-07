<template>
  <div class="form-setting-panel task-customer-setting">
    <!-- start 标题 -->
    <div class="form-setting-group form-common-setting">
      <h3 class="form-setting-panel-title">{{ field.displayName }}</h3>
      <div class="form-design-warning">该字段为系统内置字段，暂不支持修改、删除。</div>
    </div>
    <!-- end 标题 -->

    <!-- start 关联项 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">关联项</h4>
      <div class="form-item-box">
        <el-checkbox :value="field.setting.customerOption.address" @input="updateOptions($event, 'address')">地址</el-checkbox>
      </div>
      <div class="form-item-box">
        <el-checkbox :value="field.setting.customerOption.linkman" @input="updateOptions($event, 'linkman')">联系人</el-checkbox>
      </div>
      <div class="form-item-box">
        <el-checkbox :value="field.setting.customerOption.product" @input="updateOptions($event, 'product')">产品</el-checkbox>
        <el-checkbox :value="field.setting.customerOption.productNotNull" @input="updateOptions($event, 'productNotNull')" :disabled="!field.setting.customerOption.product">产品必填</el-checkbox>
      </div>
    </div>
    <!-- end 关联项 -->
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';

export default {
  name: 'task-customer-extend-setting',
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
    updateForDom(event) {
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop);
    },
    updateOptions(value, prop, isSetting = false) {
      this.$emit('updateOptions', {value, prop, isSetting});
    }
  }
}
</script>

<style lang="scss" scoped>
.task-customer-setting {
  .form-design-warning {
    margin-bottom: 24px;
  }
}
</style>
