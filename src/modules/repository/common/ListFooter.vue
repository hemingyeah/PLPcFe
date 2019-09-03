<template>
  <div class="document-list-footer">
    <!-- current-page 当前页面 -->
    <el-pagination
      class="list-table-pagination"
      background
      @current-change="jump"
      @size-change="handleSizeChange"
      :page-sizes="[10, 20, 50]"
      :page-size="params.pageSize"
      :current-page="params.pageNum" 
      :pager-count="5"
      small
      layout="prev, pager, next, sizes, jumper"
      :total="total">
    </el-pagination>
  </div>
</template>

<script>
import Page from '@model/Page';

export default {
  name: 'list-footer',
  props: {
    total: {
      type: Number,
      default: 0
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      page: new Page(),
      params: this.value,
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

  .el-pagination__jump {
    margin: 0 0 0 5px;
  }

  .el-pagination__sizes {
    margin: 0;
  }

  .el-pagination .el-select .el-input {
    margin: 0;
    width: 80px;
  }

  .el-select__caret {
    line-height: 22px;
  }

  .el-input__inner {
    height: 22px;
  }
}
</style>