<template>
  <div class="form-setting-panel">
    <h3>系统字段 -- {{field.displayName}}</h3>
    <p class="form-design-warning" style="margin-bottom: 5px">该字段为系统内置字段，暂不支持修改、删除。</p>
    <!--<div class="form-setting-group">-->
      <!--<textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="updateForDom" :maxlength="placeholderMaxLength"></textarea>-->
    <!--</div>-->
    <div class="form-setting-group">
      <el-checkbox :value="field.setting.phoneUnique" @input="update($event, 'phoneUnique', true)">验证客户联系人电话号码是否重复</el-checkbox>
    </div>
    <p class="form-select-logical-tip">开启后，将验证客户联系人号码是否已经存在并提示</p>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';

export default {
  name: 'customer-phone-extend-setting',
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
    update(value, prop, isSetting){
      this.$emit('input', {value, prop, isSetting})
    }
  }

}
</script>
