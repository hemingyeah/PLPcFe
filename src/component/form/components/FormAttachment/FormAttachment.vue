<template>
  <div class="form-attachment">
    <base-upload @input="input" :value="value" :for-id="`form_${field.fieldName}`" placeholder="请上传附件"></base-upload>
  </div>
</template>

<script>
export default {
  name: 'form-attachment',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    input(newValue) {
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
.form-attachment{
  width: 100%;
}
</style>
