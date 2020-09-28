<template>
  <div class="form-setting-panel">
    <h3>基础字段 -- {{setting.name}}</h3>
    <div class="form-setting-group">
      <input type="text" placeholder="请输入字段标题" data-prop="displayName" :value="field.displayName" @input="updateForDom" :maxlength="nameMaxLength">
    </div>
    <div class="form-setting-group">
      <textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="updateForDom" :maxlength="placeholderMaxLength"></textarea>
    </div>
    <div class="form-setting-group">
      <el-checkbox :value="field.isNull" @input="update($event, 'isNull')" :true-label="0" :false-label="1">必填</el-checkbox>
      <el-checkbox :value="field.isSearch" @input="update($event, 'isSearch')" :true-label="1" :false-label="0">搜索</el-checkbox>
      <mobile-show-setting v-if="isTaskMode" :field="field" :fields="fields" @input="update"></mobile-show-setting>
    </div>
    <h3>选项</h3>
    <div class="form-setting-group form-select-setting-operation">
      <button type="button" class="btn-text" @click="open">配置选项</button>
    </div>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import Cascader from './components/index';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-cascader-setting',
  mixins: [SettingMixin],
  props: settingProps,
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop);
    },
    update(value, prop){
      this.$emit('input', {value, prop});
    },
    open(){
      let source = this.field.setting.dataSource || [];
      let maxDeep = this.field.setting.maxDeep || 2;
      let defaultValue = (this.field.defaultValue && this.field.defaultValue.split(',')) || [];

      Cascader.setting(source, maxDeep, defaultValue).then(result => {
        if(result.status == 0) {
          this.field.setting.dataSource = result.data.dataSource;
          this.field.setting.maxDeep = result.data.maxDeep;
          this.field.defaultValue = result.data.defaultValue.join(',');
        }
      })
    }
  }
}
</script>