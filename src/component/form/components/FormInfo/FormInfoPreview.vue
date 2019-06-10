<template>
  <div class="form-preview-group form-info-preview">
    <label>{{ field.displayName }}<span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-item__text">
      {{ field.placeHolder }}
      <!-- <p class="form-preview-control">{{ field.placeHolder }}</p> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-info-preview',
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

<style lang="scss">
.form-info-preview {
  label {
    flex-shrink: 0;
  }
  .form-item__text {
    word-break: break-all;
  }
}
</style>
