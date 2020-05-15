<template>
  <div class="form-preview-group">
    <label>{{field.displayName}} <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-preview-mock">
      <p class="form-preview-control form-preview-withIcon">
        <i class="iconfont icon-triangle-down"></i>
      </p>
      <p class="form-preview-control" style="margin-top: 10px">{{field.placeHolder}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-address-preview',
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

