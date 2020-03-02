<template>
  <div class="form-text">
    <input type="text" :value="value" @input="input" :placeholder="placeholder" :id="`form_${field.fieldName}`" disabled/>
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';
export default {
  name: 'form-customer',
  mixins: [FormMixin],
  props: {
    value: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss">
.form-text{
  width: 100%;

  input{
    width: 100%;
  }
}
</style>
