<template>
  <div class="form-preview-group">
    <label>{{field.displayName}} <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-preview-mock">
      <p class="form-preview-control">{{field.placeHolder}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-serviceterm-preview',
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
.form-design-separator{
  background-color: #eef8f8;
  color: #55B7B4;
  height: 30px;
  line-height: 30px;
  width: calc(100% + 20px);
  margin-left: -10px;
  margin-right: -10px;

  padding: 0 10px;
}
</style>
