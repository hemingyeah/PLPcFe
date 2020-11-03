<template>
  <div class="form-attachment">
    <base-upload @input="input" :isWaterMark="isWaterMark" :value="value" :for-id="`form_${field.fieldName}`" :placeholder="placeHolder"></base-upload>
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-attachment',
  mixins: [FormMixin],
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isWaterMark: false
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
      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);
    }
  },
  mounted() {
    let { setting } = this.field;
    // 图片是否添加水印
    this.isWaterMark = !!setting.isAddWatermark;
  }
}
</script>

<style lang="scss">
.form-attachment{
  width: 100%;

  .base-upload-btn{
    padding: 7px 12px;
    font-size: $font-size-small;
    border-radius: $button-radius-base;
    border-color: $color-primary;
  }
}
</style>
