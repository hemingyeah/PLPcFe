<template>
  <div class="form-preview-group">
    <label>
      {{field.displayName}} 
      <span class="form-preview-notNull" v-if="showRequired">*</span>
      <i class="iconfont icon-yidongduanxianshi" v-if="field.isAppShow === 1"></i>
    </label>
    <div class="form-preview-mock">
      <p class="form-preview-control">{{field.placeHolder}}</p>
    </div>
  </div>
</template>

<script>
import { previewProps } from '@src/component/form/components/props';

export default {
  name: 'form-number-preview',
  props: previewProps,
  computed: {
    disabled() {
      let field = this.field;
      return field.disabled ||
        (field.setting && field.setting.defaultValueConfig && !!field.setting.defaultValueConfig.isNotModify && !!field.defaultValue);
    },
    showRequired() {
      let field = this.field;
      return field.isNull == 0 && !this.disabled;
    }
  }
}
</script>

