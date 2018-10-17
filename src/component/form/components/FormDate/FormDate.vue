<template>
  <div class="form-date">
    <el-date-picker
      :id="`form_${field.fieldName}`"
      type="date" readonly
      value-format="yyyy-MM-dd"
      :placeholder="placeholder"
      :value="value" @input="choose"/>
  </div>
</template>

<script>
export default {
  name: "form-date",
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
      this.$el.dispatchEvent(new CustomEvent('form.validate', {bubbles: true}));
    },
    getValue(){
      return this.value;
    }
  },
  mounted(){
    //触发注册事件，用于注册字段到外层formitem组件，和formbuilder组件
    let params = {value: this.getValue, fieldName: this.field.fieldName};
    let event = new CustomEvent('form.add.field', {detail: params, bubbles: true});
    this.$nextTick(() => this.$el.dispatchEvent(event));
  },
  destroyed(){
    //注册解绑事件，用于解绑组件
    let params = {fieldName: this.field.fieldName}
    let event = new CustomEvent('form.remove.field', {detail: params, bubbles: true});
    this.$el.dispatchEvent(event)
  }
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