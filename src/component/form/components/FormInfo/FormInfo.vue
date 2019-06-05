<template>
  <div class="form-info">
    <input
      type="text"
      :value="value"
      @input="input"
      :placeholder="placeholder"
      :id="`form_${field.fieldName}`"
      autocomplete="off"
    />
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-info',
  mixins: [FormMixin],
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    input(event) {
      let oldValue = null;
      let newValue = event.target.value;
      if (newValue === '') {
        this.$nextTick(() => {
          event.target.value = '';
        });
      }
      this.$emit('update', { newValue, oldValue, field: this.field });
      this.$emit('input', newValue);
    }
  }
}
</script>

<style lang="scss">
.form-info {
  width: 100%;
  input {
    width: 100%;
  }
}
</style>
