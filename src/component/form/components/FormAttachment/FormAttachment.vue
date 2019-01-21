<template>
  <div class="form-attachment">
    <base-upload @input="input" :value="value" :for-id="`form_${field.fieldName}`" :placeholder="placeHolder"></base-upload>
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
  computed: {
    placeHolder() {
      return `${!this.field.isNull ? '[必填]' : ''}${this.field.placeHolder || '点击上传文件'}`;
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
