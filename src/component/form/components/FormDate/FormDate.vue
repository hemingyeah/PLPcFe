<template>
  <div class="form-date">
    <el-date-picker
      :id="`form_${field.fieldName}`"
      type="date" 
      prefix-icon="iconfont icon-fd-date"
      :editable="false"
      clearable
      :placeholder="placeholder"
      value-format="yyyy-MM-dd"
      :value="value" @input="choose"/>
  </div>
</template>

<script>
import FormMixin from '../FormMixin';

export default {
  name: "form-date",
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
.form-date{
  width: 100%;
  .el-input__inner{
    cursor: pointer;
    
    &:hover{
      border-color: #00ac97;
    }
  }

  .el-date-editor{
    width: 100%;
  }
}
</style>