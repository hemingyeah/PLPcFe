<template>
  <div class="form-setting-panel">
    <h3>系统字段 -- {{field.displayName}}</h3>
    <p class="form-design-warning">该字段为系统内置字段，暂不支持修改、删除。</p>
    <div class="form-setting-group">
      <el-checkbox :value="field.setting.phoneUnique" @input="update($event, 'phoneUnique', true)">验证客户联系人电话号码是否重复</el-checkbox>
    </div>
    <p class="form-select-logical-tip">开启后，将验证客户联系人号码是否已经存在并提示</p>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'customer-phone-extend-setting',
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
