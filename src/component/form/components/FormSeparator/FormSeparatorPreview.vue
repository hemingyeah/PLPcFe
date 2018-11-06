<template>
  <div class="form-preview-group" @click="choose">
    <div class="form-design-sparator"><span>{{field.displayName}}</span></div>
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
  height: 16px;
  margin-top: 16px;
  border-top: 1px solid #ddd;
  width: 100%;
  text-align: center;

  span{
    height: 20px;
    line-height: 20px;   
    position: relative;
    top: -10px;
    background-color: #fff;
    padding: 0 5px;
  }
}
</style>
