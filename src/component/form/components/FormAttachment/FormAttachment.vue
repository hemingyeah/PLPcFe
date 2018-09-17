<template>
  <div>
    <base-upload @input="input" :value="value"></base-upload>
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
