<template>
  <div class="form-textarea">
    <textarea :id="`form_${field.fieldName}`" @input="input" :value="value" rows="3"></textarea>
  </div>
</template>

<script>
export default {
  name: 'form-textarea',
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
    input(event){
      let oldValue = null;
      let newValue = event.target.value;
      this.$emit('input', {newValue, oldValue, field: this.field});
    }
  }
}
</script>

<style lang="scss">
.form-textarea{
  width: 100%;

  textarea{
    width: 100%;
  }
}
</style>

