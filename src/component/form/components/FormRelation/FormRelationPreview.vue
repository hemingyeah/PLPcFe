<template>
  <div class="form-preview-group">
    <label>{{ field.displayName }}
      <span class="form-preview-notNull" v-if="field.isNull == 0">*</span>
    </label>
    <div class="form-preview-mock">
      <p class="form-preview-control form-relation-preview-control">
        {{ field.placeHolder }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-relation-preview',
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
.form-relation-preview-control{
  background: #eee;
}
</style>
