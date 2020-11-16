/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* image */
import ZFB_IMG from '@src/assets/img/task/pay.png';
import ZFB_QRCODE_IMG from '@src/assets/img/task/payOnline.png';
import WX_QRCODE_IMG from '@src/assets/img/task/weiChat.png';
import BANK_IMG from '@src/assets/img/task/bankCard.png';

import PAY_SUCCESS_IMG from '@src/assets/img/task/paySuccess.png';

export default {
  inject: ['initData'],
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      form: {},
      paymentInfo: {}
    }
  },
  computed: {
    /** 
    * @description 工单详情数据
    */
    task() {
      return this.initData?.task || {};
    },
    /** 
    * @description 回执设置
    */
    receiptConfig() {
      return this.initData.receiptConfig || {};
    },
    /** 
    * @description 工单类型设置
    */
    taskType() {
      return this.initData.taskType || {};
    },
    /** 
    * @description 非自定义回执
    * 默认工单且未开启自定义回执(老功能)
    */
    notCustom() {
      return !this.receiptConfig?.customReceipt && this.task.templateId == '1';
    },
    /** 
    * @description 显示备件
    */
    showSparepart() {
      let { showSparepart } = this.taskType?.options || {};
      return this.notCustom || (!this.notCustom && showSparepart);
    },
    /** 
    * @description 显示服务项目
    */
    showService() {
      let { showService } = this.taskType?.options || {};
      return this.notCustom || (!this.notCustom && showService);
    },
    /** 
    * @description 备件费用
    */
    sparepartTotal() {
      let { sparepart } = this.form;
      let total = 0;
      if (Array.isArray(sparepart)) {
        sparepart.forEach(item => {
          total += item.number * item.salePrice;
        })
      }

      return total.toFixed(2);
    },
    /** 
    * @description 服务费用
    */
    serviceTotal() {
      let { serviceIterm } = this.form;
      let total = 0;
      
      if (Array.isArray(serviceIterm)) {
        serviceIterm.forEach(item => {
          total += item.number * item.salePrice;
        })
      }

      return total.toFixed(2);
    },
    /** 
    * @description 费用总计
    */
    totalExpense() {
      let partExpense = Number(this.sparepartTotal);
      let serviceExpense = Number(this.serviceTotal);
      let disExpense = Math.abs(this.form.disExpense);

      return (partExpense + serviceExpense - disExpense).toFixed(2);
    },
    /** 
    * @description 费用合计数据
    */
    totalData() {
      let {sparepartTotal, serviceTotal, totalExpense } = this;
      let { disExpense } = this.form;
      
      return [{
        sparepartTotal,
        serviceTotal,
        disExpense,
        totalExpense
      }]
    },
    /** 
    * @description 是否支付成功
    */
    isPaySuccess() {
      return this.initData?.isPay || false;
    },
    /** 
    * @description 在线支付成功
    */
    payOnlineSuccess() {
      return this.isPaySuccess && this.paymentMethod == '在线支付-支付宝';
    },
    /**
    * @description 非自定义回执字段
    * 默认显示回执内容、系统附件、备件、服务项目
    */
    notCustomFields() {
      let { receiptAttNotNull, sparepartNotNull, serviceNotNull, receiptSignNotNull } = this.taskType?.options || {};

      return [{
        displayName: '回执内容',
        fieldName: 'receiptContent',
        formType: 'textarea',
        isNull: 0,
        isSystem: 1
      }, {
        displayName: '回执附件',
        fieldName: 'receiptAttachment',
        formType: 'receiptAttachment',
        isNull: receiptAttNotNull ? 0 : 1,
        isSystem: 1
      }, {
        displayName: '备件',
        fieldName: 'sparepart',
        formType: 'sparepart',
        isNull: sparepartNotNull ? 0 : 1,
        isSystem: 1
      }, {
        displayName: '服务项目',
        fieldName: 'serviceIterm',
        formType: 'serviceIterm',
        isNull: serviceNotNull ? 0 : 1,
        isSystem: 1
      }, {
        displayName: '客户签名',
        fieldName: 'systemAutograph',
        formType: 'systemAutograph',
        isNull: receiptSignNotNull ? 0 : 1,
        isSystem: 1
      }]
    }
  },
  methods: {
    /** 
    * @description 支付成功icon
    */
    getPaySuccessImg() {
      return PAY_SUCCESS_IMG;
    },
    /**
    * @description 获取支付方式对应icon
    */
    getPaymentMethodImg() {
      const imgConfig = {
        '在线支付-支付宝': ZFB_IMG,
        '支付宝收款码': ZFB_QRCODE_IMG,
        '微信收款码': WX_QRCODE_IMG,
        '银行卡收款': BANK_IMG
      }

      return imgConfig[this.paymentMethod] || '';
    },
    /**
    * @description 获取在线支付详情
    */
    getPaymentMethodDetail() {
      TaskApi.getPaymentDetail({taskId: this.task.id}).then(res => {
        if (res.success && res.result) {
          this.paymentInfo = res.result;
        }
      }).catch(err => console.error(err))
    }
  }
}
