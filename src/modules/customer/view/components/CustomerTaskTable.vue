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
        show-overflow-tooltip
        :align="column.align">
        <template slot-scope="scope">
          <template v-if="column.field === 't.type'">
            {{scope.row.templateName}}
          </template>
          <template v-else-if="column.field === 'degree'">
            {{scope.row.suggestion}}
          </template>
          <template v-else-if="column.field === 'taskNo'">
            <a :href="`/task/view/${scope.row.id}`" :data-id="scope.row.id" @click="openDetail" class="task-link">{{scope.row[column.field]}}</a>
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
import {formatDate,} from '@src/util/lang';
import TaskStateEnum from '@model/enum/TaskStateEnum';

export default {
  name: "customer-task-table",
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
    customerId() {
      return this.shareData.customer ? this.shareData.customer.id : '';
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
      var fromId = window.frameElement.getAttribute('id');

      parent.window.addTabs({
        id: "taskView_" + el.dataset.id,
        title: "正在加载",
        close: true,
        url: el.getAttribute('href'),
        fromId:fromId
      });
      parent.window.resizeFrame();
    },
    jump(pN) {
      this.searchModel.pageNum = pN;
      this.fetchData();
    },
    fetchData() {
      const {pageNum, pageSize, orderDetail,} = this.searchModel;
      const params = {
        customerId: this.customerId,
        pageNum,
        pageSize,
      };

      if (Object.keys(orderDetail).length) {
        params.orderDetail = orderDetail;
      }

      this.loading = true;

      this.$http.get('/customer/task/list', params)
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
        // sortable: 'custom',
      }, {
        label: '工单类型',
        field: 't.type',
        show: true,
        sortable: 'custom',
      }, {
        label: '产品名称',
        field: 'productName',
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
        field: 'degree',
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
</style>