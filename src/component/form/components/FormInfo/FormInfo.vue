<template>
  <div class="form-info">
    <div class="form-item__text">{{ field.placeHolder }}</div>
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
  }
}
</script>

<style lang="scss">
.form-info {
  width: 100%;
  .form-item__text {
    word-break: break-all;
  }
}
</style>
