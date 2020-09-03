<template>
  <div class="task-tab-container task-receipt-view-container">
    <div class="task-receipt-detail-content">
      <form-view :fields="fields" :value="form">
        <!-- start 备件 -->
        <template slot="sparepart" slot-scope="{ field, value }">
          <div class="form-view-row">
            <label>{{ field.displayName }}</label>
            <div class="form-view-row-content">
              <receipt-view-table
                :data="value"
                :colums="sparepartColums"
              />
            </div>
          </div>
        </template>
        <!-- end 备件 -->

        <!-- start 服务项目 -->
        <template slot="serviceIterm" slot-scope="{ field, value }">
          <div class="form-view-row">
            <label>{{ field.displayName }}</label>
            <div class="form-view-row-content">
              <receipt-view-table
                :data="value"
                :colums="serviceColums"
              />
            </div>
          </div>
        </template>
        <!-- end 服务项目 -->
      </form-view>

      <!-- 合计 -->
      <div class="totalExpense" v-if="hasExpense">
        <span v-if="form.disExpense">折扣费用：{{ form.disExpense }}</span>
        <span>合计：{{ totalExpense }}</span>
      </div>
    </div>

    <!-- start 按钮组 -->
    <div class="btn-group">
      <el-button size="small" @click="openDialog">编辑回执</el-button>
    </div>
    <!-- end 按钮组 -->

    <!-- start 编辑回执弹窗 -->
    <task-receipt-edit-dialog
      ref="taskReceiptEdit"
      :init-data="initData"
    />
    <!-- end 编辑回执弹窗 -->
  </div>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* mixin */
import ReceiptMixin from '../TaskReceiptMixin';

/* components */
import ReceiptViewTable from './ReceiptViewTable';
import TaskReceiptEdit from '../Edit/TaskReceiptEdit';

export default {
  name: 'task-receipt-detail-view',
  mixins: [ReceiptMixin],
  data() {
    return {
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
    task() {
      let { task, receiptTaskForRead } = this.initData;
      return receiptTaskForRead || task || {};
    },
    /** 
    * @description 备件、服务项目、折扣费用数据集合
    */
    expenseSheet() {
      return this.initData.receiptExpenseSheetForRead || {};
    }
  },
  methods: {
    /** 
    * @description 打开弹窗
    */
    openDialog(action) {
      this.$refs.taskReceiptEdit.openDialog('edit');
    }
  },
  async mounted() {
    try {
      let { templateId, attachment, attribute } = this.task;
      let { sparePartsExpense, serviceExpense, discountExpense } = this.expenseSheet;

      this.fields = await TaskApi.getTaskTemplateFields({ templateId, tableName: 'task_receipt' });
      
      // 初始化默认值
      this.form = this.task;

      // 处理回执信息
      this.fields.forEach(field => {
        let { fieldName } = field;

        // 回执附件
        if(fieldName === 'receiptAttachment') {
          this.form[fieldName] = attachment.filter(img => img.receipt);
        }
        // 客户签名
        else if(fieldName === 'systemAutograph') {
          this.form[fieldName] = attribute[fieldName];
        }
        // 备件
        else if(fieldName === 'sparepart') {
          this.form[fieldName] = sparePartsExpense || [];
        }
        // 服务项目
        else if(fieldName === 'serviceIterm') {
          this.form[fieldName] = serviceExpense || [];
        }

      });

      // 折扣费用
      this.form.disExpense = discountExpense?.salePrice || 0;

    } catch (e) {
      console.error('error ', e)
    }
  },
  components: {
    [ReceiptViewTable.name]: ReceiptViewTable,
    [TaskReceiptEdit.name]: TaskReceiptEdit
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
