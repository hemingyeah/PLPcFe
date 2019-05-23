<template>
  <div class="form-setting-panel">
    <h3>系统字段 -- {{setting.name}}</h3>
    <div class="form-setting-group">
      <textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="updateForDom" maxlength="128"></textarea>
    </div>
    <div class="form-setting-group">
      <el-checkbox :value="field.isNull" @input="update($event, 'isNull')" :true-label="0" :false-label="1">必填</el-checkbox>
    </div>

    <!-- TODO: 支持设置默认地址 -->
    <!-- <h3>默认地址</h3>
    <select/> -->
  </div>
</template>

<script>
export default {
  name: 'customer-address-extend-setting',
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