<template>
  <div class="form-setting-panel">
    <!-- start 标题 -->
    <form-title-setting
      :field="field"
      :setting="setting"
      @input="updateForDom"
    ></form-title-setting>
    <!-- end 标题 -->
    <div class="form-setting-group">
      <p class="form-separator-setting-tips">备件组件可以在工单完成时选择备件库中的备件直接管理核销出库，并生成价格。</p>
      <!-- start 描述信息 -->
      <form-describe-setting
        :field="field"
        @input="updateForDom"
      ></form-describe-setting>
      <!-- end 描述信息 -->
      <div class="form-setting-group">
        <el-checkbox :value="field.isNull" @input="update($event, 'isNull')" :true-label="0" :false-label="1">必填</el-checkbox>
      </div>
    </div>
    
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-sparepart-setting',
  mixins: [SettingMixin],
  props: settingProps,
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop)
    },
    update(value, prop){
      this.$emit('input', {value, prop});
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
