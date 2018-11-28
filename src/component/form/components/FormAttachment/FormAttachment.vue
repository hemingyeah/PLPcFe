<template>
  <div class="form-attachment">
    <base-upload @input="input" :value="value" :for-id="`form_${field.fieldName}`" placeholder="请上传附件"></base-upload>
  </div>
</template>

<script>
import FormMixin from '../FormMixin';

export default {
  name: 'form-attachment',
  mixins: [FormMixin],
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    input(newValue) {
      let oldValue = null;
      this.$emit('input', {newValue, oldValue, field: this.field});
    },
  },
}
</script>

<style lang="scss">
.form-attachment{
  width: 100%;
}
</style>
