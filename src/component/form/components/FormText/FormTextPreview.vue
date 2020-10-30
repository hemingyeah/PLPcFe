<template>
  <div class="form-preview-group">
    <label>
      {{field.displayName}} 
      <span class="form-preview-notNull" v-if="showRequired">*</span>
      <i class="iconfont icon-yidongduanxianshi" v-if="field.isAppShow === 1"></i>
    </label>
    <div class="form-preview-mock">
      <p class="form-preview-control" :class="{'form-preview-withIcon': isCode}">
        {{field.placeHolder}}
        <i class="iconfont icon-scan" v-if="isCode"></i>
      </p>
    </div>
  </div>
</template>

<script>
import { previewProps } from '@src/component/form/components/props';

export default {
  name: 'form-text-preview',
  props: previewProps,
  computed: {
    /** 是否为扫码类型 */
    isCode(){
      return this.field.formType == 'code' || !!this.field.setting.isScanCode;
    },
    disabled() {
      let field = this.field;
      return field.setting && field.setting.defaultValueConfig && !!field.setting.defaultValueConfig.isNotModify;
    },
    showRequired() {
      let field = this.field;
      return field.isNull == 0 && !this.disabled;
    }
  }
}
</script>