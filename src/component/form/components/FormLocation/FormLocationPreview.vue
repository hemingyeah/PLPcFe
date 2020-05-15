<template>
  <div class="form-preview-group">
    <label>{{field.displayName}} <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-preview-mock">
      <p class="form-preview-control form-preview-withIcon">
        {{field.placeHolder}}
        <i class="iconfont icon-fd-location"></i>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-location-preview',
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
