<template>
  <div><textarea @input="input" :value="value"></textarea></div>
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
