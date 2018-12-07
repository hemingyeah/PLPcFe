<template>
  <div class="form-sparator">
    {{field.displayName || ''}}
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
  padding: 0 20px;
  margin: 20px 0;
  text-align: left;
  background: #eef8f8;

}
</style>
