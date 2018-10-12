<template>
  <div class="form-preview-group form-attachment-preview" @click="choose">
    <label>{{field.displayName}} <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-preview-mock">
      <button type="button" class="form-attachment-preview-upload">
        <i class="iconfont icon-upload"></i> 点击上传
      </button>
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
.form-attachment-preview-upload{
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  padding: 3px 10px;
  line-height: 24px;
  border-radius: 2px;
  border: none;
  outline: none;
  color: #fff;
  background-color: $color-primary;

  user-select: none;
}

.form-attachment-preview-placeholder{
  width: 100%;
  color: #9a9a9a;
  margin: 0;
  line-height: 24px;
  @include text-ellipsis(); 
}
</style>
