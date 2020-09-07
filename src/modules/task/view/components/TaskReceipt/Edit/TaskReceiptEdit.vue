<template>
  <base-modal class="task-receipt-edit-container" :title="title" :show.sync="visible" width="700px" @closed="reset">
    <div class="base-modal-content" v-if="init">
      <form-builder ref="form" :fields="fields" :value="form" @update="update">
        <!-- start 合计 -->
        <template v-if="hasExpense" slot="template" slot-scope="{ field }">
          <form-item :label="field.displayName" class="task-receipt-expense">
            <div class="item">
              <label>备件费用</label>
              <span>{{ sparepartTotal }}</span>
            </div>
            <div class="item">
              <label>服务费用</label>
              <span>{{ serviceTotal }}</span>
            </div>
            <div class="item" v-if="showDiscountCost">
              <label>折扣费用</label>
              <input type="number" class="text-red" v-model="form.disExpense" @input="updateDisExpense" @blur="disExpenseBlur" />
            </div>
            <div class="item">
              <label>总计</label>
              <span>{{ totalExpense }}</span>
            </div>
          </form-item>
        </template>
        <!-- end 合计 -->
      </form-builder>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" :disabled="pending" @click="submit">保 存</el-button>
    </div>
  </base-modal>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* mixin */
import ReceiptMixin from '../TaskReceiptMixin';

/* util */
import * as FormUtil from '@src/component/form/util';
import * as util from '@src/modules/task/util/receipt';
import _ from 'lodash';

export default {
  name: 'task-receipt-edit-dialog',
  mixins: [ReceiptMixin],
  data() {
    return {
      pending: false,
      visible: false,
      init: false,
      action: ''
    }
  },
  computed: {
    /**
    * @description 弹窗标题
    */
    title() {
      return this.action == 'edit' ? '编辑回执' : '完成回执';
    },
    /** 
    * @description 工单详情数据
    */
    task() {
      let { task, receiptTaskForUpdate } = this.initData;
      return receiptTaskForUpdate || task || {};
    },
    /** 
    * @description 备件、服务项目、折扣费用数据集合
    */
    expenseSheet() {
      return this.initData.receiptExpenseSheetForUpdate || {};
    },
    /** 
    * @description 显示折扣费用
    */
    showDiscountCost() {
      let { showSparepart, showService, showDiscountCost } = this.taskType?.options || {};
      return (showSparepart || showService) && showDiscountCost;
    }
  },
  methods: {
    /**
    * @description 更新表单数据
    */
    update({ field, newValue, oldValue }) {
      let { fieldName, displayName } = field;

      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`)
      }

      this.$set(this.form, fieldName, newValue);
    },
    /**
    * @description 弹窗关闭重置数据
    */
    reset() {
      this.form = {};
      this.init = false;
    },
    /**
    * @description 打开弹窗
    */
    openDialog(action) {
      let expenseSheet = _.cloneDeep(this.expenseSheet);

      // 初始化默认值
      let form = {
        task: this.task,
        expenseSheet
      };

      form = util.packToForm(this.fields, form);
      this.form = FormUtil.initialize(this.fields, form);

      this.init = true;
      this.action = action;
      this.visible = true;
    },
    /**
    * @description 更新折扣费用
    */
    updateDisExpense(event) {
      let value = event.target.value;
      const REG = /^[0-9]+([.]{1}[0-9]{0,2}){0,1}$/;

      this.form.disExpense = REG.test(value) ? parseFloat(value) : Math.floor(value * 100 / 100);
    },
    /**
    * @description 折扣费用校验
    */
    disExpenseBlur(event) {
      let value = event.target.value;
      let totalExpense = Number(this.sparepartTotal) + Number(this.serviceTotal);

      if (Math.abs(value) > totalExpense) {
        this.form.disExpense = 0;
        return this.$platform.notification({
          type: 'error',
          title: '提示',
          message: '折扣费用不能大于总价'
        })
      }

      this.form.disExpense = 0 - Math.abs(value);
    },
    /**
    * @description 完成、编辑回执
    */
    submit() {
      this.$refs.form
        .validate()
        .then(valid => {

          if (!valid) return Promise.reject('validate fail.');

          const params = util.packToReceipt(this.fields, this.form);
          this.pending = true;

          TaskApi.editReceipt(params).then(res => {
            let isSucc = res && !res.status;
            this.$platform.notification({
              type: isSucc ? 'success' : 'error',
              title: `编辑${isSucc ? '成功' : '失败'}`,
              message: !isSucc && res.message
            })
            this.pending = false;
          }).catch(err => console.error('err', err))
        })
        .catch(err => {
          this.pending = false;
        })
    }
  },
  async mounted() {
    try {
      let fields = await TaskApi.getTaskTemplateFields({ templateId: this.task.templateId, tableName: 'task_receipt' });

      this.fields = [
        ...fields,
        { displayName: '合计',
          fieldName: 'template',
          formType: 'text',
          isSystem: 1
        }
      ]

    } catch (e) {
      console.error('error ', e)
    }
  }
}
</script>

<style lang="scss">
.task-receipt-edit-container {
  .form-builder {
    padding: 10px 0;
  }

  .task-receipt-expense .item{
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eee;
    height: 42px;
    line-height: 42px;

    input.text-red {
      width: 100px;
      color: #dd4b39 !important;
    }
  }
}
</style>
