<template>
  <div><input type="number" @input="input" :value="value"></div>
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
