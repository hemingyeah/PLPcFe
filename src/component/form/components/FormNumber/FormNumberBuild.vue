<template>
  <div>
    <div>{{field.displayName}}</div>
    <div><input type="number" @input="input"></div>
  </div>
</template>

<script>
export default {
  name: 'form-number-build',
  props: {
    field: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    input(event){
      let oldValue = null;
      let newValue = event.target.value;
      this.$emit('input', {newValue, oldValue});
    }
  }
}
</script>
