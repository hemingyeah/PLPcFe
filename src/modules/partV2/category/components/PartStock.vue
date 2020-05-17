<template>
  <div class="part-stock">
    <table>
      <thead>
        <tr>
          <th>仓库</th>
          <th width="180">仓库类别</th>
          <th width="120">数量</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="null == stock">
          <tr>
            <td colspan="3">暂无数据</td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="(item, index) in stock" :key="index">
            <td>{{item.repertoryName}}</td>
            <td></td>
            <td>
              {{item.repertoryCount}}
              <el-tooltip class="item" effect="dark" :content="`安全库存：${item.safetyStock}`" placement="top">
                <el-tag size="mini" type="danger" style="float: right"
                        v-if="item.safetyStock && (item.safetyStock > item.repertoryCount)"
                >库存提醒</el-tag>
              </el-tooltip>

            </td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td>合计库存：{{repertoryTotalCount}}</td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'part-stock',
  inject: ['initData'],
  props: {
    stock: {
      type: Array,
      default: [],
    }
  },
  computed: {
    repertoryTotalCount() {
      if (!this.stock || !this.stock.length) return 0;
      return this.stock
        .map(r => r.repertoryCount)
        .reduce((a, b) => a + b);
    }
  },
}
</script>

<style lang="scss">
  .part-stock{
    padding: 0 10px 10px 10px;
    color: #666;

    table{
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;

      thead th{
        color: #454545;
      }
      tbody tr:hover{
        background-color: #ebeef5;
      }

      td,th{
        padding: 12px 8px;
        text-align: left;
        border-bottom: 1px solid #ebeef5;
      }
    }
  }
</style>
