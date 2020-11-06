<template>
  <div class="form-setting-panel">
    <!-- start 标题 -->
    <form-title-setting
      :field="field"
      :setting="setting"
      @input="updateForDom"
    ></form-title-setting>
    <!-- end 标题 -->
    <p class="form-separator-setting-tips">您可以在表单中放置一个分割线方便分段显示信息，让页面更加直观。</p>
    <!--如果分割线在表单的最后，那么在生成表单和展示表单数据时该字段将会被忽略。-->
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-separator-setting',
  mixins: [SettingMixin],
  props: settingProps,
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop)
    },
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
