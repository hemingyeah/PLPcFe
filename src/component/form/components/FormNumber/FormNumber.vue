<template>
  <div class="form-number">
    <input :id="`form_${field.fieldName}`" type="number" @input="input" :value="value">
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
    value: String
  },
  methods: {
    input(event){
      let oldValue = null;
      let newValue = event.target.value;
      this.$emit('input', {newValue, oldValue, field: this.field});
    }
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
