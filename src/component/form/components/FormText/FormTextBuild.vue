<template>
  <div>
    <div>{{field.displayName}}</div>
    <div><input type="text" @input="input"/></div>
  </div>
</template>

<script>
export default {
  name: 'form-text-build',
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
      this.$emit('input', {newValue, oldValue});
    }
  }
}
</script>
