<template>
  <div class="form-design-setting-panel">
    <h3>基础设置</h3>
    <div class="form-design-form-group">
      <input type="text" placeholder="请输入字段标题" data-prop="displayName" :value="field.displayName" @input="update">
    </div>
    <div class="form-design-form-group">
      <textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="update"></textarea>
    </div>
    <div class="form-design-form-group">
      <label><input type="checkbox" :value="field.isNull == 0" @input="update" data-prop="isNull">是否必填</label>
      <label><input type="checkbox" :value="field.isSearch == 1" @input="update" data-prop="isSearch">是否搜索</label>
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
    }
  },
  methods: {
    update(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      if(prop == 'isNull') value = el.checked ? 0 : 1;
      if(prop == 'isSearch') value = el.checked ? 1 : 0;

      this.$emit('input', {value, prop})
    }
  }
}
</script>
