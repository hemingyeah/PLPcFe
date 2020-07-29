<template>
  <tr>
    <td v-if="this.disableSelect !== true"><input type="checkbox" :checked="checked" @change="check"></td>
    <td v-for="column in columns" v-if="column.hidden !== true" :key="column.field">
      <base-table-cell :row="row" :column="column"></base-table-cell>
    </td>
  </tr>
</template>

<script>
import BaseTableCell from './BaseTableCell';

export default {
  name: 'base-table-row',
  props: {
    columns: Array,
    row: Object,
    checked: Boolean,
    disableSelect: Boolean
  },
  methods: {
    check(event){
      this.$emit('check-row', {
        row: this.row,
        selected: event.target.checked
      });
    }
  },
  components: {
    [BaseTableCell.name]: BaseTableCell
  }
}
</script>

