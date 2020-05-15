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
  // 13 取自 (.form-item-control .err-msg-wrap) min-height(10px) + padding-bottom(3px)
  // 10 取自 (.form-item label) padding-left: 10px
  padding: 0 0 13px 10px;
  .form-item__text {
    word-break: break-all;
    background-color: #FAFAFA;
    padding: 3px 5px;
  }
}
</style>
