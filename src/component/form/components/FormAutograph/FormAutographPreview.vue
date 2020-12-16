<template>
  <div class="form-preview-group form-preview-signature">
    <label>{{field.displayName}} <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-preview-mock">
      <p class="form-preview-control form-autograph-preview">
        {{field.placeHolder}}
      </p>
    </div>
  </div>
</template>

<script>
import { previewProps } from '@src/component/form/components/props';

export default {
  name: 'form-autograph-preview',
  props: previewProps
}
</script>
<style lang="scss" scoped>
.form-preview-signature{
  flex-direction: column;
  .form-autograph-preview{
    height: 80px;
    line-height: 80px;
    border: 1px dashed #e0e1e2;
    text-align: center;
    margin-top: 10px;
  }
}

</style>
