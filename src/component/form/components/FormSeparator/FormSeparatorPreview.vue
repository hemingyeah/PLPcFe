<template>
  <div class="form-preview-group" @click="choose">
    <div class="form-design-sparator"><span v-if="field.displayName">{{field.displayName}}</span></div>
  </div>
</template>

<script>
export default {
  name: 'form-sparator-preview',
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
.form-design-sparator{
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
