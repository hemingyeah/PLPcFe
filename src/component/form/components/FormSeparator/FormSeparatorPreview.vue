<template>
  <div class="form-preview-group form-preview-divider">
    <div class="form-design-separator"><span v-if="field.displayName">{{field.displayName}}</span></div>
  </div>
</template>

<script>
import { previewProps } from '@src/component/form/components/props';

export default {
  name: 'form-separator-preview',
  props: previewProps
}
</script>

<style lang="scss" scoped>
.form-preview-divider{
  padding: 0;
  .form-design-separator{
    background-color: #eef8f8;
    color: #55B7B4;
    height: 32px;
    line-height: 32px;
    width: calc(100% + 20px);
    margin-left: -10px;
    margin-right: -10px;

    padding: 0 10px;
    span{
      margin-left: 12px;
    }
  }
}

</style>
