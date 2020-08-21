<template>
  <div class="base-table-body-wrap">
    <table class="base-table-body">
      <colgroup>
        <col v-if="disableSelect !== true" width="55"></col>
        <col v-for="column in columns" :key="column.field" :width="column.width"></col>
      </colgroup>
      <tbody><slot></slot></tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'base-table-body',
  props: {
    disableSelect: Boolean,
    columns: Array
  }
}
</script>

<style lang="scss">
.base-table-body-wrap{
  overflow: auto;
}
</style>
