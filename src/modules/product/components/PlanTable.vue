<template>
  <div class="customer-plan-table-container">
    <el-table
      stripe
      :data="planList"
      :highlight-current-row="false"
      header-row-class-name="customer-plan-table-header"
      row-class-name="customer-plan-table-row"
      @sort-change="sortChange"
      v-loading="loading"
      class="customer-plan-table">
      <el-table-column
        v-for="(column, index) in columns"
        v-if="column.show"
        :key="`${column.field}_${index}`"
        :label="column.label"
        :prop="column.field"
        :width="column.width"
        :sortable="column.sortable"
        :show-overflow-tooltip="column.tooltip"
        :align="column.align">
        <template slot-scope="scope">
          <template v-if="column.field === 'name'">
            <a :href="`/task/planTask/edit?id=${scope.row.id}`" @click="openDetail" :data-id="scope.row.id" class="plan-link">{{scope.row[column.field]}}</a>
          </template>
          <template v-else-if="column.field === 'templateId'">
            {{scope.row.task.templateName}}
          </template>
          <template v-else-if="column.field === 'createUserId'">
            {{scope.row.createUserName}}
          </template>
          <template v-else-if="column.field === 'endSetting'">
            <template v-if="scope.row.endSetting.endBy === 'date'">
              {{scope.row.endSetting.value}}
            </template>
            <template v-else>
              执行{{scope.row.endSetting.value}}次
            </template>
          </template>
          <template v-else-if="column.field === 'createdTasks' && scope.row[column.field]">
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
            <el-button 
              v-if="hasEditCustomerAuth"
              class="delete-plan-btn" 
              type="text" 
              @click="deletePlan(scope.row)" 
              :disabled="pending[scope.row.id]"
              size="small">删除</el-button>
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
    <div class="plan-task-table-footer">
      <p class="total-count">共<span>{{searchModel.totalItems}}</span>条记录</p>
      <el-pagination
        v-if="searchModel.totalItems"
        class="customer-plan-table-pagination"
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
import {formatDate, } from "@src/util/lang";
import platform from "@src/platform";
import { getPlanOfProduct } from "@src/api/ProductApi";
import { deletePlanTask } from "@src/api/TaskApi.ts";


export default {
  name: "plan-table",
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
    product(){
      return this.shareData.product || {};
    },
    productId() {
      return this.shareData.product.id;
    },
    /** 是否允许操作 */
    allowOperate(){
      return !this.product.isDelete;
    },
    /** 是否有编辑客户的权限 */
    hasEditCustomerAuth(){
      return this.shareData.allowEditCustomer
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    sortChange({ prop, order, }) {
      this.searchModel.orderDetail = {
        column: prop,
        sequence: order === "ascending" ? "ASC" : "DESC",
        isSystem: 1,
      };
      this.fetchData();
    },
    async deletePlan(plan) {
      try {
        const res = await platform.confirm("确认删除该计划任务？");
        if (!res) return;
        this.pending[plan.id] = true;

        const reqRes = await deletePlanTask({ids: [plan.id], });
        delete this.pending[plan.id];

        if (!reqRes.status) {
          this.fetchData();
          // 更新下产品详情页面计划任务数量
          this.$eventBus.$emit('product_view_plan_update');
        } else {
          platform.alert(reqRes.message);
        }
        this.$eventBus.$emit("customer_info_record.update_record_list");
      } catch (e) {
        console.error("deletePlan catch an err", e);
      }
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
      getPlanOfProduct(params)
        .then(res => {
          if (!res) return;
          this.planList = res.list
            .map(plan => {
              plan.createTime = formatDate(new Date(plan.createTime), "YYYY-MM-DD HH:mm:ss");
              plan.nextTaskCreateTime = plan.nextTaskCreateTime ? formatDate(new Date(plan.nextTaskCreateTime), "YYYY-MM-DD HH:mm:ss") : "";
              this.$set(this.pending, plan.id, false);
              return Object.freeze(plan);
            });
          this.searchModel.totalItems = res.total;
          this.loading = false;
        })
        .catch(e => {
          this.loading = false;
          console.error("fetchData caught e", e)
        });
    },
    buildColumns() {
      return [{
        label: "名称",
        field: "name",
        show: true,
        tooltip: true,
        sortable: "custom",
      }, {
        label: "工单类型",
        field: "templateId",
        show: true,
        tooltip: true,
        sortable: "custom",
      }, {
        label: "创建人",
        field: "createUserId",
        show: true,
        tooltip: true,
        sortable: "custom",
      }, {
        label: "创建时间",
        field: "createTime",
        show: true,
        tooltip: true,
        sortable: "custom",
      }, {
        label: "截止时间",
        field: "endSetting",
        show: true,
        tooltip: true,
        sortable: "custom",
      }, {
        label: "已创建",
        field: "createdTasks",
        show: true,
        tooltip: false,
        width: "80px",
        sortable: "custom",
      }, {
        label: "重复周期",
        field: "periodSetting",
        show: true,
        tooltip: true,
        width: "100px",
        sortable: "custom",
      }, {
        label: "下次创建时间",
        field: "nextTaskCreateTime",
        show: true,
        tooltip: true,
        width: "120px",
        sortable: "custom",
      }, {
        label: "操作",
        field: "action",
        show: true,
        tooltip: false,
        width: "50px",
      }]
    },
    /* 新tab 打开计划任务 */
    openDetail() {
      event.preventDefault();
      if (!window.frameElement) return;

      let el = event.target;
      let fromId = window.frameElement.getAttribute("id");

      // 统一id命名
      platform.openTab({
        id: `editPlanTask_${ el.dataset.id}`,
        title: "正在加载",
        close: true,
        url: el.getAttribute("href"),
        fromId
      });
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
    .plan-task-table-footer {
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