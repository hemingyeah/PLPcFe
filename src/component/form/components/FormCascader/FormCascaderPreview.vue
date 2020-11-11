<template>
  <div class="form-preview-group">
    <label>
      {{field.displayName}} 
      <span class="form-preview-notNull" v-if="field.isNull == 0">*</span>
      <i class="iconfont icon-yidongduanxianshi" v-if="field.isAppShow === 1"></i>
    </label>
    <div class="form-preview-mock">
      <p class="form-preview-control form-preview-withIcon">
        {{field.placeHolder}}
        <i class="iconfont icon-fdn-select"></i>
      </p>
    </div>
  </div>
</template>

<script>
import { previewProps } from '@src/component/form/components/props';

export default {
  name: 'form-cascader-preview',
  props: previewProps
}
</script>

