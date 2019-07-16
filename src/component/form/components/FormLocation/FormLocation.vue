<template>
  <div class="form-location">
    <div :id="`form_${field.fieldName}`" class="form-item__text">该位置类型字段仅支持在移动端上传</div>
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-location',
  mixins: [FormMixin],
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: [String, Object],
      default: () => ({})
    }
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
.form-location{
  width: 100%;
    input{
      width: 100%;
  }
}
</style>