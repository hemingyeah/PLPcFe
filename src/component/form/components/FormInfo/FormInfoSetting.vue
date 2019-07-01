<template>
  <div class="form-setting-panel">
    <h3>基础字段 -- {{ setting.name }}</h3>
    <div class="form-setting-group">
      <input type="text" placeholder="[必填] 请输入字段标题" data-prop="displayName" :value="field.displayName" @input="updateForDom" :maxlength="nameMaxLength">
    </div>
    <div class="form-setting-group">
      <textarea placeholder="请输入说明信息，说明信息只是在表单中增加内容描述，不能做任何输入。" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="updateForDom" :maxlength="placeholderMaxLength"></textarea>
    </div>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';

export default {
  name: 'form-info-setting',
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
    updateForDom (event) {
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
            
      this.update(value, prop);
    },
    update (value, prop) {
      this.$emit('input', { value, prop })
    }
  }
}
</script>

