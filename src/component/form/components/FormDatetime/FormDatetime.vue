<template>
  <div class="form-datetime">
    <el-date-picker
      :id="`form_${field.fieldName}`"
      type="datetime"
      prefix-icon="iconfont icon-fd-datetime"
      value-format="yyyy-MM-dd HH:mm:ss"
      :placeholder="placeholder"
      :value="value" @input="choose"/>
  </div>
</template>

<script>
  import FormMixin from '../FormMixin';

export default {
  name: "form-datetime",
  mixins: [FormMixin],
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default: ''
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
    },
  },
}
</script>

<style lang="scss">
.form-datetime{
  width: 100%;

  .el-input__inner {
    cursor: pointer;
  }

  .el-date-editor{
    width: 100%;
  }
}
</style>
