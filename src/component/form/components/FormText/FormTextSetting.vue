<template>
  <div class="form-setting-panel">
    <h3>基础字段 -- {{setting.name}}</h3>
    <div class="form-setting-group">
      <input type="text" placeholder="[必填] 请输入字段标题" data-prop="displayName" :value="field.displayName" @input="updateForDom" maxlength="6">
    </div>
    <div class="form-setting-group">
      <textarea placeholder="请在此添加描述信息" rows="4" data-prop="placeHolder" :value="field.placeHolder" @input="updateForDom" maxlength="128"></textarea>
    </div>
    <div class="form-setting-group">
      <el-checkbox :value="field.isNull" @input="update($event, 'isNull')" :true-label="0" :false-label="1">必填</el-checkbox>
      <el-checkbox :value="field.isSearch" @input="update($event, 'isSearch')" :true-label="1" :false-label="0">搜索</el-checkbox>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-text-setting',
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
