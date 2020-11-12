<template>
  <div class="form-preview-group form-preview-divider">
    <div class="form-design-separator">
      <span v-if="field.displayName">{{field.displayName}}</span>
      <i class="iconfont icon-fdn-select"></i>

    </div>
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
    color: $color-primary;
    height: 32px;
    line-height: 32px;
    padding: 0 10px;
    display: flex;
    justify-content: space-between;
    span{
      margin-left: 12px;
    }
    .iconfont{
      margin-right: 10px;
    }
  }
}

</style>
