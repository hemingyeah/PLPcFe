<template>
  <div class="form-preview-group form-attachment-preview">
    <label>{{field.displayName}} <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-preview-mock">
      <p class="form-attachment-preview-placeholder">{{field.placeHolder}}
        <i class="iconfont icon-fdn-attachment"></i>
      </p>
    </div>
  </div>
</template>

<script>
import { previewProps } from '@src/component/form/components/props';

export default {
  name: 'form-attachment-preview',
  props: previewProps
}
</script>

<style lang="scss">
.form-attachment-preview .form-preview-mock{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.form-attachment-preview-placeholder{
  flex: 1;
  color: #9a9a9a;
  margin: 0 0 0 8px;
  font-size: 14px;
  @include text-ellipsis(); 
}

.form-attachment-preview .btn{
  padding: 4px 12px;
}
</style>
