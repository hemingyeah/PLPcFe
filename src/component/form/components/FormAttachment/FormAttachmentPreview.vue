<template>
  <div class="form-preview-group form-attachment-preview" @click="choose">
    <label>{{field.displayName}} <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-preview-mock">
      <button type="button" class="btn btn-primary">点击上传</button>
      <p class="form-attachment-preview-placeholder">{{field.placeHolder}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-attachment-preview',
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
.form-attachment-preview .form-preview-mock{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.form-attachment-preview-placeholder{
  flex: 1;
  color: #9a9a9a;
  margin: 0 0 0 8px;
  font-size: 14px;
  @include text-ellipsis(); 
}
</style>
