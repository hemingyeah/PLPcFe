<template>
  <div class="form-preview-group" @click="choose">
    <label>{{field.displayName}} <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-preview-mock">
      <p class="form-preview-control form-preview-withIcon">
        {{field.placeHolder}}
        <i class="iconfont icon-triangle-down"></i>
      </p>
      <p class="form-preview-control" style="margin-top: 10px"></p>
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
  },
  methods: {
    choose(){
      this.$emit('chooseField', this.field)
    }
  }
}
</script>

