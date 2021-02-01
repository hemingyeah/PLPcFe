<template>
  <div class="form-setting-panel">
    <!-- start 标题 -->
    <h3 class="form-setting-panel-title">{{field.displayName}}</h3>   
    <!-- end 标题 -->
    <p class="form-design-warning">该字段为系统内置字段，暂不支持修改、删除。</p>
    <div class="form-setting-group">
      <el-checkbox :value="field.setting.customerNameDuplicate" @input="update($event, 'customerNameDuplicate', true)">允许客户名称重复</el-checkbox>
    </div>
    <p class="form-select-logical-tip">开启后，将不验证客户名称的唯一性</p>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'customer-name-extend-setting',
  mixins: [SettingMixin],
  props: settingProps,
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;

      this.update(value, prop)
    },
    update(value, prop, isSetting){
      this.$emit('input', {value, prop, isSetting})
    }
  }
}
</script>
