<template>
  <div class="form-preview-group form-textarea-preview">
    <label>{{field.displayName}} <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-preview-mock">
      <p class="form-preview-control">{{field.placeHolder}}</p>
    </div>
  </div>
</template>

<script>
import { previewProps } from '@src/component/form/components/props';

export default {
  name: 'form-textarea-preview',
  props: previewProps
}
</script>

<style lang="scss">
.form-textarea-preview{
  .form-preview-control{
    height: 92px;
    white-space: normal;
  }
}
</style>
