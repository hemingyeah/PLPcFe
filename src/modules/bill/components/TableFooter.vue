<template>
  <div class="table-footer">
    <div class="list-info">
      共<span class="level-padding">{{page.total}}</span>记录，
      已选中<span class="product-selected-count" @click="multipleSelectionPanelShow = true">{{multipleSelection.length}}</span>条
      <span class="product-selected-count" @click="toggleSelection()">清空</span>
    </div>
    <el-pagination
      class="product-table-pagination"
      background
      @current-change="jump"
      @size-change="handleSizeChange"
      :page-sizes="[10, 20, 50]"
      :page-size="page.pageSize"
      :current-page="page.pageNum"
      layout="prev, pager, next, sizes, jumper"
      :total="page.total">
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: 'table-footer',
  props: {
    page: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      multipleSelectionPanelShow: false,
      multipleSelection: [],
      searchModel: {
        pageSize: this.pageSize,
        pageNum: 1,
      }
    }
  },
  methods: {
    jump(pageNum) {
      this.searchModel.pageNum = pageNum;
      this.$emit('search', this.searchModel);
    },
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.searchModel.pageNum = 1;
      this.$emit('search', this.searchModel)
    }
  }
}
</script>

<style lang="scss">
.table-footer {
  display: flex;
  justify-content: space-between;
  padding: 0px 10px 10px 10px ;
  background: #fff;
  border-radius: 0 0 3px 3px;

  .list-info {
    font-size: 13px;
    line-height: 32px;
    margin: 0;
    color: #767e89;

    .iconfont {
      position: relative;
      top: 1px;
    }

    .product-selected-count{
      color: $color-primary;
      padding: 0 3px;
      width: 15px;
      text-align: center;
      cursor: pointer;
      font-size: 13px;
    }

  }

  .el-pagination__jump {
    margin-left: 0;
  }
}
</style>
