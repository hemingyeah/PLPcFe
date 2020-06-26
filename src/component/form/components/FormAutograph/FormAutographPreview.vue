<template>
  <div class="form-preview-group">
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
.form-autograph-preview{
    height: 200px !important;
    line-height: 200px !important;
    border: 1px dashed !important;
    text-align: center;
}
</style>
