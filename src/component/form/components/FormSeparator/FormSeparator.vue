<template>
  <div class="form-separator">
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
    }
  }
}
</script>

<style lang="scss">
.form-separator{
  height: 30px;
  line-height: 30px;
  margin: 20px 0;
  text-align: left;
  background: #eef8f8;
  display: flex;
  justify-content: space-between;
  color: $color-primary;
  padding-right: 10px;
  & > span{
    margin: 0;
    font-size: 14px;
    padding-left: 10px;
    color: $color-primary;
  }
}
</style>
