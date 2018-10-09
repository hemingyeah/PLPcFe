<template>
  <div class="form-design-group form-design-textarea" @click="choose">
    <label>{{field.displayName}} <span class="form-design-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-design-mock">{{field.placeHolder}}</div>
  </div>
</template>

<script>
export default {
  name: 'form-textarea-preview',
  props: {
    field: {
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
.form-design-textarea{
  .form-design-mock{
    height: 92px;
  }
}
</style>
