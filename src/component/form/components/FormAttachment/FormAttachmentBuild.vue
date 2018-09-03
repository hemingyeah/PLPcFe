<template>
  <div>
    <div>{{field.displayName}}</div>
    <div>
      <base-upload @input="input"></base-upload>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-attachment-build',
  props: {
    field: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    input(newValue) {
      let oldValue = null;
      this.$emit('input', {newValue, oldValue});
    }
  }
}
</script>
