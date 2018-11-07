<template>
  <div class="form-setting-panel">
    <h3>{{setting.name}}设置</h3>
    <div class="form-setting-group">
      <input type="text" placeholder="[必填] 请输入字段标题" data-prop="displayName" :value="field.displayName" @input="update" maxlength="6">
    </div>
    <p class="form-sparator-setting-tips">您可以在表单中放置一个分割线方便分段显示信息，让页面更加直观。</p>
    <!--如果分割线在表单的最后，那么在生成表单和展示表单数据时该字段将会被忽略。-->
  </div>
</template>

<script>
export default {
  name: 'form-sparator-setting',
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
.form-sparator-setting-tips{
  margin-top: 10px;
  padding: 10px;
  border-radius: 2px;
  background-color: #fdf6ec;
  color: #e6a23c;
}
</style>
