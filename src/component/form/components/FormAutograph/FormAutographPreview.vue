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
export default {
  name: 'form-autograph-preview',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    setting: {
      type: Object,
      default: () => ({})
    }
  }
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
