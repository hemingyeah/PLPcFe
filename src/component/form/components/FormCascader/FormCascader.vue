<template>
  <div class="form-cascader">
    <el-cascader 
      :options="options" :props="props" 
      :value="value" @input="inputForValue"
      clearable/>
  </div>
</template>

<script>
import form from '../../mixin/form';

export default {
  name: 'form-cascader',
  mixins: [form],
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data(){
    return {
      props: {
        value: 'value',
        label: 'value',
        children: 'children',
      },
      options: this.field.setting.dataSource || []
    }
  }
}
</script>

<style lang="scss">
.form-cascader .el-cascader{
  width: 100%;
}
</style>

