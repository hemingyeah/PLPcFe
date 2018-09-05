<template>
  <div>
    <div>{{field.displayName}}</div>
    <div><input type="number" @input="input" :value="value"></div>
  </div>
</template>

<script>
export default {
  name: 'form-number-build',
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
      this.$emit('input', {newValue, oldValue});
    }
  }
}
</script>
