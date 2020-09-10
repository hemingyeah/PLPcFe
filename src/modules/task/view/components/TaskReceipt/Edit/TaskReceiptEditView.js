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
  props: {
    receiptFields: {
      type: Array,
      default: () => ([])
    }
  },
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
    * @description 回执自定义字段
    */
    fields() {
      return this.notCustom ? this.notCustomFields : this.receiptFields;
    },
    /** 
    * @description 回执详情数据
    */
    receiptData() {
      return this.initData?.receiptTaskForUpdate || {};
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
        task: this.receiptData,
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
    * @description 将回执数据格式化
    */
    packFormat(params) {
      if(!this.notCustom) params.task.attribute['customReceipt'] = true;

      let task = Object.assign({}, params.task);

      delete params.task;

      return Object.assign(params, task);
    },
    /**
    * @description 暂存
    */
    draft() {
      this.pending = true;

      const params = util.packToReceipt(this.fields, this.form);
      params.taskId = (params.task || {}).id;
      TaskApi.receiptDraft(params).then(res => {
        let isSucc = res && res.success;
        this.$platform.notification({
          type: isSucc ? 'success' : 'error',
          title: `暂存${isSucc ? '成功' : '失败'}`,
          message: !isSucc && res.message
        })

        this.pending = false;
      })
        .catch((err) => {
          this.pending = false;
        })
    },
    /**
    * @description 完成、编辑回执
    */
    submit() {
      this.$refs.form
        .validate()
        .then(valid => {

          if (!valid) return Promise.reject('validate fail.');

          let params = util.packToReceipt(this.fields, this.form);
          params = this.packFormat(params);

          if (this.action === 'edit') return this.editReceipt(params);

          this.finish(params);
        })
        .catch(err => {
          this.pending = false;
        })
    },
    /**
    * @description 完成
    */
    async finish(params) {
      this.pending = true;

      // 回访是否需要审批
      const result = await TaskApi.finishApproveCheck(params);
      if (!result.succ && result.message == '需要审批') {
        this.visible = false;
        this.pending = false;

        this.$emit('proposeApprove', result.data);
        return;
      }

      TaskApi.finishTask(params).then(res => {
        if (res.success) {
          window.location.reload();
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    },
    /**
    * @description 编辑回执
    */
    async editReceipt(params) {
      this.pending = true;

      TaskApi.editReceipt(params).then(res => {
        if (res.success) {
          window.location.reload();
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    }
  }
}