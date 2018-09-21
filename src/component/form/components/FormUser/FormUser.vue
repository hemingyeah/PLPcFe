<template>
  <div class="form-user">
    <input :id="`form_${field.fieldName}`" readonly @click="choose" :value="displayName">
  </div>
</template>

<script>
export default {
  name: 'form-user',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: Object
  },
  computed: {
    displayName(){
      let user = this.value || {};
      return user.displayName
    }
  },
  methods: {
    choose(){
      let options = {
        title: `请选择${this.field.displayName}`,
        max: 1
      };
      return this.$fast.contact.choose('dept', options).then(result => {
        if(result.status == 0){
          let oldValue = null;
          this.$emit('input', {newValue: result.data, oldValue, field: this.field});
          this.$el.dispatchEvent(new CustomEvent('form.validate', {bubbles: true}));
        }
      })
      .catch(err => console.error(err))
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
.form-user{
  width: 100%;

  input{
    width: 100%;
    cursor: pointer;
  }
}
</style>
