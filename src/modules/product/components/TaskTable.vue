<template>
  <div class="customer-task-table-container">
    <el-table
      stripe
      :data="taskList"
      :highlight-current-row="false"
      header-row-class-name="customer-task-table-header"
      row-class-name="customer-task-table-row"
      @sort-change="sortChange"
      v-loading="loading"
      class="customer-task-table">
      <el-table-column
        v-for="column in columns"
        v-if="column.show"
        :key="column.field"
        :label="column.label"
        :prop="column.field"
        :width="column.width"
        :sortable="column.sortable"
        :show-overflow-tooltip="column.field !== 'taskNo'"
        :class-name="column.field == 'taskNo' ? 'product-task-name-superscript-td' : ''"
        :align="column.align">
        <template slot-scope="scope">
          <template v-if="column.field === 'templateId'">
            {{scope.row.templateName}}
          </template>
          <template v-else-if="column.field === 'suggestion'">
            {{scope.row.suggestion}}
          </template>
          <template v-else-if="column.field === 'taskNo'">
            <sample-tooltip :row="scope.row">
              <template slot="content" slot-scope="{isContentTooltip}">
                <el-tooltip :content="scope.row[column.field]" placement="top" :disabled="!isContentTooltip">
                  <a :href="`/task/view/${scope.row.id}`" :data-id="scope.row.id" @click="openDetail" class="task-link">{{scope.row[column.field]}}</a>
                </el-tooltip>
              </template>
            </sample-tooltip>
          </template>
          <template v-else-if="column.field === 'executor' && scope.row[column.field]">
            {{scope.row[column.field].displayName}}
          </template>
          <template v-else>
            {{scope.row[column.field]}}
          </template>
        </template>
      </el-table-column>
    </el-table>
    <div class="task-table-footer">
      <p class="total-count">共<span>{{searchModel.totalItems}}</span>条记录</p>
      <el-pagination
        v-if="searchModel.totalItems"
        class="customer-task-table-pagination"
        background
        @current-change="jump"
        :page-size="searchModel.pageSize"
        :current-page="searchModel.pageNum"
        layout="prev, pager, next"
        :total="searchModel.totalItems">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import {formatDate, } from '@src/util/lang';
import TaskStateEnum from '@model/enum/TaskStateEnum';
import platform from '@src/platform'
import { getTaskOfProduct } from '@src/api/ProductApi';

export default {
  name: 'task-table',
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      taskList: [],
      columns: this.buildColumns(),
      loading: false,
      searchModel: {
        pageSize: 10,
        pageNum: 1,
        totalItems: 0,
        orderDetail: {}
      }
    }
  },
  computed: {
    productId() {
      return this.shareData.product.id;
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    sortChange({ prop, order, }) {
      this.searchModel.orderDetail = {
        column: prop,
        sequence: order === 'ascending' ? 'ASC' : 'DESC',
        isSystem: 1,
      };
      this.fetchData();
    },
    openDetail(event){
      event.preventDefault();
      if (!window.frameElement) return;

      let el = event.target;
      let fromId = window.frameElement.getAttribute('id');

      // TODO: 统一id命名
      platform.openTab({
        id: `taskView_${ el.dataset.id}`,
        title: '正在加载',
        close: true,
        url: el.getAttribute('href'),
        fromId
      });
    },
    jump(pN) {
      this.searchModel.pageNum = pN;
      this.fetchData();
    },
    fetchData() {
      const {pageNum, pageSize, orderDetail, } = this.searchModel;
      const params = {
        productId: this.productId,
        pageNum,
        pageSize,
      };

      if (Object.keys(orderDetail).length) {
        params.orderDetail = orderDetail;
      }

      this.loading = true;

      getTaskOfProduct(params)
        .then(res => {
          if (!res) return;

          this.taskList = res.list
            .map(task => {
              task.createTime = formatDate(new Date(task.createTime), 'YYYY-MM-DD HH:mm:ss');
              task.completeTime = task.completeTime && formatDate(new Date(task.completeTime), 'YYYY-MM-DD HH:mm:ss');
              if (!task.products || !task.products.length) {
                task.productName = task.product ? task.product.name : '';
              } else {
                task.productName = task.products.map(p => p.name).join('、');
              }
              task.state = TaskStateEnum.getName(task.state);
              return Object.freeze(task);
            });
          this.searchModel.totalItems = res.total;
          this.loading = false;
        })
        .catch(e => console.error('fetch task caught e', e))
    },
    buildColumns() {
      return [{
        label: '工单编号',
        field: 'taskNo',
        show: true,
        sortable: 'custom',
      }, {
        label: '工单类型',
        field: 'templateId',
        show: true,
        sortable: 'custom',
      }, {
        label: '工单状态',
        field: 'state',
        show: true,
        sortable: 'custom',
      }, {
        label: '负责人',
        field: 'executor',
        show: true,
        sortable: 'custom',
      }, {
        label: '创建时间',
        field: 'createTime',
        show: true,
        sortable: 'custom',
      }, {
        label: '完成时间',
        field: 'completeTime',
        show: true,
        sortable: 'custom',
      }, {
        label: '客户评价',
        field: 'suggestion',
        show: true,
        sortable: 'custom',
      }]
    }
  },
}
</script>

<style lang="scss">
  .customer-task-table-container {
    padding: 10px 10px 10px 5px;

    .task-link {
      color: $color-primary;
    }

    .customer-task-table-header th{
      background: #F5F5F5;
      color: $text-color-primary;
    }

    .customer-task-table-pagination {
      text-align: right;
      margin-top: 7px;
    }

    .task-table-footer {
      display: flex;
      justify-content: space-between;

      .total-count {
        padding: 0 10px;
        font-size: 12px;
        margin: 0;
        line-height: 46px;
        span {
          padding: 0 5px;
          color: $color-primary;
        }
      }
    }
  }

  td.product-task-name-superscript-td {
    padding: 0 !important;
    & > .cell {
      padding-left: 0 !important;
    }

    & > div {
      height: 43px;
      line-height: 43px !important;
      a {
        display: inline-block;
        height: 43px;
        line-height: 43px;
      }
    }
  }
</style>