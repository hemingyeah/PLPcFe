<template>
  <div class="task-tab-container task-receipt-view-container">
    <div class="task-receipt-detail-content">
      <form-view :fields="fields" :value="receiptTask">
        <!-- start 备件 -->
        <template slot="sparepart" slot-scope="{ field }">
          <div class="form-view-row">
            <label>{{ field.displayName }}</label>
            <div class="form-view-row-content">
              <el-table
                header-row-class-name="receipt-view-table-header"
                row-class-name="receipt-view-table-row"
                class="receipt-view-table"
                :data="sparePartsExpense"
                stripe>
                <el-table-column
                  v-for="(column, index) in sparepartColums"
                  :key="`${column.field}_${index}`"
                  :label="column.label"
                  :prop="column.field"
                  show-overflow-tooltip
                  :min-width="column.minWidth || '148px'">
                  <template slot-scope="scope">
                    <!-- start 小计 -->
                    <template v-if="column.field === 'total'">
                      {{ (scope.row.number * scope.row.salePrice).toFixed(2) }}
                    </template>
                    <!-- end 小计 -->

                    <template v-else>{{ scope.row[column.field] }}</template>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </template>
        <!-- end 备件 -->

        <!-- start 服务项目 -->
        <template slot="serviceIterm" slot-scope="{ field }">
          <div class="form-view-row">
            <label>{{ field.displayName }}</label>
            <div class="form-view-row-content">
              <el-table
                header-row-class-name="receipt-view-table-header"
                row-class-name="receipt-view-table-row"
                class="receipt-view-table"
                :data="serviceExpense"
                stripe>
                <el-table-column
                  v-for="column in serviceColums"
                  :key="column.id"
                  :label="column.label"
                  :prop="column.field"
                  show-overflow-tooltip
                  :min-width="column.minWidth || '148px'">
                  <template slot-scope="scope">
                    <!-- start 小计 -->
                    <template v-if="column.field === 'total'">
                      {{ (scope.row.number * scope.row.salePrice).toFixed(2) }}
                    </template>
                    <!-- end 小计 -->

                    <template v-else>{{ scope.row[column.field] }}</template>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </template>
        <!-- end 服务项目 -->

      </form-view>

      <!-- 合计 -->
      <div class="totalExpense" v-if="sparePartsExpense.length || serviceExpense.length">
        <span v-if="discountExpense">折扣费用：{{ discountExpense }}</span>
        <span>合计：{{ totalExpense }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

export default {
  name: 'task-receipt-detail-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      fields: [],
      sparepartColums: [{
        label: '编号',
        field: 'serialNumber'
      }, {
        label: '名称',
        field: 'name'
      }, {
        label: '类别',
        field: 'primaryType'
      }, {
        label: '单价',
        field: 'salePrice'
      }, {
        label: '数量',
        field: 'number'
      }, {
        label: '小计',
        field: 'total'
      }],
      serviceColums: [{
        label: '编号',
        field: 'serialNumber'
      }, {
        label: '名称',
        field: 'name'
      }, {
        label: '类别',
        field: 'primaryType'
      }, {
        label: '单价',
        field: 'salePrice'
      }, {
        label: '数量',
        field: 'number'
      }, {
        label: '小计',
        field: 'total'
      }]
    }
  },
  computed: {
    /** 
    * @description 工单详情数据
    */
    receiptTask() {
      return this.initData.receiptTaskForRead || {};
    },
    /** 
    * @description 回执设置
    */
    receiptConfig() {
      return this.initData.receiptConfig || {};
    },
    /** 
    * @description 非自定义回执
    */
    notCustom() {
      return !this.receiptConfig.customReceipt && this.receiptTask.templateId == '1';
    },
    /** 
    * @description 备件、服务项目、折扣费用数据集合
    */
    expenseSheet() {
      return this.initData.receiptExpenseSheetForRead || {};
    },
    /** 
    * @description 备件
    */
    sparePartsExpense() {
      return this.expenseSheet.sparePartsExpense || [];
    },
    /** 
    * @description 服务项目
    */
    serviceExpense() {
      return this.expenseSheet.serviceExpense || [];
    },
    /** 
    * @description 折扣费用
    */
    discountExpense() {
      return this.expenseSheet?.discountExpense?.salePrice || 0;
    },
    /** 
    * @description 回执总价
    */
    totalExpense() {
      let total = 0;

      this.sparePartsExpense.forEach(item => total += item.number * item.salePrice);
      this.serviceExpense.forEach(item => total += item.number * item.salePrice);

      return total + this.discountExpense;
    }
  },
  methods: {
  },
  async mounted() {
    try{
      let { templateId, attachment, attribute } = this.receiptTask;

      this.fields = await TaskApi.getTaskTemplateFields({ templateId, tableName: 'task_receipt' });

      // 处理回执信息
      this.fields.forEach(field => {
        let { fieldName } = field;

        // 回执附件
        if(fieldName === 'receiptAttachment'){
          this.receiptTask[fieldName] = attachment.filter(img => img.receipt);
        }

        // 客户签名
        if(fieldName === 'systemAutograph'){
          this.receiptTask[fieldName] = attribute[fieldName];
        }

      });

    } catch (e) {
      console.error('error ', e)
    }
  }
}
</script>

<style lang="scss" scoped>
.task-receipt-view-container {
  /deep/ .receipt-view-table {
    border: 1px solid $color-border-l1;

    .receipt-view-table-header th {
      background-color: $bg-color-l2;
      color: $text-color-primary;
      font-weight: 500;
    }
    
    .receipt-view-table-row td {
      color: $text-color-regular;
    }
  }

  .totalExpense {
    border-top: 1px solid #f4f4f4;
    text-align: right;
    padding: 10px;

    span {
      margin-left: 10px;
    }
  }
}
</style>
