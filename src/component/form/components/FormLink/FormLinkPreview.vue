<template>
  <div class="form-preview-group">
    <label>{{field.displayName}} <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-preview-mock">
      <p class="form-preview-control" :class="{'form-preview-withIcon': isCode}">
        {{field.placeHolder}}
        <i class="iconfont icon-scan" v-if="isCode"></i>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-link-preview',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    setting: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    /** 是否为扫码类型 */
    isCode(){
      return this.field.formType == 'code';
    }
  }
}
</script>