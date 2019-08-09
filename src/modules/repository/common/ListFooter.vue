<template>
  <div class="document-list-footer">
    <!-- current-page 当前页面 -->
    <el-pagination
      class="list-table-pagination"
      background
      @current-change="jump"
      @size-change="handleSizeChange"
      :page-sizes="[10, 20, 50]"
      :page-size="page.pageSize"
      :current-page="page.pageNum" 
      layout="prev, pager, next, sizes, jumper">
    </el-pagination>
  </div>
</template>

<script>
import Page from '@model/Page';

export default {
  name: 'list-footer',
  data () {
    return {
      page: new Page(),
      params: {},
    }
  },
  methods: {
    // 页面跳转
    jump (pageNum) {
      this.params.pageNum = pageNum;
      this.$emit('search', this.params);
    },
    // 页面pageSize改变
    handleSizeChange (pageSize) {
      this.params.pageNum = 1;
      this.params.pageSize = pageSize;
      this.$emit('search', this.params);
    },
  }
}
</script>

<style lang="scss">
.document-list-footer {
  background: #fff;
  height: 50px;
  padding: 11px 0;
  text-align: center;

  .list-table-pagination {
    padding: 0;
  }
}
</style>