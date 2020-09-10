<template>
  <el-table
    v-if="data.length"
    header-row-class-name="base-table-header-v3"
    row-class-name="base-table-row-v3"
    :data="data"
    border>
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
  name: 'receipt-view-common-table',
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
