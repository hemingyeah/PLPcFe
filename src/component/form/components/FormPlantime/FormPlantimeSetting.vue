<template>
  <div class="form-setting-panel">
    <h3>系统字段 -- {{setting.name}}</h3>
    <div class="form-setting-group">
      <textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="updateForDom" :maxlength="placeholderMaxLength"></textarea>
    </div>
    <div class="form-setting-group">
      <el-checkbox :value="field.isNull" @input="update($event, 'isNull')" :true-label="0" :false-label="1">必填</el-checkbox>
    </div>
    <h3>选项</h3>
    <div class="form-setting-group"> 
      <el-select v-model="field.setting.dateType"> 
        <el-option label="日期" value="date"></el-option>
        <el-option label="日期+时间" value="dateTime"></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';

export default {
  name: 'form-plantime-setting',
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
    update(value, prop){      
      this.$emit('input', {value, prop})     
    }
  }
}
</script>