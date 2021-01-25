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
import TableNameEnum from '@model/enum/TableNameEnum.ts';

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
      action: '',
      mode: TableNameEnum.TaskReceipt
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
    },
    /** 
    * @description 支付方式
    */
    paymentMethod() {
      let { state, attribute = {} } = this.task;
      let stateArr = ['finished', 'costed', 'closed', 'offed'];
      let paymentMethod = this.receiptData?.attribute?.paymentMethod || '';

      return stateArr.indexOf(state) > -1 ? attribute.paymentMethod : paymentMethod;
    },
    /** 
    * @description 显示支付方式
    */
    showPaymentMethod() {
      let { state, onceRollback } = this.task;
      let stateArr = ['finished', 'costed', 'closed', 'offed'];

      return (onceRollback < 1 || stateArr.indexOf(state) > -1) && this.paymentMethod;
    },
    /** 
    * @description 是否开启支付
    */
    openPay() {
      let { version, onlineAlipay } = this.initData?.paymentConfig || {};

      return version == 1 && onlineAlipay;
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

      // 自定义回执表单自定义字段length等于0时直接完成
      if (this.fields.length == 0) {
        let params = util.packToReceipt(this.fields, this.form);
        params = this.packFormat(params);
        this.finish(params);
        return;
      }

      this.init = true;
      this.action = action;
      this.visible = true;

      this.$nextTick(() => {
        let config = {
          editUnitPrice: this.taskType?.options?.editUnitPrice || false,
          isPaySuccess: this.isPaySuccess
        }

        this.$eventBus.$emit('task_receipt_update_config', config);
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

      let paymentMethod = this.isPaySuccess ? '在线支付-支付宝' : (this.task.state == 'processing' ? '' : this.paymentMethod);
      params.task.attribute['paymentMethod'] = paymentMethod || '';

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
        if (res.success) {
          this.$platform.notification({
            type: 'success',
            title: '暂存成功'
          })

          window.location.href = `/task/view/${this.task.id}`;
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
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
        .validate(false)
        .then(async valid => {

          if (!valid) return Promise.reject('validate fail.');

          let params = util.packToReceipt(this.fields, this.form);
          params = this.packFormat(params);

          this.pending = true;

          // 开启支付时判断支付状态
          if (this.openPay) {
            const data = await TaskApi.getPaymentOrder({taskId: this.task.id});
            if(data.success) {
              let statusArr = ['init', 'process', 'success'];
              let { status } = data.result;

              if(statusArr.indexOf(status) > -1 && statusArr.indexOf(status) < 2) {
                this.pending = false;
                this.$platform.alert('该工单正在支付中，请到售后宝移动端完成');
                return;
              }
            }
          }

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
      // 回访是否需要审批
      const result = await TaskApi.finishApproveCheck(util.packToReceipt(this.fields, this.form));
      if (!result.succ && result.message == '需要审批') {
        this.visible = false;
        this.pending = false;

        this.$emit('proposeApprove', result.data);
        return;
      }

      if (!await this.$platform.confirm('确认进行完成操作吗？')) return this.pending = false;

      TaskApi.finishTask(params).then(res => {
        if (res.success) {
          this.$platform.notification({
            type: 'success',
            title: '提交成功'
          })

          window.location.href = `/task/view/${this.task.id}`;
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
      if (!await this.$platform.confirm('确认进行编辑操作吗？')) return this.pending = false;

      TaskApi.editReceipt(params).then(res => {
        if (res.success) {
          this.$platform.notification({
            type: 'success',
            title: '编辑成功'
          })

          window.location.href = `/task/view/${this.task.id}`;
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    }
  },
  mounted() {
    // 在线支付成功
    if (this.payOnlineSuccess) this.getPaymentMethodDetail();
  },
  watch: {
    totalExpense(newValue) {
      // 折扣费用大于总价
      if (newValue < 0) this.form.disExpense = 0;
    }
  }
}