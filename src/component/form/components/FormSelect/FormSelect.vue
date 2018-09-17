<template>
  <div class="form-select">
    <el-select 
      :id="`form_${field.fieldName}`"
      placeholder="请选择"
      clearable
      :multiple="isMulti"
      :value="value" @input="input">
      <el-option
        v-for="item in options" :key="item"
        :label="item" :value="item">
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'form-select',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: [String, Array]
  },
  computed: {
    isMulti(){
      let setting = this.field.setting || {}
      return setting.isMulti;
    },
    options(){
      let setting = this.field.setting || {};
      return setting.dataSource || [];
    }
  },
  methods: {
    input(newValue){
      let oldValue = null;
      this.$emit('input', {newValue, oldValue, field: this.field})
    }
  }
}
</script>


<style lang="scss">
.form-select{
  width: 100%;

  .el-select{
    width: 100%;
  }
}
</style>
