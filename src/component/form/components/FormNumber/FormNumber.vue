<template>
  <div class="form-number">
    <input :id="`form_${field.fieldName}`" type="number" @input="input" :value="value" :placeholder="placeholder" autocomplete="off">
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-number',
  mixins: [FormMixin],
  props: {
    value: [String, Number]
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
      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);
    }
  }
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
