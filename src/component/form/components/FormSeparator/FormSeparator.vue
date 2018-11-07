<template>
  <div class="form-sparator">
    <span>{{field.displayName}}</span>
  </div>
</template>

<script>
export default {
  name: 'form-separator',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: Object
  }
}
</script>

<style lang="scss">
.form-sparator{
  height: 16px;
  margin: 36px 0 20px 0;
  border-top: 1px dotted #666;
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
