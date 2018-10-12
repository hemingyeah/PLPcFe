<template>
  <div class="form-preview-group form-textarea-preview" @click="choose">
    <label>{{field.displayName}} <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-preview-mock">
      <p class="form-preview-control">{{field.placeHolder}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-textarea-preview',
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
  methods: {
    choose(){
      this.$emit('chooseField', this.field)
    }
  }
}
</script>

<style lang="scss">
.form-textarea-preview{
  .form-preview-control{
    height: 92px;
    white-space: normal;
  }
}
</style>
