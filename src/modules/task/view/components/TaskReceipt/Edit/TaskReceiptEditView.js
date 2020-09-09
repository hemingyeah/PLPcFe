/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* mixin */
import ReceiptMixin from '../TaskReceiptMixin';

/* util */
import * as FormUtil from '@src/component/form/util';
import * as util from '@src/modules/task/util/receipt';
import _ from 'lodash';

/* enum */
import { TaskEventNameMappingEnum } from '@model/enum/EventNameMappingEnum.ts';

export default {
  name: 'task-receipt-edit-view',
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

      this.$nextTick(() => {
        this.$eventBus.$emit('task_receipt_update_editPrice', this.taskType);
      })
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
        .then(async valid => {

          if (!valid) return Promise.reject('validate fail.');

          const params = util.packToReceipt(this.fields, this.form);
          console.log(params, 777777)

          // 回访是否需要审批
          const result = await TaskApi.finishApproveCheck(params);
          if (!result.succ && result.message == '需要审批') {
            this.visible = false;
            this.pending = false;

            this.$emit('proposeApprove', result.data);
            return;
          }

          this.$eventBus.$emit(TaskEventNameMappingEnum.UpdateRecord);
          // this.pending = true;

          // TaskApi.editReceipt(params).then(res => {
          //   let isSucc = res && !res.status;
          //   this.$platform.notification({
          //     type: isSucc ? 'success' : 'error',
          //     title: `编辑${isSucc ? '成功' : '失败'}`,
          //     message: !isSucc && res.message
          //   })
          //   this.pending = false;
          // }).catch(err => console.error('err', err))
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