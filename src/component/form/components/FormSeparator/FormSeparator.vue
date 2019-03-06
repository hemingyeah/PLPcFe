<template>
  <div class="form-sparator">
    <span>{{field.displayName || ''}}</span>
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
    // value: Object
  }
}
</script>

<style lang="scss">
.form-sparator{
  height: 30px;
  line-height: 30px;
  margin: 20px 0;
  text-align: left;
  background: #eef8f8;

  & > span{
    margin: 0;
    font-size: 14px;
    padding-left: 10px;
    color: #55B7B4;
  }
}
</style>
