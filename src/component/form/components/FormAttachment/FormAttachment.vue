<template>
  <div class="form-attachment">
    <base-upload @input="input" :value="value" :for-id="`form_${field.fieldName}`"></base-upload>
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
    }
  }
}
</script>

<style lang="scss">
.form-attachment{
  width: 100%;
}
</style>
