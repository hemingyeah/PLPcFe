<template>
  <div class="form-number">
    <input :id="`form_${field.fieldName}`" type="number" @input="input" :value="value" :placeholder="placeholder">
  </div>
</template>

<script>
  import FormMixin from '../FormMixin';

export default {
  name: 'form-number',
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
    value: String
  },
  methods: {
    input(event){
      let oldValue = null;
      let newValue = event.target.value;
      if (newValue === '') {
        this.$nextTick(() => {
          event.target.value = '';
        });
      }
      this.$emit('input', {newValue, oldValue, field: this.field});
    },
  },
}
</script>

<style lang="scss">
.form-number{
  width: 100%;
   input{
     width: 100%;
   }
}
</style>
