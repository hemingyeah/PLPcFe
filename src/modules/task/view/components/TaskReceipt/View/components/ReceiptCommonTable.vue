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
      :width="column.width">
      <template slot-scope="scope">

        <!-- start 小计 -->
        <template v-if="column.field === 'total'">
          {{ (scope.row.number * scope.row.salePrice).toFixed(2) }}
        </template>
        <!-- end 小计 -->

        <!-- start 安装产品id获取安装产品名称 -->
        <template v-else-if="column.field === 'installProductId'">
          {{ getProductName(scope.row[column.field]) }}
        </template>
        <!-- end  安装产品id获取安装产品名称 -->

        <template v-else>{{ scope.row[column.field] }}</template>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'receipt-view-common-table',
  inject: ['initData'],
  props: {
    data: {
      type: Array,
      default: () => ([])
    },
    colums: {
      type: Array,
      default: () => ([])
    }
  },
  methods: {
    // 根据产品id获取产品名称
    getProductName(id) {
      let name = ''
      this.initData.task.products.forEach(product => {
        if (id == product.id) {
          name = product.name
        }
      })
      return name
    }
  }
}
</script>
