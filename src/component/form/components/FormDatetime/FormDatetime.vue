<template>
  <div class="form-datetime">
    <el-date-picker
      :id="`form_${field.fieldName}`"
      type="datetime"
      value-format="yyyy-MM-dd HH:mm:ss"
      placeholder="选择日期时间"
      :value="value" @input="choose"/>
  </div>
</template>

<script>
export default {
  name: "form-datetime",
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    choose(newValue){
      let oldValue = null;
      this.$emit('input', {newValue, oldValue, field: this.field});
    }
  }
}
</script>

<style lang="scss">
.form-datetime{
  width: 100%;

  .el-date-editor{
    width: 100%;
  }
}
</style>
