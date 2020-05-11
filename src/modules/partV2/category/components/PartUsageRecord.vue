<template>
  <div class="part-usage-record">
    <el-table :data="page.list" style="width:100%">
      <el-table-column label="操作人" prop="record.executorName" width="120"></el-table-column>
      <el-table-column label="数量" prop="record.variation" width="100"></el-table-column>
      <el-table-column label="工单编号" prop="record.taskNo" width="150"></el-table-column>
      <el-table-column label="客户" prop="record.customerName" width="200"></el-table-column>
      <el-table-column label="仓库" prop="repertory.name" width="120"></el-table-column>
      <el-table-column label="时间" prop="record.createTime" width="180"></el-table-column>
    </el-table>

    <el-pagination class="base-pagination"
      :background="true"
      layout="total, prev, pager, next"
      :total="page.total"
      :current-page="page.pageNum"
      @current-change="jump">
    </el-pagination>
  </div>
</template>

<script>

export default {
  name: 'part-usage-record',
  props: {
    page:{
      type: Object
    }
  },
  methods:{
    jump(currentPage){ //点击表格页数
      this.$emit('changePageNum', currentPage);    
    }
  }
}
</script>

<style lang="scss">
.part-usage-record{
  padding: 0 10px 10px 10px;
  table thead th{
    padding: 6px 0;
    background:#FAFAFA;
  }
  table td{
    padding: 6px 0;
  }
}
</style>

