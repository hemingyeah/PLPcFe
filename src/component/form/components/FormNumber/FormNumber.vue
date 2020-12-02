<template>
  <div class="form-number">
    <input 
      autocomplete="off"
      ref="input" 
      type="number" 
      :id="`form_${field.fieldName}`"
      :placeholder="placeholder" 
      :value="value"
      @input="input"
      :disabled="disabled"
    >
  </div>
</template>

<script>

import FormMixin from '@src/component/form/mixin/form';
import { FORM_FIELD_TEXT_MAX_LENGTH } from '@src/model/const/Number.ts';

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
    }
  },
  watch: {
    // native input value is set explicitly
    // do not use v-model / :value in template
    nativeInputValue() {
      this.setNativeInputValue();
    },
  },
  mounted() {
    const InputEl = this.$refs.input;

    InputEl.addEventListener('paste', this.pasteEventHandler)
  },
  beforeDestroy() {
    this.$refs.input.removeEventListener('paste', this.pasteEventHandler);
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
    pasteEventHandler(event) {
      try {
        let number = event.clipboardData.getData('text')
        let newValue = number
        
        if (number.length > FORM_FIELD_TEXT_MAX_LENGTH) {
          newValue = number.slice(0, FORM_FIELD_TEXT_MAX_LENGTH)
        }

        this.$emit('update', { newValue, field: this.field });
        this.$emit('input', newValue);
        event.preventDefault(); //阻止粘贴默认事件造成，复制2次的问题
      } catch (error) {
        console.warn('form-number: paste -> error', error)
      }
    }
  }
}
</script>

<style lang="scss">
.form-number{
  width: 100%;
  input{
    width: 100%;
    &:disabled{
      -webkit-text-fill-color: #b2b2b2;
    }
  }
}
</style>
