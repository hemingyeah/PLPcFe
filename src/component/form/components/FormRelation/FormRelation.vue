<template>
  <input type="text" :value="value" @input="input" :placeholder="placeholder" :id="`form_${field.fieldName}`" v-if="seo" />
  <div class="form-text" v-else>
    <input type="text" :value="value" @input="input" :placeholder="placeholder" :id="`form_${field.fieldName}`" disabled />
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';
import FormRelationMixin from './FormRelationMixin.js'
export default {
  name: 'form-relation',
  mixins: [FormMixin, FormRelationMixin],
  props: {
    value: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.form-text{
  width: 100%;

  input{
    width: 100%;
    background: #eee;
  }
}
</style>

