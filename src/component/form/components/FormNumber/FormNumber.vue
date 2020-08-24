<template>
  <div class="form-number">
    <input :id="`form_${field.fieldName}`" ref="input" type="number" @input="input" :value="value" :placeholder="placeholder" autocomplete="off">
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
  computed: {
    getInput() {
      return this.$refs.input || this.$refs.textarea;
    },
    nativeInputValue() {
      return this.value === null || this.value === undefined ? '' : String(this.value);
    },
  },
  watch: {
    // native input value is set explicitly
    // do not use v-model / :value in template
    nativeInputValue() {
      this.setNativeInputValue();
    },
  },
  methods: {
    input(event){
      let oldValue = null;
      let newValue = event.target.value;
      
      if(newValue == this.nativeInputValue) return;

      if (newValue === '') {
        this.$nextTick(() => {
          event.target.value = '';
        });
      }

      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);
    },
    setNativeInputValue() {
      const input = this.getInput;

      if (!input) return;
      if (input.value === this.nativeInputValue) return;

      input.value = this.nativeInputValue;
    },
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
