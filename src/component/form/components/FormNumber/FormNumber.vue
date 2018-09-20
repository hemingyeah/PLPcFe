<template>
  <div class="form-number">
    <input :id="`form_${field.fieldName}`" type="number" @input="input" :value="value" :placeholder="placeHolder">
  </div>
</template>

<script>
export default {
  name: 'form-number',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    placeHolder: {
      type: String,
      default: ''
    },
    value: String
  },
  methods: {
    input(event){
      let oldValue = null;
      let newValue = event.target.value;
      if (newValue === '') {
        this.$nextTick(() => {
          event.target.value = '';
        });
      }
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
    console.log('mounted params', params);
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
.form-number{
  width: 100%;
   input{
     width: 100%;
   }
}
</style>
