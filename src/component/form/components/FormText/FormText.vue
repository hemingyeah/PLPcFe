<template>
  <div class="form-text">
    <input
      type="text"
      :value="value"
      @input="input"
      :placeholder="placeholder"
      :id="`form_${field.fieldName}`"/>
  </div>
</template>

<script>
  import FormMixin from '../FormMixin';

export default {
  name: 'form-text',
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
