<template>
  <div class="table-footer-container">
    <div class="table-footer">
      <div class="list-info">
        共<span class="level-padding">{{page.total}}</span>记录，
        已选中<span class="product-selected-count" @click="multipleSelection.multipleSelectionPanelShow = true">{{multipleSelection.list.length}}</span>条
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

    <base-panel class="product-panel" :show.sync="multipleSelection.multipleSelectionPanelShow" width="420px">
      <h3 slot="title">
        <span>已选中数据({{multipleSelection.list.length}})</span>
        <i
          v-if="multipleSelection.list.length"
          class="iconfont icon-qingkongshanchu product-panel-btn"
          @click="toggleSelection()"
          title="清空已选中数据" data-placement="right" v-tooltip></i>
      </h3>

      <div class="product-selected-panel">
        <div class="product-selected-tip" v-if="!multipleSelection.list.length">
          <img src="../../../assets/img/no-data.png">
          <p>暂无选中的数据，请从列表中选择。</p>
        </div>
        <template v-else>
          <div class="product-selected-list">
            <div class="product-selected-row product-selected-head">
              <span class="product-selected-sn">{{multipleSelection.leftName}}</span>
              <span class="product-selected-name">{{multipleSelection.rightName}}</span>
            </div>
            <div class="product-selected-row" v-for="c in multipleSelection.list" :key="c.id" >
              <span class="product-selected-sn">{{c.serialNumber}}</span>
              <span class="product-selected-name">{{c.name}}</span>
              <button type="button" class="product-selected-delete" @click="removeFromSelection(c)">
                <i class="iconfont icon-fe-close"></i>
              </button>
            </div>
          </div>
        </template>
      </div>
    </base-panel>
  </div>
</template>

<script>
export default {
  name: 'table-footer',
  props: {
    page: {
      type: Object,
      default: () => ({})
    },
    multipleSelection: {
      type: Object,
      default: () => ({})
    },
  },
  data () {
    return {
      searchModel: {
        pageSize: this.page.pageSize,
        pageNum: this.page.pageNum,
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
    },
    toggleSelection (rows) {
      if (rows) {
        rows.forEach(row => {
          this.$emit('toggleRowSelection', row);
        });
      } else {
        this.$emit('clearSelection');
        this.multipleSelection.list = [];
      }
    },
    removeFromSelection (c) {
      if(!c || !c.id) return 

      this.multipleSelection.list = this.multipleSelection.list
        .filter(ms => ms.id !== c.id);
      this.multipleSelection.list.length < 1 ? this.toggleSelection() : this.toggleSelection([c]);
    }
  }
}
</script>

<style lang="scss">
.table-footer-container .product-panel {
  .base-panel-title {
    h3 {
      display: flex;
      justify-content: space-between;
    }
    .product-panel-btn {
      cursor: pointer;
      &:hover {
        color: $color-primary;
      }
    }
  }
}
.table-footer-container .table-footer {
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
.product-selected-panel {
  font-size: 14px;
  height: calc(100% - 51px);

  .product-selected-tip {
    padding-top: 80px;

    img {
      display: block;
      width: 240px;
      margin: 0 auto;
    }

    p {
      text-align: center;
      color: #9a9a9a;
      margin: 30px 0 0 0;
      line-height: 20px;
    }
  }

  .product-selected-list {
    height: 100%;
    padding: 10px;
    overflow-y: auto;

    .product-selected-row {
      display: flex;
      flex-flow: row nowrap;
      line-height: 36px;
      border-bottom: 1px solid #ebeef5;
      font-size: 13px;

      &:hover {
        background-color: #f5f7fa;

        .product-selected-delete {
          visibility: visible;
        }
      }
    }

    .product-selected-head {
      background-color: #F0F5F5;
      color: #333;
      font-size: 14px;
    }

    .product-selected-sn {
      padding-left: 10px;
      width: 150px;
      @include text-ellipsis;
    }

    .product-selected-name {
      padding-left: 10px;
      flex: 1;
      @include text-ellipsis;
    }

    .product-selected-delete {
      width: 36px;
    }

    .product-selected-row button.product-selected-delete {
      padding: 0;
      width: 36px;
      height: 36px;
      border: none;
      background-color: transparent;
      outline: none;
      color: #646B78;
      visibility: hidden;

      i {
        font-size: 14px;
      }

      &:hover {
        color: #e84040;
      }
    }
  }
}
</style>
