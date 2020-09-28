<template>
  <div class="form-autograph">
    <div :id="`form_${field.fieldName}`" class="form-item__text">签名字段暂不支持在pc端编辑</div>
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-autograph',
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

<style lang="scss" scoped>
.form-autograph{
  border: 1px solid #e0e1e2;
  width: 100%;
    .form-item__text{
      width: 100%;
      background-color: #FAFAFA;
      padding: 3px 5px;
      color: #ccc;
  }
}
</style>