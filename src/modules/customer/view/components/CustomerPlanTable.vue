<template>
  <div class="customer-plan-table-container">
    <el-table
      stripe
      :data="planList"
      :highlight-current-row="false"
      header-row-class-name="customer-plan-table-header"
      row-class-name="customer-plan-table-row"
      class="customer-plan-table">
      <el-table-column
        v-for="column in columns"
        v-if="column.show"
        :key="column.field"
        :label="column.label"
        :prop="column.field"
        :width="column.width"
        :sortable="column.sortable"
        :show-overflow-tooltip="column.tooltip"
        :align="column.align">
        <template slot-scope="scope">
          <template v-if="column.field === 'name'">
            <a :href="`/task/planTask/edit?id=${scope.row.id}`" :data-id="scope.row.id" class="plan-link">{{scope.row[column.field]}}</a>
          </template>
          <template v-else-if="column.field === 'templateName'">
            {{scope.row.task.templateName}}
          </template>
          <template v-else-if="column.field === 'endDate'">
            <template v-if="scope.row.endSetting.endBy === 'date'">
              {{scope.row.endSetting.value}}
            </template>
            <template v-else>
              执行{{scope.row.endSetting.value}}次
            </template>
          </template>
          <template v-else-if="column.field === 'createdTasks'">
            <template v-if="scope.row[column.field].length">
              <el-popover
                placement="left"
                width="360"
                trigger="hover">
                <div slot="reference">{{scope.row[column.field].length}}</div>
                <ul class="plan-created-task-list">
                  <li v-for="task in scope.row[column.field]" :key="task.taskId">
                    工单编号：{{task.taskNo}} 创建时间：{{task.createTime}}
                  </li>
                </ul>
              </el-popover>
            </template>
            <template v-else>
              {{scope.row[column.field].length}}
            </template>
          </template>
          <template v-else-if="column.field === 'periodSetting'">
            每{{scope.row[column.field].period + scope.row[column.field].periodUnit}}
          </template>
          <template v-else-if="column.field === 'action'">
            <el-button class="delete-plan-btn" type="text" @click="deletePlan(scope.row)" :disabled="pending[scope.row.id]"
                       size="small">删除
            </el-button>
          </template>
          <template v-else>
            {{scope.row[column.field]}}
          </template>
        </template>
      </el-table-column>

      <div slot="empty" class="empty-table-text">
        <p>尚未创建计划任务，计划任务可以帮助您按照时间计划自动生成工单。</p>
        <p>如需创建请到工单中心-计划任务中设置。</p>
      </div>
    </el-table>
    <el-pagination
      class="customer-plan-table-pagination"
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
import platform from '@src/platform';


export default {
  name: "customer-plan-table",
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      planList: [],
      pending: {},
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
    async deletePlan(plan) {
      try {
        const res = await platform.confirm('确认删除该计划任务？');
        if (!res) return;
        this.pending[plan.id] = true;

        const reqRes = await this.$http.post('/task/deletePlanTask', {ids: [plan.id],}, false);
        delete this.pending[plan.id];

        if (reqRes.status === 0) {
          this.fetchData();
        } else {
          platform.alert(reqRes.message);
        }
        this.$eventBus.$emit('customer_info_record.update_record_list');
      } catch (e) {
        console.error('deletePlan catch an err', e);
      }
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

      this.$http.get('/v2/customer/planTask/list', params)
        .then(res => {
          this.planList = res.list
            .map(plan => {
              plan.createTime = formatDate(new Date(plan.createTime), 'YYYY-MM-DD HH:mm:ss');
              plan.nextTaskCreateTime = plan.nextTaskCreateTime ? formatDate(new Date(plan.nextTaskCreateTime), 'YYYY-MM-DD HH:mm:ss') : '';
              this.$set(this.pending, plan.id, false);
              return Object.freeze(plan);
            });
          this.paginationInfo.totalItems = res.total;
        })
    },
    buildColumns() {
      return [{
        label: '名称',
        field: 'name',
        show: true,
        tooltip: true,
        // sortable: 'custom',
      }, {
        label: '工单类型',
        field: 'templateName',
        show: true,
        tooltip: true,
      }, {
        label: '创建人',
        field: 'createUserName',
        show: true,
        tooltip: true,
      }, {
        label: '创建时间',
        field: 'createTime',
        show: true,
        tooltip: true,
      }, {
        label: '截止时间',
        field: 'endDate',
        show: true,
        tooltip: true,
      }, {
        label: '已创建',
        field: 'createdTasks',
        show: true,
        tooltip: false,
      }, {
        label: '重复周期',
        field: 'periodSetting',
        show: true,
        tooltip: true,
      }, {
        label: '下次创建时间',
        field: 'nextTaskCreateTime',
        show: true,
        tooltip: true,
        width: '100px'
      }, {
        label: '操作',
        field: 'action',
        show: true,
        tooltip: false,
      }]
    }
  },
}
</script>

<style lang="scss">

  .plan-created-task-list {
    padding: 0;
    margin: 0;
    font-size: 12px;
    li {
      padding: 0;
      margin: 0;
      list-style: none;
    }
  }

  .customer-plan-table-container {
    padding: 10px 10px 10px 5px;

    .customer-plan-table-header th{
      background: #F5F5F5;
      color: $text-color-primary;
    }

    .plan-link {
      color: $color-primary;
    }

    .delete-plan-btn {
      color: $color-danger;
    }

    .delete-plan-btn.is-disabled,
    .delete-plan-btn.is-disabled:hover,
    .el-button.delete-plan-btn:focus {
      color: #c0c4cc;
      cursor: not-allowed;
      background-image: none;
    }

    .empty-table-text {
      width: 400px;
      text-align: left;
      p {
        margin: 0;
        line-height: 20px;
      }
    }

    .customer-plan-table-pagination {
      text-align: right;
      margin-top: 7px;
    }
  }
</style>