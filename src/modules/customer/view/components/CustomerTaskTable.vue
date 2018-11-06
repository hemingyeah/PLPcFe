<template>
  <div class="customer-task-table-container">
    <el-table
      stripe
      :data="taskList"
      :highlight-current-row="false"
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
          <template v-if="column.field === 'state'">
            {{scope.row[column.field]}}
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
    <el-pagination
      class="customer-task-table-pagination"
      background
      @current-change="jump"
      :page-size="paginationInfo.pageSize"
      :current-page="paginationInfo.pageNum"
      layout="prev, pager, next"
      :total="paginationInfo.totalItems">
    </el-pagination>

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
        paginationInfo: {
          pageSize: 10,
          pageNum: 1,
          totalItems: 0,
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
        this.paginationInfo.pageNum = pN;
        this.fetchData();
      },
      fetchData() {
        const params = {
          customerId: this.customerId,
          pageNum: this.paginationInfo.pageNum,
          pageSize: this.paginationInfo.pageSize
        };

        this.$http.get('/v2/customer/task/list', params)
        .then(res => {
          this.taskList = res.list
          .map(task => {
            task.createTime = formatDate(new Date(task.createTime), 'YYYY-MM-DD HH:mm:ss');
            if (!task.products || !task.products.length) {
              task.productName = task.product ? task.product.name : '';
            } else {
              task.productName = task.products.map(p => p.name).join('、');
            }
            task.state = TaskStateEnum.getName(task.state);
            return Object.freeze(task);
          });
          this.paginationInfo.totalItems = res.total;
        })
      },
      buildColumns() {
        return [{
          label: '工单编号',
          field: 'taskNo',
          show: true,
          // sortable: 'custom',
        }, {
          label: '工单类型',
          field: 'templateName',
          show: true,
        }, {
          label: '产品名称',
          field: 'productName',
          show: true,
        }, {
          label: '工单状态',
          field: 'state',
          show: true,
        }, {
          label: '负责人',
          field: 'executor',
          show: true,
        }, {
          label: '创建时间',
          field: 'createTime',
          show: true,
        }, {
          label: '完成时间',
          field: 'completeTime',
          show: true,
        }, {
          label: '客户评价',
          field: 'suggestion',
          show: true,
        }]
      }
    },
  }
</script>

<style lang="scss">
  .customer-task-table-container {

    .task-link {
      color: #2F93C0;
    }
    .customer-task-table-pagination {
      text-align: right;
      margin-top: 7px;
    }
  }
</style>