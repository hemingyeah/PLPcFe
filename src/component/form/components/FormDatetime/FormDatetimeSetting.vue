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
      <input type="text" placeholder="[必填] 请输入字段标题" data-prop="displayName" :value="field.displayName" @input="updateForDom" :maxlength="nameMaxLength">
    </div>
    <div class="form-setting-group">
      <textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="updateForDom" :maxlength="placeholderMaxLength"></textarea>
    </div>
    <div class="form-setting-group">
      <el-checkbox :value="field.isNull" @input="update($event, 'isNull')" :true-label="0" :false-label="1">必填</el-checkbox>
      <el-checkbox :value="field.isSearch" @input="update($event, 'isSearch')" :true-label="1" :false-label="0">搜索</el-checkbox>
      <mobile-show-setting v-if="isTaskMode" :field="field" :fields="fields" @input="update"></mobile-show-setting>
    </div>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-datetime-setting',
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
      this.$emit('input', {value, prop})
    }
  }
}
</script>