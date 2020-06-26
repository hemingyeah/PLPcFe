<template>
  <div class="form-setting-panel">
    <h3>系统字段 -- {{ field.displayName }}</h3>
    <p class="form-design-warning">该字段为系统内置字段，暂不支持修改、删除。</p>
    <h3>关联项</h3>
    <div class="form-setting-group">
      <el-checkbox v-model="customerOption.address">地址</el-checkbox>
      <el-checkbox v-model="customerOption.linkman">联系人</el-checkbox>
      <el-checkbox v-model="customerOption.product">产品</el-checkbox>
      <el-checkbox v-model="customerOption.productNotNull" :disabled="!customerOption.product">产品必填</el-checkbox>
    </div>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting'
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-customer-setting',
  mixins: [SettingMixin],
  props: settingProps,
  computed: {
    customerOption() {
      return this.field.setting.customerOption || {}
    }
  },
  methods: {
    updateForDom(event) {
      let el = event.target
      let prop = el.dataset.prop
      let value = el.value
      this.update(value, prop)
    },
    update(value, prop) {
      this.$emit('input', { value, prop })
    }
  }
}
</script>