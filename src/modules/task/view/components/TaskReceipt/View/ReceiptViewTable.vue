<template>
  <el-table
    header-row-class-name="receipt-view-table-header"
    row-class-name="receipt-view-table-row"
    class="receipt-view-table"
    :data="data"
    stripe>
    <el-table-column
      v-for="(column, index) in colums"
      :key="`${column.field}_${index}`"
      :label="column.label"
      :prop="column.field"
      show-overflow-tooltip
      :min-width="column.minWidth || '148px'">
      <template slot-scope="scope">

        <!-- start 小计 -->
        <template v-if="column.field === 'total'">
          {{ (scope.row.number * scope.row.salePrice).toFixed(2) }}
        </template>
        <!-- end 小计 -->

        <template v-else>{{ scope.row[column.field] }}</template>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'receipt-view-table',
  props: {
    data: {
      type: Array,
      default: () => ([])
    },
    colums: {
      type: Array,
      default: () => ([])
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .receipt-view-table {
  border: 1px solid $color-border-l1;

  .receipt-view-table-header th {
    background-color: $bg-color-l2;
    color: $text-color-primary;
    font-weight: 500;
  }
  
  .receipt-view-table-row td {
    color: $text-color-regular;
  }
}

.totalExpense {
  border-top: 1px solid #f4f4f4;
  text-align: right;
  padding: 10px;

  span {
    margin-left: 10px;
  }
}
</style>
